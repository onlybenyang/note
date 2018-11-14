Android 是基于Java的，很多时候可以用Java的思想来等同思考，但是却不能和Java程序直接一个Main函数就可以在里面随便new对象来用，像Activity，Service这些必须依靠一个context才可以创建。这是因为Android整体架构是基于组建的应用设计模式，像Activity，Service这些组件的运行需要一个完整的Android工程环境，每个组件就是这个环境中的一个场景，而Context就是这些场景的一些相关信息（也就是上下文环境）。

总结下，Context是维持Android程序中各组件能够正常工作的一个核心功能类。

*源码中的注释是这么来解释Context的：Context提供了关于应用环境全局信息的接口。*



####Context继承关系图：

![context_struct](E:\works\github\Note\res\context_struct.jpg)

* Context类本身是一个纯abstract类，它有两个具体的实现子类：ContextImpl和
* ContextWrapper。一个包装类而已，ContextWrapper构造函数中必须包含一个真正的Context引用，同时ContextWrapper中提供了attachBaseContext（）用于给ContextWrapper对象中指定真正的Context对象，调用ContextWrapper的方法都会被转向其所包含的真正的Context对象。
* ContextThemeWrapper类。内部包含了与主题（Theme）相关的接口，这里所说的主题就是指在AndroidManifest.xml中通过android：theme为Application元素或者Activity元素指定的主题。当然，只有Activity才需要主题，Service是不需要主题的，因为Service是没有界面的后台场景，所以Service直接继承于ContextWrapper，Application同理。
* ContextImpl类。真正实现了Context中的所有函数，应用程序中所调用的各种Context类的方法，其实现均来自于该类。

  **总结：Context的两个子类分工明确，其中ContextImpl是Context的具体实现类，ContextWrapper是Context的包装类。Activity，Application，Service虽都继承自ContextWrapper（Activity继承自ContextWrapper的子类ContextThemeWrapper），但它们初始化的过程中都会创建ContextImpl对象，由ContextImpl实现Context中的方法。**



#### Context作用域

![context_area](E:\works\github\Note\res\context_area.jpg)

1. 如果我们用ApplicationContext去启动一个LaunchMode为standard的Activity的时候会报错`android.util.AndroidRuntimeException: Calling startActivity from outside of an Activity context requires the FLAG_ACTIVITY_NEW_TASK flag. Is this really what you want?`这是因为非Activity类型的Context并没有所谓的任务栈，所以待启动的Activity就找不到栈了。解决这个问题的方法就是为待启动的Activity指定FLAG_ACTIVITY_NEW_TASK标记位，这样启动的时候就为它创建一个新的任务栈，而此时Activity是以singleTask模式启动的。所有这种用Application启动Activity的方式不推荐使用，Service同Application。
2. 在Application和Service中去layout inflate也是合法的，但是会使用系统默认的主题样式，如果你自定义了某些样式可能不会被使用。所以这种方式也不推荐使用。

  **总结：凡是跟UI相关的，都应该使用Activity做为Context来处理；其他的一些操作，Service,Activity,Application等实例都可以，当然了，注意Context引用的持有，防止内存泄漏。**



#### Context引起的内存泄露

这个是在开发中需要注意的问题，因为不同的context对象所在的场景的生命周期不一样，有些时候某个场景中的context对象已经被GC了，但这个场景还在使用这个context，so，oom出现了。

先写下正确使用Context的note：

使用Context的正确姿势：

1. 当Application的Context能搞定的情况下，并且生命周期长的对象，优先使用Application的Context。
2. 不要让生命周期长于Activity的对象持有到Activity的引用。
3. 尽量不要在Activity中使用非静态内部类，因为非静态内部类会隐式持有外部类实例的引用，如果使用静态内部类，将外部实例引用作为弱引用持有。

**两个使用Context造成OOM的例子**

**1. 错误的单例模式**

```java
public class Singleton {
    private static Singleton instance;
    private Context mContext;

    private Singleton(Context context) {
        this.mContext = context;
    }

    public static Singleton getInstance(Context context) {
        if (instance == null) {
            instance = new Singleton(context);
        }
        return instance;
    }
}
```

这是一个非线程安全的单例模式，instance作为静态对象，其生命周期要长于普通的对象，其中也包含Activity，假如Activity A去getInstance获得instance对象，传入this，常驻内存的Singleton保存了你传入的Activity A对象，并一直持有，即使Activity被销毁掉，但因为它的引用还存在于一个Singleton中，就不可能被GC掉，这样就导致了内存泄漏。

**2. View持有Activity引用**

```java
public class MainActivity extends Activity {
    private static Drawable mDrawable;

    @Override
    protected void onCreate(Bundle saveInstanceState) {
        super.onCreate(saveInstanceState);
        setContentView(R.layout.activity_main);
        ImageView iv = new ImageView(this);
        mDrawable = getResources().getDrawable(R.drawable.ic_launcher);
        iv.setImageDrawable(mDrawable);
    }
}
```

有一个静态的Drawable对象当ImageView设置这个Drawable时，ImageView保存了mDrawable的引用，而ImageView传入的this是MainActivity的mContext，因为被static修饰的mDrawable是常驻内存的，MainActivity是它的间接引用，MainActivity被销毁时，也不能被GC掉，所以造成内存泄漏。





参考：https://juejin.im/entry/573b27e7df0eea005e71c425