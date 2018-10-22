#### 相关网站：

[基础、全面java知识](https://www.cnblogs.com/absfree/p/5568849.html)
[高级java知识](https://blog.csdn.net/hp_yangpeng/article/details/79406099)

#### 

* #### 基础

1. 抽象：接口和抽象类—>接口和抽象类的区别

2. 继承：关键字extends，java是单继承的，每个类只能继承一个父类，所有类都是由Object的子类。

3. 封装：没啥好说的，面向对象基础

4. 多态性： 上面这几个和C++的面向对象思想是一样的

5. 访问修饰符public,private,protected,以及不写（默认）时的区别。

6. String 不是最基本的数据类型，基本类型有8个：int, byte, short, long, float, double, char, boolean。

7. Java里面只有3种数据(对象)类型：基本类型，枚举类型，引用类型

8. float f=3.4;是否正确？


   答：不正确， 3.4是双精度数，将双精度型（double）赋值给浮点型（float）属于下转型（down-casting，也称为窄化）会造成精度损失，因此需要强制类型转换float f =(float)3.4; 或者写成float f =3.4F;

9. short s1 = 1; s1 = s1 + 1;有错吗?

   答：有错，因为 1是int类型，s1+1的结果也是int类型，需要对结果进行类型转换才能赋值给s1：s1=(short) s1+1;

10. Java有goto作为保留字，但无法使用。目前C还在用，但因为安全性和可读性差的问题，java已经废弃了。

11. int和Integer有什么区别？

    答：类似的题：double和Double，float和Float等。int是基本数据类型，而Integer是对int的封装，可以让java对基本类型也可以当做对象来使用（java是面向对象语言）。

12. switch能作用的数据类型：byte, short, char, int, enum（枚举），记住long和String是不行的，其他类的对象也是不行的。

13. 构造器（contructor）不可以被重写，但可以重载。也就是说构造方法前不能有 @Override的标记。

14. == 和 equals()的区别：这个要记住

    答：==比较的是两个对象的引用是不是一样的，所以一般用 == 比较的是基本数据类型；而equals比较的两个对象的hashcode，而根据java对这一块的解释是，hashcode一样的对象一定equals，但是有相同的hashcode的对象不一定equals。因为hashcode和equals两个方法是可以被重写的。

15. String类是final类，不可以被继承

16. String和StringBuilder、StringBuffer的区别？偶尔考，稍微有点印象就行

    答：Java平台提供了两种类型的字符串：String和StringBuffer/StringBuilder，它们可以储存和操作字符串。其中String是只读字符串，也就意味着String引用的字符串内容是不能被改变的。而StringBuffer/StringBuilder类表示的字符串对象可以直接进行修改。StringBuilder是Java 5中引入的，它和StringBuffer的方法完全相同，区别在于它是在单线程环境下使用的，因为它的所有方面都没有被synchronized修饰，因此它的效率也比StringBuffer要高。

17. 重载（Overload）和重写（Override）的区别

    答：方法的重载和重写都是实现多态的方式，区别在于前者实现的是编译时的多态性，而后者实现的是运行时的多态性。重载发生在一个类中，同名的方法如果有不同的参数列表（参数类型不同、参数个数不同或者二者都不同）则视为重载；重写发生在子类与父类之间，重写要求子类被重写方法与父类被重写方法有相同的返回类型，比父类被重写方法更好访问，不能比父类被重写方法声明更多的异常（里氏代换原则）。重载对返回类型没有特殊的要求。

18. char 型变量中能不能存贮一个中文汉字，为什么?

    答：char类型可以存储一个中文汉字，因为Java中使用的编码是Unicode（不选择任何特定的编码，直接使用字符在字符集中的编号，这是统一的唯一方法），一个char类型占2个字节，所以放一个中文是没问题的。

19. 静态嵌套类(Static Nested Class)和内部类（Inner Class）的不同？

    答：Static Nested Class是被声明为静态（static）的内部类，它可以不依赖于外部类实例被实例化。它是在类build加载的时候就会被初始化。而通常的内部类需要在外部类实例化后才能通过对象来使用。




* #### 高级

1. 线程池


2. 同步锁

3. HashMap 和 ConcurrentHashMap

4. JVM加载class文件的原理机制

   答：JVM中类的装载是由类加载器（ClassLoader）和它的子类来实现的，Java中的类加载器是一个重要的Java运行时系统组件，它负责在运行时查找和装入类文件中的类。
   由于Java的跨平台性，经过编译的Java源程序并不是一个可执行程序，而是一个或多个类文件。当Java程序需要使用某个类时，JVM会确保这个类已经被加载、连接（验证、准备和解析）和初始化。类的加载是指把类的.class文件中的数据读入到内存中，通常是创建一个字节数组读入.class文件，然后产生与所加载类对应的Class对象。加载完成后，Class对象还不完整，所以此时的类还不可用。当类被加载后就进入连接阶段，这一阶段包括验证、准备（为静态变量分配内存并设置默认的初始值）和解析（将符号引用替换为直接引用）三个步骤。最后JVM对类进行初始化，包括：1)如果类存在直接的父类并且这个类还没有被初始化，那么就先初始化父类；2)如果类中存在初始化语句，就依次执行这些初始化语句。
   类的加载是由类加载器完成的，类加载器包括：根加载器（BootStrap）、扩展加载器（Extension）、系统加载器（System）和用户自定义类加载器（java.lang.ClassLoader的子类）。从Java 2（JDK 1.2）开始，类加载过程采取了父亲委托机制（PDM）。PDM更好的保证了Java平台的安全性，在该机制中，JVM自带的Bootstrap是根加载器，其他的加载器都有且仅有一个父类加载器。类的加载首先请求父类加载器加载，父类加载器无能为力时才由其子类加载器自行加载。JVM不会向Java程序提供对Bootstrap的引用。下面是关于几个类加载器的说明：

   * Bootstrap：一般用本地代码实现，负责加载JVM基础核心类库（rt.jar）；
   * Extension：从java.ext.dirs系统属性所指定的目录中加载类库，它的父加载器是Bootstrap；
   * System：又叫应用类加载器，其父类是Extension。它是应用最广泛的类加载器。它从环境变量classpath或者系统属性java.class.path所指定的目录中记载类，是用户自定义加载器的默认父加载器。

5. Java 中会存在内存泄漏

   答：理论上Java因为有**垃圾回收机制（GC）**不会存在内存泄露问题（这也是Java被广泛使用于服务器端编程的一个重要原因）；然而在实际开发中，可能会存在无用但可达的对象，这些对象不能被GC回收，因此也会导致内存泄露的发生。例如Hibernate的Session（一级缓存）中的对象属于持久态，垃圾回收器是不会回收这些对象的，然而这些对象中可能存在无用的垃圾对象，如果不及时关闭（close）或清空（flush）一级缓存就可能导致内存泄露。下面例子中的代码也会导致内存泄露。还有一些输入流输出流都是需要close的，因为它们都有可能导致内存泄漏（OOM）

   ​

   ​