

通知是Android中常用的一个消息显示方式，主要是面向用户的，但是现在部分国产手机会把新安装的app的通知权限默认关闭了，需要我们去检查是否app可以发送通知，不行的话需要通知用户去开启通知开关。

**实际上在uses-permission中并没有通知权限。**



### Android 3.0 (API level 11)之前做法

```java
NotificationManager mNotifyMgr = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
PendingIntent contentIntent = PendingIntent.getActivity(this, 0, new Intent(this, ResultActivity.class), 0);
//直接new Notification
Notification notification = new Notification(icon, tickerText, when);
notification.setLatestEventInfo(this, title, content, contentIntent);

mNotifyMgr.notify(NOTIFICATIONS_ID, notification);
```

### Android 3.0 (API level 11)及更高版本的做法

```java
NotificationManager mNotifyMgr = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
PendingIntent contentIntent = PendingIntent.getActivity(this, 0, new Intent(this, ResultActivity.class), 0);
// 通过Notification Builder来创建
Notification notification = new Notification.Builder(this)
            .setSmallIcon(R.drawable.notification_icon)
            .setContentTitle("My notification")
            .setContentText("Hello World!")
            .setContentIntent(contentIntent)
            .build();   // getNotification()  deprecated in API level 16

mNotifyMgr.notify(NOTIFICATIONS_ID, notification);
```

但是这种做法是不兼容Android 3.0之前的版本的

### 兼容Android 3.0之前的版本

```java
NotificationManager mNotifyMgr = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
PendingIntent contentIntent = PendingIntent.getActivity(this, 0, new Intent(this, ResultActivity.class), 0);
// 使用NotificationCompat来兼容3.0之前的版本
NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this)
            .setSmallIcon(R.drawable.notification_icon)
            .setContentTitle("My notification")
            .setContentText("Hello World!")
            .setContentIntent(contentIntent);

mNotifyMgr.notify(NOTIFICATIONS_ID, mBuilder.build());
```

这个是目前比较通用的一种做法。后面主要说这种做法的细节

对于一个通知而言，只需要三个最基础的东西：icon，content title，content text.而NotificationCompat会默认为我们设置优先级，显示时机 ，通知音频的输出方向。

* priority: PRIORITY_DEFAULT
* when: System.currentTimeMillis()
* audio stream: STREAM_DEFAULT



在代码看到的PendingIntent，是为了在用户点击了通知后，需要跳转到app的哪一个Activity去。其实也可以不是一个Activity，而是启动一个Service。



### 使用Notification需要用到的一些方法

####  更新通知

更新通知很简单，只需再次发送相同ID的通知即可，如果之前的通知依然存在则会更新通知属性，如果之前通知不存在则重新创建。

#### 取消通知

* 点击通知栏的清除按钮，会清除所有可清除的通知
* 设置了 setAutoCancel() 或 FLAG_AUTO_CANCEL的通知，点击该通知时会清除它
* 通过 NotificationManager 调用 cancel() 方法清除指定ID的通知
* 通过 NotificationManager 调用 cancelAll() 方法清除所有该应用之前发送的通知

#### 设置通知类型

* **大视图通知**

* **普通视图通知**

默认情况下为普通视图，可通过`NotificationCompat.Builder.setStyle()`设置大视图。

*注: 大视图(Big Views)由Android 4.1(API level 16)开始引入，且仅支持Android 4.1及更高版本。*

#### 在通知上设置进度条

```java
mBuilder = new NotificationCompat.Builder(this);
new Thread(
    new Runnable() {
        @Override
        public void run() {
            int incr;
            for (incr = 0; incr <= 100; incr+=5) {
                mBuilder.setProgress(100, incr, false);
                mNotifyManager.notify(id, mBuilder.build());
                try {
                    // Sleep for 5 seconds
                    Thread.sleep(5*1000);
                } catch (InterruptedException e) {
                    Log.d(TAG, "sleep failure");
                }
            }
            mBuilder.setContentText("Download complete")//下载完成           
                    .setProgress(0,0,false);    //移除进度条
            mNotifyManager.notify(id, mBuilder.build());
        }
    }
).start();
```

