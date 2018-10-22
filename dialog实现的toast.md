##用dialog实现一个全局可自定义toast

最近有一个变态需求，做一个toast，可以点击后消失，可以在使用的时候分情况设置位置，颜色，大小。额，你确定这是我熟悉的Android的toast？光是可以点击消失就让我明白什么toast.setView()来自定义一个Toast啥的就是痴心妄想。好吧，想了想还是只有把dialog伪装一下，任重道远啊！

dialog进化为toast有几个有下面几个步骤：

+ 去掉dialog的标题栏
+ 背景色可以自定义
+ 显示时间可以进行设定
+ 出现位置可以自定义
+ 可以设置大小



看起来事情多，挺麻烦的，一步步来。

去掉标题栏直接调用 requestFeature(WINDOWS_NO_TITLE) 就可以了。

设置 timeout 只需要用Handler来处理就可以了。



背景色，位置，大小都和dialog所在的window有关，要用 getWindow()来设置。

```java
//先去掉dialog的标题栏
requestWindowFeature(Window.FEATURE_NO_TITLE);
Window w = this.getWindow();
//位置
w.setGravity(Gravity.BOTTOM);
// 大小
WindowManager.LayoutParams layoutParams = toastWindow.getAttributes();
layoutParams.width = WindowManager.LayoutParams.MATCH_PARENT;
w.setAttributes(layoutParams);
//背景色
w.setBackgroundDrawable(new ColorDrawable(Color.parse("#6E000000")))
```

这样一写，发现基本的UI都写好了，但是怎么做到让它在Activity跳转后依然显示，并且显示的时候不阻挡页面上其他组件的触摸行为就比较难了。

```java
/**
** 让dialog所属的window变成系统级的，这样就可以跨Activity显示,需要额外在AndroidManifest.xml中
** 加上<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />  
**/
w.setType(WindowManager.LayoutParams.TYPE_SYSTEM_ALERT);
//有FLAG_DIM_BEHIND，dialog后面的view会变暗，所以需要clearFlags清除掉
w.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
//让dialog所在的window不接收touch事件，这样后面的页面的触摸行为就不会受到影响
w.addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL);
```

[Window的Flags参考表](https://www.2cto.com/kf/201608/534957.htmlhttps://www.2cto.com/kf/201608/534957.html)

似乎忘了toast最重要的timeout了，因为这个类是继承的Dialog，那么重写show就可以你，代码摆起：

```java
private final Handler mHandler = new Handler();
private int mTimeout = -1;
//
@Override
public void show() {
    // 没有设置Timeout就会一直显示，除非按下close按钮
    if (mTimeout != -1) {
        mHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (isShowing()) {
                    dismiss();
                }
            }
        }, mTimeout);
    }
    super.show();
}

public void setTimeout(int timeout) {
    mTimeout = timeout;
    return this;   // 只是为了链式调用方便些
}
```

基本上代码这块就好了，大小，位置，背景色也可以想timeout一样，有需要的话给个set方法就搞定。最后贴上layout xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/toast_view"
    android:layout_width="match_parent"
    android:layout_height="30dp"
    android:orientation="horizontal">

    <TextView
        android:id="@+id/toast_text"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:layout_gravity="center_vertical"
        android:layout_marginLeft="16dp"
        android:textSize="14sp"
        android:textColor="@color/colorPrimary"
        android:fontFamily="Roboto-Regular"
        android:text="hello, world" />

    <！-- 一个close按钮-->
    <ImageView
        android:id="@+id/toast_cancel"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center_vertical"
        android:src="@mipmap/template_btn_close_toast"
        android:visibility="invisible"/>

</LinearLayout>

```

