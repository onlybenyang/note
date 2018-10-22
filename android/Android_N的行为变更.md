## 主要记录对code影响比较大的行为变化

### 工程瘦身：后台优化

为了优化内存使用和电量的消耗，Android N去掉了三个隐式的广播。这个改变对用户来说绝对一大利好，因为后台注册这些广播的app在后台会经常被拉起，自然而然会影响到设备性能进而影响用户体验（很不幸，对开发者来讲，又有一些trick被限制了）。比如[`CONNECTIVITY_ACTION`](https://link.jianshu.com?t=http://developer.android.com/reference/android/net/ConnectivityManager.html#CONNECTIVITY_ACTION)，在N之前的系统中，注册该广播的app在网络连接有变动时都会收到系统发出的广播，这样主进程被kill的app就可以复活了。此外还有[`ACTION_NEW_PICTURE`](https://link.jianshu.com?t=http://developer.android.com/reference/android/hardware/Camera.html#ACTION_NEW_PICTURE)
和 [`ACTION_NEW_VIDEO`](https://link.jianshu.com?t=http://developer.android.com/reference/android/hardware/Camera.html#ACTION_NEW_VIDEO)。
对于这三个广播，Android N具体做了如下的优化：

* `CONNECTIVITY_ACTION`：targetSdk为Android N的app如果在后台就无法收到该广播，即使你在manifest中做了相应配置，但如果app在前台，依然还是可以收到。
* `ACTION_NEW_PICTURE`和`CONNECTIVITY_ACTION`：这两个广播的优化会影响所有app，只要你的app运行在Android N系统的手机上，不管targetSdk是不是Android N，都会受到限制。

### 权限变更

Android N权限变化主要在于文件系统权限的更改，此外还有一个权限被废弃--`GET_ACCOUNTS`，在targetSdk为N的app中，系统将忽略`GET_ACCOUNTS`的请求，这里主要说下文件系统权限。

#### 文件系统权限的变化

只有将**targetSdkVersion**指定为N及N以后的版本才会有下面部分问题

为了提高私有文件的安全性，在**targetSdk**版本为N或者以后版本的app中，其私有目录将会限制访问。这可以防止私有文件元数据的泄露，比如文件大小或者是文件是否存在。但这给开发者带来了很多不利的影响：

* 文件的owner不能放宽文件权限，如果你使用[`MODE_WORLD_READABLE`](https://link.jianshu.com?t=http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_READABLE)
  或者 [`MODE_WORLD_WRITEABLE`](https://link.jianshu.com?t=http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_WRITEABLE)操作文件，将会触发[`SecurityException`](https://link.jianshu.com?t=http://developer.android.com/reference/java/lang/SecurityException.html)。
* 当你跨package域传递`file://`的URI时，接收者得到的将是一个无权访问的路径，因此，这将会触发`FileUriExposedException`。对于这类操作，官方推荐的方式是使用[`FileProvider`](https://link.jianshu.com?t=http://developer.android.com/intl/zh-cn/reference/android/support/v4/content/FileProvider.html)，当然你也可以使用`ContentProvider`。
  这里只看文字理解起来可能有点小困难，所以我将以调用系统拍照为例说明下：
  在targetSdk为Android N之前的系统版本时，你可以使用如下方法调用系统相机拍照并存入指定路径中。

```java
Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
Uri uri = Uri.fromFile(sdcardTempFile);
intent.putExtra(MediaStore.EXTRA_OUTPUT, uri);
```

**但是当你将targetSdk设置为`Android N`时**，很不幸，在执行到这段代码时app就crash了，crash的原因便是`FileUriExposedException`。OK，把代码修改下，使用`ContentProvider`方式传递uri，这样在Android N上便可以正常运行了。

```java
Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
ContentValues contentValues = new ContentValues(1);
contentValues.put(MediaStore.Images.Media.DATA, sdcardTempFile.getAbsolutePath());
Uri uri = context.getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues);
```

* [`DownloadManager`](https://link.jianshu.com?t=http://developer.android.com/reference/android/app/DownloadManager.html)不能再使用文件名共享私有存储文件了。老的应用程序可能会因为访问[`COLUMN_LOCAL_FILENAME`](https://link.jianshu.com?t=http://developer.android.com/reference/android/app/DownloadManager.html#COLUMN_LOCAL_FILENAME)而终止运行。targetSdk为N或者以后版本的app会在访问[`COLUMN_LOCAL_FILENAME`](https://link.jianshu.com?t=http://developer.android.com/reference/android/app/DownloadManager.html#COLUMN_LOCAL_FILENAME)时触发[`SecurityException`](https://link.jianshu.com?t=http://developer.android.com/reference/java/lang/SecurityException.html)。老的应用程序如果是通过 [setDestinationInExternalFilesDir(Context, String, String)]([http://developer.android.com/reference/android/app/DownloadManager.Request.html#setDestinationInExternalFilesDir(android.content.Context](https://link.jianshu.com?t=http://developer.android.com/reference/android/app/DownloadManager.Request.html#setDestinationInExternalFilesDir(android.content.Context), java.lang.String, java.lang.String)) 或者 [`setDestinationInExternalPublicDir(String, String)`]([http://developer.android.com/reference/android/app/DownloadManager.Request.html#setDestinationInExternalPublicDir(java.lang.String](https://link.jianshu.com?t=http://developer.android.com/reference/android/app/DownloadManager.Request.html#setDestinationInExternalPublicDir(java.lang.String), java.lang.String))将下载路径设置为公共存储区的话仍然可以访问`COLUMN_LOCAL_FILENAME`，但官方强烈不建议使用该方式了。更好的方式是通过 [`openFileDescriptor(Uri, String)`]([http://developer.android.com/reference/android/content/ContentResolver.html#openFileDescriptor(android.net.Uri](https://link.jianshu.com?t=http://developer.android.com/reference/android/content/ContentResolver.html#openFileDescriptor(android.net.Uri), java.lang.String))访问`DownloadManager`暴露出的文件。