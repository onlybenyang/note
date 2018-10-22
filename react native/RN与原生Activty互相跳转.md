RN可看作是一个特殊的Activity，它的View由React类型的标签来表达，但大部分React标签使用的还是原生的Native控件，这大概就是他为啥叫React Native的原因吧。

既然RN可以看作是一个Activity，那么Android中Activity之间的跳转通常用intent来实现。

### RN —> Android

因为要调用到Intent去做Activity之间的跳转，所以需要在Native提供一个调用Intent的ReactMethod给JS使用，这样JS触发相应方法后RN所在的特殊Activity就会被新的Activity压到栈下面。

要让RN和Android可以通信，Native需要从上到下去添加一个bridge来建立通信，bridge的层次依次是： MainApplication—>ReactPackage—>ReactContextBaseJavaModule—>Native Code

ok，接下来就code table：

1.  MainApplication因为implements ReactApplication，所以会有getReactNativeHost返回一个ReactNativeHost对象，我们只需要在ReactNativeHost对象中添加我们的ModulePackage就可以了。

MainApplication.java

```java
private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.asList(
            new ModulePackage()
        );
    }
};

@Override
public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
}
```

2.  实现一个ModulePackage implements ReactPackage，去实现createNativeModules方法，将自己的ReactModule类放进去。

ModulePackage.java

```java
@Override
public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(
            new ReactModule(reactContext)
        );
    }
```

3.  实现 ReactModule extends ReactContextBaseJavaModule，重写getName，getConstants方法，在实现一个@ReactMethod方法给JS调用就好。

```java
public class ReactModule extends ReactContextBaseJavaModule {
    public AppUtilsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        return super.getConstants();
    }

    @Override
    public String getName() {
        return "IntentModule";
    }

    @ReactMethod
    public void startTheActivity() {
        Context context = getCurrentActivity();
        Intent intent = new Intent(context, SomeActivity.class);
        context.startActivity(intent);
    }
}
```

这样就完成了Native的bridge，后面只要在JS中使用NativeModules.IntentModule.startTheActivity()就可以跳转到Native的SomeActivity。



至于Android —>RN，如果是需要跳转到RN指定页面，具体没有代码实现，但有个思路是，通过调用一个有参数的ReactMethod，可以通过回调方法把Native的数据传回给JS，这样JS拿到data后根据data用navigator去跳转到指定页面。这样只要在原生代码处调用以下代码：

```java
Intent intent = new Intent(SomeActivity.this, ReactModule.class);
intent.putExtra("data", "homeview");
startActivity(intent);
```

就可以在ReactModule处通过getIntent().getStringExtra("data")获得数据，传给JS，实现跳转。

这个没有实验过，似乎可以通过JS

