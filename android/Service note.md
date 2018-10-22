1. Service不是分离开的进程，除非其他特殊情况，它不会运行在自己的进程，而是作为启动运行它的进程的一部分。

2. Service不是线程，这意味着它将在主线程里劳作。

**启动service有两种方法：**

1. Context.startService()

调用者与服务之间没有关联，即使调用者退出，服务仍可运行

2. Context.bindService()

调用者与服务绑定在一起，调用者一旦退出，服务也就终止



#### 进程生命周期

         当service运行在低内存的环境时，将会kill掉一下存在的进程。因此进程的优先级将会很重要：

1. 如果service当前正在执行onCreate、onStartCommand、onDestroy方法，主进程将会成为前台进程来保证代码可以执行完成避免被kill

2. 如果service已经启动了，那么主进程将会比其他可见的进程的重要性低，但比其他看不见的进程高。因为只有少部分进程始终是用户可见的，因此除非在极度低内存的时候，不然 service是不会被kill的。

3. 如果有客户端关联到service，那么service永远比客户端重要。也就是说客户端可见，那么service也可见（我理解这里的可见并不是可以看到，而是重要性，因为可见往往就表示重要性高）。

4. Service可以使用startForeground API将service放到前台状态。这样在低内存时被kill的几率更低，但是文档后面又写了，如果在极度极度低内存的压力下，该service理论上还是会被kill掉。但这个情况基本不用考虑。

         当然如果service怎么保持还是被kill了，那你可以通过重写onStartCommand返回变量来设置它的启动方式。比如：START_STICKY、START_REDELIVER_INTENT等等，前面已经讨论了它们的作用，这里就不再累赘了

* 另外：*service 的onCreate和onStartCommand 是运行在主线程的*，所以如果里面有处理耗时间的任务。两种处理：

1. 请将它们都挪到新的线程里。

2. 用系统提供的IntentService，它继承了Service，它处理数据是用自身新开的线程。

