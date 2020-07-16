执行 **aapt dump badging xxx.apk** 可以查看apk的基本信息

react native Android会默认添加几个权限，其中有几个会认为是和用户隐私有关的“危险权限”。在不需要使用的时候需要显式去掉。（国家审核越发严格）

```xml
<!--移除react native自动加入的权限-->
    <uses-permission tools:node="remove" android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission tools:node="remove" android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission tools:node="remove" android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission tools:node="remove" android:name="android.permission.ACCESS_COARSE_LOCATION" />
```



执行 **aapt d resources xxx.apk** 查看各种资源的类型及id（R.java文件）