`setProgress(0, 0, true)`设置不确定的进度条

#### **浮动通知(Heads-up Notifications)**

Android 5.0(API level 21)开始，当屏幕未上锁且亮屏时，通知可以以小窗口形式显示。用户可以在不离开当前应用前提下操作该通知。

以下两种情况会显示浮动通知:

* setFullScreenIntent()，如上述示例。
* 通知拥有高优先级且使用了铃声和振动

#### **锁屏通知**

Android 5.0(API level 21)开始，通知可以显示在锁屏上。用户可以通过设置选择是否允许敏感的通知内容显示在安全的锁屏上。
你的应用可以通过`setVisibility()`控制通知的显示等级:

* VISIBILITY_PRIVATE : 显示基本信息，如通知的图标，但隐藏通知的全部内容
* VISIBILITY_PUBLIC : 显示通知的全部内容
* VISIBILITY_SECRET : 不显示任何内容，包括图标

### **保留Activity返回栈**

#### **常规Activity**

默认情况下，从通知启动一个Activity，按返回键会回到主屏幕。但某些时候有按返回键仍然留在当前应用的需求，这就要用到`TaskStackBuilder`了。

1、在manifest中定义Activity的关系

```xml
Android 4.0.3 及更早版本
<activity
    android:name=".ResultActivity">
    <meta-data
        android:name="android.support.PARENT_ACTIVITY"
        android:value=".MainActivity"/>
</activity>

Android 4.1 及更高版本
<activity
    android:name=".ResultActivity"
    android:parentActivityName=".MainActivity">
</activity>
```

2、创建返回栈PendingIntent

```java
Intent resultIntent = new Intent(this, ResultActivity.class);
TaskStackBuilder stackBuilder = TaskStackBuilder.create(this);
// 添加返回栈
stackBuilder.addParentStack(ResultActivity.class);
// 添加Intent到栈顶
stackBuilder.addNextIntent(resultIntent);
// 创建包含返回栈的pendingIntent
PendingIntent resultPendingIntent =
        stackBuilder.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT);

NotificationCompat.Builder builder = new NotificationCompat.Builder(this);
builder.setContentIntent(resultPendingIntent);
NotificationManager mNotificationManager =
    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
mNotificationManager.notify(id, builder.build());
```

上述操作后，从通知启动ResultActivity，按返回键会回到MainActivity，而不是主屏幕。

#### **特殊Activity**

默认情况下，从通知启动的Activity会在近期任务列表里出现。如果不需要在近期任务里显示，则需要做以下操作:

1、在manifest中定义Activity

```xml
<activity
    android:name=".ResultActivity"
    android:launchMode="singleTask"
    android:taskAffinity=""
    android:excludeFromRecents="true">
</activity>
```

2、构建PendingIntent

```java
NotificationCompat.Builder builder = new NotificationCompat.Builder(this);
Intent notifyIntent = new Intent(this, ResultActivity.class);

// Sets the Activity to start in a new, empty task
notifyIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

PendingIntent notifyPendingIntent =
        PendingIntent.getActivity(this, 0, notifyIntent, PendingIntent.FLAG_UPDATE_CURRENT);

builder.setContentIntent(notifyPendingIntent);
NotificationManager mNotificationManager =
    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
mNotificationManager.notify(id, builder.build());
```

上述操作后，从通知启动ResultActivity，此Activity不会出现在近期任务列表中。



#### **常见的Flags**

* FLAG_AUTO_CANCEL
  当通知被用户点击之后会自动被清除(cancel)
* FLAG_INSISTENT
  在用户响应之前会一直重复提醒音
* FLAG_ONGOING_EVENT
  表示正在运行的事件
* FLAG_NO_CLEAR
  通知栏点击“清除”按钮时，该通知将不会被清除
* FLAG_FOREGROUND_SERVICE
  表示当前服务是前台服务