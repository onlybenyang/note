DeepLink主要是为了增加用户量的一个技术，主要是可以通过浏览器，短信，Email等信息中的url可以打开我们的app，如果没有安装的话会提示去安装一个的。

这本来是Android和iOS都有的一个技术，所以这其实是一个Native端的技术，而react navigation只是对它的发送过来的uri进行了处理。

Android使用deeplink，只需要在特定的Activity注册一个有schema和host（最少需要这两个参数）的<intent-filter>就可以了，然后就可以在那个Activity中通过getIntent拿到这个uri。这套方法放到react native 上唯一的变化就是特定的Activity就是React所依附的，继承了ReactActivity的那个天选者。

Android要收到deeplink并被唤醒，首先需要在AndroidManifest.xml中的<Activity>注册<intent-filter>。如下

```xml
<activity
          android:name=".MainActivity"
          android:screenOrientation="portrait"
          android:label="@string/app_name"
          android:launchMode="singleTask"
          android:exported="true"
          android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:pathPattern="/.*/apps/.*" />
                <data android:host="apps.xxx.com" />
                <data android:host="apps.xxx.cn" />
            </intent-filter>
</activity>
```

**Note**:

* 必须配置"android.intent.category.BROWSABLE"才能通过浏览器打开app
* lauchMode 最好设置成 singleTask，避免出现多个MainActivity，同时React Native的特殊性，这样可以让React依赖的Activity在一个单独的任务栈，这样在其他Activity中收到了deeplink，可以正常显示React页面，而另一个任务栈也不存在了。
* 除了设置schema和host最好也把path设置好，设置path可以通过 [ path | pathPrefix | pathPattern ]进行设置，这样可以更加精确地指定某个格式的uri才能通过deep link 唤醒app。

基本上这样配置好，就可以在Android中获得到数据了，代码也很简单：

```java
Intent intent = getIntent();
Uri data = intent.getData();
Log.w("ok", data.getSchema() + data.getHost() + data.getPathSegments()[0]);
```

#### React Navigation

但如果想在react navigation中使用还有事情要做，首先，对使用Navigation的地方增加一个uriPrefix属性的设置来过滤出uri中的需要的path。

```react
<Navigation
    ref = {nav => window.navigation = nav}
    uriPrefix = { /(?:http|https):\/\/apps\W*\w*\.(?:cn|com)\/apps\// }
    />

Object.assign(Navigation.router, {
    getActionForPathAndParams(path, params) {
        let appId = getAppIdFromUrl(path);
        let pageParams = {'app': {'id': appId}}
        if (wakeFromBackground) {
            return NavigationActions.push({
                routeName: "DeepLinkDemo",
                params: {...pageParams}
            });
        } else {
            return NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                    routeName: "DeepLinkDemo",
                    params: {...pageParams}
                })]
            });
        }
    }
})
```

这样使得在 getActionForPathAndParams(path, params) 中能获得https://apps.xxx.com/apps/{id}后面的id信息作为path。而我们对getActionForPathAndParams进行实现可以做到在不同条件下，通过deeplink唤醒app，react navigation如何到达指定页面，可以像平常那样push或者navigate，也可以reset，让那个页面成为根路由。

当然 uriPrefix并不只是为了让我们可以选择跳转方式而设计的，我们可以为 DeepLinkDemo 配置path这个属性，而只要uriPrefix过滤出来的id为“Demo”，就可以匹配到我们的配置，然后打开DeepLinkDemo 这个页面。配置代码：

```react
createAppContainer(createStackNavigator({
    DeepLinkDemo: {
            screen: DeepLinkDemoPage,
            path: "Demo",
            navigationOptions:  {
            	header: null
            }
    }
})
    
```



#### React Native

至于在React Native中使用Deeplink，可以直接集成 react navigation 来简单使用【一般没有Native页面和复杂的需求】，也可以使用 React Native 的Linking组件来实现复杂的业务逻辑。

用Linking方法如下：

```react
// app没有启动，deeplink启动app时触发，在后台时不会触发
Linking.getInitialURL()
    .then(url => {
    if (url) {
        this.isDeepLinkingStart = true;
    }
});

// app在后台，deeplink启动app时触发，第一次启动app不会触发
Linking.addEventListener('url', ({url}) => {
    if (url) {
        this.isDeepLinkingStart = true;
    }
});
```

因为这是RN自己组件去监听底层的intent，没有经过react navigation，所以这个时候获得url时没有经过react navigation处理，是 *schema://host/path* 这样的完整url. 这样做的好处就是不会受限与react navigation，让整个deeplink的跳转更加受我们控制。