System.exit(0)：终止当前正在运行的 Java 虚拟机，结束app的主进程。参数用作状态码；根据惯例，非 0 的状态码表示异常终止。System.exit(0)正常终止程序，有时候在退出安卓应用会使用到。
如果app中有一个service，在执行System.exit(0)时service还存在，那么会发现过一会这个Service在被销毁后又被重启了。如果这个Service中用到了主线程的对象（资源），那么就很容易发生NullPointException。
而这个Service被重启的原因是因为在onStartCommand中返回了默认值START_STICKY（1），可以通过把返回值修改为START_NOT_STICKY来防止Service重启。

1. START_STICKY:粘性
       当Service因*内存不足而被系统kill后，一段时间后内存再次空闲时，系统将会尝试重新创建此Service，一旦创建成功后将回调onStartCommand方法，但其中的Intent将是null，除非有挂起的Intent，如pendingintent，这个状态下比较适用于不执行命令、但无限期运行并等待作业的媒体播放器或类似服务*。
2. START_NOT_STICKY:不粘性
       *当Service因内存不足而被系统kill后，即使系统内存再次空闲时，系统也不会尝试重新创建此Service。除非程序中再次调用startService启动此Service，这是最安全的选项，可以避免在不必要时以及应用能够轻松重启所有未完成的作业时运行服务*。
3. START_REDELIVER_INTENT:重新传送Intent
       *当Service因内存不足而被系统kill后，则会重建服务，并通过传递给服务的最后一个 Intent 调用 onStartCommand()，任何挂起 Intent均依次传递。与START_STICKY不同的是，其中的传递的Intent将是非空，是最后一次调用startService中的intent。这个值适用于主动执行应该立即恢复的作业（例如下载文件）的服务。*



除了上述的方法可以解决这个问题外，在使用Service时也可以通过避免使用外部app的对象和及时调用stopService或者在Service中调用stopSelf；其实直接在Serivce的onDestroy中调用System.exit(0)也可以。

* Service存在于主进程，所以最好不要在Service中进行耗时操作，不过可以在Service中用一个Thread，Service中的Thread与Activity的Thread相比更好些，不依赖于UI的存在。



参考链接：

1. [Android Service 解析](http://zy77612.iteye.com/blog/1292649)
2. [System.exit(0)后服务重启](https://blog.csdn.net/qq_34723470/article/details/73349363)
3. [Android中bindService的使用及Service生命周期](https://blog.csdn.net/iispring/article/details/48169339)

