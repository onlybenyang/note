打开其他apk大体分为两种方式，一个是通过 包名去打开，一种是通过URI。但是由于URI需要第三方App设置了 URI协议，要通过URI打开必须知道第三方设置的URI是什么，局限还是比较大的。所以一般都是用URI去打开系统App，比如app商店(market://)， 电话(tel://)等。
####包名打开第三方App：
1. 最简单的方法
```java
Intent intent = new Intent("包名");
this.startActivity(intent);
```

2. 指定打开在AndroidManifest.xml中声明为MAIN的Activity，并根据Task affinity判断是不是在一个新activity task栈中push准备打开的app
```java
Intent intent = new Intent();
ComponentName comp = new ComponentName("com.linxcool","com.linxcool.PlaneActivity");
intent.setComponent(comp);
intent.setAction("android.intent.action.MAIN"); //参考 http://craftsman001.blog.51cto.com/9187002/1685847
intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);  //参考 http://blog.csdn.net/berber78/article/details/7278408
startActivity(intent);
```

3. 打开App前先检查是否安装
```java
public boolean isAppInstalled(Context context, String packageName) {
    try {
        context.getPackageManager().getPackageInfo(packageName, 0);
        return true;
    } catch (NameNotFoundException e) {
        return false;
    }
}

// 打开app store 对应app详情页去进行下载
public void goToMarket() {
    Uri uri = Uri.parse("market://details?id=" + packageName);
    Intent goToMarket = new Intent(Intent.ACTION_VIEW, uri);
    try {
       context.startActivity(goToMarket);
    } catch (ActivityNotFoundException e) {
    }
}

public void openApp(String packageName) {
    if (isAppInstalled(this, packageName)) {
        this.startActivity(packageName);
    } else {
        goToMarket(packageName);
    }
}
```

#### URI打开App
用来打开第三方App不常用，除非都是一个开发者，可以知道被打开的App配置的URI才能正确打开，所以URI的方式还是多用来打开系统App，打开代码都一样，只是URI不同
* 代码
```java
public void openAppByURI(String uri) {
    Uri uri = Uri.parse(uri);
    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
    try {
       context.startActivity(intent);
    } catch (ActivityNotFoundException e) {
    }
}
```
* 常用系统URI
1.显示地图： URI："geo:38.899533,-77.036476"
2. 路径规划： URI：""http://maps.google.com/maps?f=dsaddr=startLat%20startLng&daddr=endLat%20endLng&hl=en""
3. 播放多媒体
```java
Intent it = new Intent(Intent.ACTION_VIEW);
Uri uri =Uri.parse("file:///sdcard/song.mp3");
it.setDataAndType(uri,"audio/mp3");  // 指定多媒体类型才知道用什么打开
startActivity(it);
Uri uri =Uri.withAppendedPath(MediaStore.Audio.Media.INTERNAL_CONTENT_URI,"1"); //一般是存在内部存储空间的音频文件，通常不用这个。
Intent it = new Intent(Intent.ACTION_VIEW,uri);
startActivity(it);
```
4. **打开照相机**
```java
//1
Intent intent = new Intent("android.media.action.STILL_IMAGE_CAMERA"); //调用照相机
startActivity(intent);
//2
Intent i = new Intent(Intent.ACTION_CAMERA_BUTTON, null);
this.sendBroadcast(i);
//3
long dateTaken = System.currentTimeMillis();
String name = createName(dateTaken) + ".jpg";
fileName = folder + name;
ContentValues values = new ContentValues();
values.put(Images.Media.TITLE, fileName);
values.put("_data", fileName);
values.put(Images.Media.PICASA_ID, fileName);
values.put(Images.Media.DISPLAY_NAME, fileName);
values.put(Images.Media.DESCRIPTION, fileName);
values.put(Images.ImageColumns.BUCKET_DISPLAY_NAME, fileName);
Uri photoUri = getContentResolver().insert(
MediaStore.Images.Media.EXTERNAL_CONTENT_URI,values);

Intent inttPhoto = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
inttPhoto.putExtra(MediaStore.EXTRA_OUTPUT, photoUri);
startActivityForResult(inttPhoto, 10);
```














