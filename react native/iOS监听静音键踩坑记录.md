

### iOS WKWebview静音键无效 & 监听静音键踩坑记录

需求：使用react-native-webiew加载一个cocos实现的h5游戏，当用户切换iphone的静音键的时候，h5游戏背景音乐和音效消失/继续播放

踩坑历程：
由于iOS开发不熟，基于Android开发经验，觉得有官方提供api，底层去封装一下监听api，提供接口到RN就可以迅速搞定这个需求；百度也发现有人说了怎样在iphone上实现监听静音键。觉得稳了~

坑：

1. react-native-webview 使用WKWebView，它是忽略静音键的状态的，不管开关，它始终都是有声音的。所以想着在APP中设置AVAudioSession category为ambient是没有效果的。所以只有尝试去监听静音键状态，半自动控制H5里面的声音。

2. 百度说的iOS监听静音键的的方法**AudioSessionGetProperty**在ios 7惨遭废弃，而且苹果没有提供新的方法来获取静音键状态。吐槽：iOS更新的速度太快了，苹果爸爸也是真的爸爸。还是贴一下曾经可以获取静音键状态的代码怀念一下曾经的美好岁月

```objective-c
- (BOOL)isMuted  
{  
    CFStringRef route;  
    UInt32 routeSize = sizeof(CFStringRef);  
  
    OSStatus status = AudioSessionGetProperty(kAudioSessionProperty_AudioRoute, &routeSize, &route);  
    if (status == kAudioSessionNoError)  
    {  
        if (route == NULL || !CFStringGetLength(route))  
            return TRUE;  
    }  
  
    return FALSE;  
}  
```



目前只有一种曲线救国的方法：利用AudioServicesPlaySystemSound 播放一段语音，播放之前获取当前时间，完成后走AudioServicesAddSystemSoundCompletion自定义block完成方法，获取 播放的时间（当前时间-之前获取的时间）>播放语音说明播放了，证明没有静音，否则静音。隔一段时间循环播放就能实现监听。（控制音频文件体积且没有声音）。代码参考 **react-native-silent-switch**库。这个库有点老，需要更新下RCTSilentSwitch来使用RN的RCTEventEmitter，否则消息传递不到RN层。

