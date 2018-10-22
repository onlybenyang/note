当我们需要获得系统服务的时候，就会使用*Context.getSystemService*来获得一个对应Service 的Manager。而因为Android内部的实现，所以获得的这个Manager是一个单例。

首先，理清下getSystemService的原理，然后列出一些常用的SystemService。

#### getSystemService原理

```mermaid
graph LR

ContextWrapperImpl(ContextWrapperImpl)-->ContextWrapper(ContextWrapper)
ContextWrapper(ContextWrapper)-->Context(Context)
```

我们最后可以在ContextWrapperImpl找到getSystemService的实现代码

```java
@Override
public Object getSystemService(String name) {
    return SystemServiceRegistry.getSystemService(this, name);
}
```

继续看SystemServiceRegistry code

```java
public static Object getSystemService(ContextImpl ctx, String name) {
    ServiceFetcher<?> fetcher = SYSTEM_SERVICE_FETCHERS.get(name);
    return fetcher != null ? fetcher.getService(ctx) : null;
}
```

不去纠结SYSTEM_SERVICE_FETCHERS的实现，ServiceFetcher就是一个装了我们想要的Manager的容器。而这些服务是什么时候装到这个容器的，看SystemServiceRegistry 的名称就就知道肯定是在这里进行的。注册 code 如下

```java
private static <T> void registerService(String serviceName, Class<T> serviceClass,
        ServiceFetcher<T> serviceFetcher) {
    SYSTEM_SERVICE_NAMES.put(serviceClass, serviceName);
    SYSTEM_SERVICE_FETCHERS.put(serviceName, serviceFetcher);
}
```

一段静态代码，在JVM加载这个类的时候就被执行。所以大概看getSystemService很简单。



#### 常用SystemService 

* [官方文档](https://developer.android.com/reference/android/content/Context)

##### 1. ActivityManager：与系统中正在运行的所有活动进行交互


获取方法：
 `ActivityManager activityManager= (ActivityManager) getSystemService(ACTIVITY_SERVICE);`  
 ActivityManager常用的方法：

*  `getRunningAppProcesses()`：获取系统中正在运行的所有的进程的信息。
*  `getRunningServices()`：获取系统中正在运行的所有的服务的信息。
*  `getMemoryInfo()`：获取系统内存信息。
*  `getDeviceConfigurationInfo()`：获取设备的配置属性。

##### 2. NotificationManager：通知用户发生的事件

获取方法：

`NotificationManager notificationManager= (NotificationManager) getSystemService(NOTIFICATION_SERVICE);`

一般常用方法：

* `notify()`: 有很多个重载方法，最重要的参数是Notification

##### 3. LocationManager：提供了系统位置服务的访问

获取LocationManager对象的方法:
 `LocationManager locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);`  
 LocationManager常用方法：

*  `getAllProviders()`：获取所有能提供位置服务的Provider
*  `getLastKnownLocation()`：获取上次开启位置服务记录的位置
*  `requestLocationUpdates()`：注册位置更新的监听者

##### 4. ConnectivityManager：关于网络连接状态的查询的类

获取ConnectivityManager方法：

`
ConnectivityManager connectivity = (ConnectivityManager) context  
                .getSystemService(Context.CONNECTIVITY_SERVICE);  
`

ConnectivityManager的主要作用是：

* 监视网络连接（Wi-Fi、GPRS、UMTS、等）
* 当网络连通性的变化发送广播意图
* 当连接的网络丢失，会自动连接别的网络
* 提供一个允许应用程序查询可用网络的粗粒度或细粒度的应用程序接口
* 提供一个允许应用程序请求和选择网络的应用程序的接口

常用代码:

```java
public static boolean isNetworkAvailable(Context context) {  
        ConnectivityManager connectivity = (ConnectivityManager) context  
                .getSystemService(Context.CONNECTIVITY_SERVICE);  
        if (connectivity != null) {  
            NetworkInfo info = connectivity.getActiveNetworkInfo();  
            if (info != null && info.isConnected())   
            {  
                // 当前网络是连接的  
                if (info.getState() == NetworkInfo.State.CONNECTED)   
                {  
                    return true;  
                }  
            }  
        }  
        return false;  
    }
```

