### 参考链接

* 在代码中的简单使用：https://firebase.google.com/docs/analytics/android/start/?authuser=0
* 项目配置：https://firebase.google.com/docs/android/setup?authuser=0
* 如何下载设置文件*google-services.json*：https://support.google.com/firebase/answer/7015592?hl=zh-Hans
* Firebase DebugView：https://firebase.google.com/docs/analytics/debugview?hl=zh-cn
* 自己的firebase demo 控制台：https://console.firebase.google.com/project/fir-demo-d3056/analytics/app/android:com.example.lithomas.firebase_demo/debugview%3Ft=1&cs=app.m.debugview.overview&g=1





## FireBase整合总结

###android配置：

1. 将google service加入到maven

```gr
buildscript {
    // ...
    dependencies {
        // ...
        classpath 'com.google.gms:google-services:4.0.1' // google-services plugin
    }
}

allprojects {
    // ...
    repositories {
        // ...
        google() // Google's Maven repository
    }
}
```

2. app/build.gradle 中添加依赖：

```groovy
apply plugin: 'com.android.application'

dependencies {
  // ...
  implementation 'com.google.firebase:firebase-core:16.0.1'
  
  // Getting a "Could not find" error? Make sure you have
  // added the Google maven respository to your root build.gradle
}
apply plugin: 'com.google.gms.google-services'
```

3. 要正式使用Firebase还要将我们这个app注册到Firebase，然后将它生成的设置文件google-services.json下载，放到android/app下。

   步骤：

   1. 登入Firebase，然后开启专案。
   2. 点击设定，然后选取[专案设定]。
   3. 在「您的应用程式」卡片中，从清单中选取您要下载设定档的应用程式的套件名称。
   4. 点击下载图标下载google-services.json


3. 在Activity中对FirebaseAnalytics 进行初始化

```java
private FirebaseAnalytics mFirebaseAnalytics;
@Override
public void onCreate(Bundle bundle) {
    mFirebaseAnalytics = FirebaseAnalytics.getInstance(this);
}
```

5. 对事件的记录

* bundle中的key和value可以自己指定

```java
Bundle bundle = new Bundle();
bundle.putString(FirebaseAnalytics.Param.ITEM_ID, id);
bundle.putString(FirebaseAnalytics.Param.ITEM_NAME, name);
bundle.putString(FirebaseAnalytics.Param.CONTENT_TYPE, "image");
mFirebaseAnalytics.logEvent(FirebaseAnalytics.Event.SELECT_CONTENT, bundle);
```

**note**:  但是由于Firebase的是通过google的gcm来进行推送，所以不是即时性的推送，而且也不是由app来决定什么时候把事件发送到firebase server。一般而言，android发送到firebase server需要1小时左右，而Firebase server显示到Firebase Console让我们看到，一般大于3小时左右。

所以，如果我们要尽快看到推送结果来进行验证，需要开启app的firebase debug开关，然后在Firebase Console中的Debug View中进行查看。

1. 要在 Android 设备上启用 Analytics“调试”模式，请执行以下命令：

```
adb shell setprop debug.firebase.analytics.app <package_name>
```

“调试”模式将保持启用状态，直至您通过执行以下命令明确停用“调试”模式：

```
adb shell setprop debug.firebase.analytics.app .none.
```

firebase debug view:

![firebase_debugview](E:\works\Note\res\firebase_debugview.png)


2. 在Log中看事件发送情况的设置：

```
adb shell setprop log.tag.FA VERBOSE
adb shell setprop log.tag.FA-SVC VERBOSE
adb logcat -v time -s FA FA-SVC
```
