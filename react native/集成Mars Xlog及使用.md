Xlog是mars的日志文件功能，由于它的实现方式是C++，所以支持iOS和android跨平台使用。写入日志文件的方式是**使用流式方式对单行日志进行压缩，压缩（加密）后写进作为 log 中间 buffer的 mmap 中**，优势：

1. 流式方式写入日志，不会出现日志丢失
2. 由于mmap的使用使得写入速度快速且不会造成内存负担
3. 压缩：LZ77编码 + 单行日志同步flush模式huffman压缩，压缩率（83%）

**基于这些技术，实现了一个完美的日志系统：流畅性 完整性 容错性 安全性**

xlog技术官方链接：https://mp.weixin.qq.com/s/cnhuEodJGIbdodh0IxNeXQ

集成过程简单记录：（https://github.com/Tencent/mars#mars_cn）

* 保存 log 的目录请使用单独的目录，不要存放任何其他文件防止被 xlog 自动清理功能误删

Android：

app.build.gradle

```groovy
dependencies {
    compile 'com.tencent.mars:mars-xlog:1.2.3'
}
```

MainActivity.java

```java
System.loadLibrary("c++_shared");
System.loadLibrary("marsxlog");

final String SDCARD = Environment.getExternalStorageDirectory().getAbsolutePath();
final String logPath = SDCARD + "/marssample/log";

// this is necessary, or may crash for SIGBUS
final String cachePath = this.getFilesDir() + "/xlog"

//init xlog
if (BuildConfig.DEBUG) {
    Xlog.appenderOpen(Xlog.LEVEL_DEBUG, Xlog.AppenderModeAsync, cachePath, logPath, "MarsSample", 0, "");
    Xlog.setConsoleLogOpen(true);

} else {
    Xlog.appenderOpen(Xlog.LEVEL_INFO, Xlog.AppenderModeAsync, cachePath, logPath, "MarsSample", 0, "");
    Xlog.setConsoleLogOpen(false);
}

Log.setLogImp(new Xlog());

// 程序退出时关闭日志
@override
public void onDestroy() {
    Log.appenderClose();
}
```



iOS

git clone xlog项目，执行python build_ios.py生成iOS项目所需的framework（mars/libraries/mars_android_sdk/jni ）

项目如果是基于oc的

AppDelegate.mm

```objective-c
// 初始化xlog
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    NSString* logPath = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0] stringByAppendingString:@"/log"];

    // set do not backup for logpath
    const char* attrName = "com.apple.MobileBackup";
    u_int8_t attrValue = 1;
    setxattr([logPath UTF8String], attrName, &attrValue, sizeof(attrValue), 0, 0);

    // init xlogger
    #if DEBUG
    xlogger_SetLevel(kLevelDebug);
    appender_set_console_log(true);
    #else
    xlogger_SetLevel(kLevelInfo);
    appender_set_console_log(false);
    #endif
    appender_open(kAppednerAsync, [logPath UTF8String], "Test",  0, "");
}

// 反初始化xlog
- (BOOL)application:(UIApplication *)application applicationWillTerminate {
 	 appender_close();
}
```



项目基于swift参考github xlog库的samples/iOS/XloggerSwiftDemo进行配置。

配置成功后，可以通过*python decode_mars_nocrypt_log_file.py xxx.xlog* 解析出xxx.xlog.log文件进行查看（不加密，且python version需要大于2.7.10）

