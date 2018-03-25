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
//背景色
Window w = this.getWindow();
w.setBackgroundDrawable(new ColorDrawable(Color.parse("#6E000000")))
  
 
```

