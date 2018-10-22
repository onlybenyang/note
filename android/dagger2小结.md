

### 配置 dagger2 到工程
* 根目录下的build.gradle
```shell
buildscript {
    dependencies {
        classpath 'com.neenbedankt.gradle.plugins:android-apt:1.8'
    }
}
```

* app下的build.gradle
```shell
apply plugin: 'com.neenbedankt.android-apt'
dependencies {
    apt 'com.google.dagger:dagger-compiler:2.4'
    compile 'com.google.dagger:dagger:2.4'
    provided 'org.glassfish:javax.annotation:10.0-b28' // @Inject的包
}
```

### dagger2工程的结构与使用
通常一个 dagger2 工程会用到 **@Inject, @Module, @Component, @Scope**这四个注解来对一些类来进行注入管理，来避免在使用它们的时候进行new的初始化操作。

最简单的使用： @Inject + @Component
* Dag.java
```java
public class Dag {
    String move;
    @Inject
    public Dag() {
        move = new String("run, run");
    }

    public String getMove() {
        return move;
    }
}
```

```java
/**
 *用@Component表示这个接口是一个连接器，
 *能用@Component注解的只能是interface或者抽象类
**/
@Component
public interface AnimalComponent {
    /**
     * 需要用到这个连接器的对象，就是这个对象里面有需要注入的属性
     * （被标记为@Inject的属性）
     * 这个方法名可以随意更改，但就用inject即可。
     */
    void inject(MainActivity activity);
}

```

* MainActivity.javax
```java
    @Inject
    Dag dag;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //dagger2生成的类，生成组件进行构造，并注入
        DaggerAnimalComponent.builder()
                .build()
                .inject(this);
        tv = (TextView) this.findViewById(R.id.text);
        tv.setText(dag.getMove());
```
屏幕上会显示 "run, run"，这种使用方法对于第三方我们无法在构造方法上添加注解和一些有多个构造方法的类中是无法使用的，对于一个类而言，**@Inject** 只能注解一个构造方法。所以这个时候，需要引入 **@Module** 来统一对可以注入类的模块化管理。

* AnimalModule.java
```java
//@Module注解表示这个类提供生成一些实例用于注入
@Module
public class AnimalModule {
    @Provides
    public Dag provideDag() {
        return new Dag();
    }
    /**
    * @Provides 注解表示这个方法是用来创建某个实例对象的，这里我们创建返回Cat对象
    * 方法名随便，一般用provideXXX结构
    * @return 返回注入对象
    */
    @Provides
    public Cat provideCat(String name) {
        return new Cat(name);
    }
}
```

修改 AnimalComponent.java
```java
//这里表示Component会从MainModule类中拿那些用@Provides注解的方法来生成需要注入的实例
@Component(modules = AnimalModule.class)
public interface AnimalComponent {
    void inject(MainActivity activity);
}
```
这样在 MainActivity.java 就可以注入使用Cat的对象了
* Cat.java
```java
public class Cat {
    String name;

    public Cat() {
        this.name = "None";
    }

    public Cat(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

Cat有两个构造方法，一个不带参，一个带参。当我们需要使用不带参的Cat来注入的时候，可以在 AnimalModule 中写
```java
    @Provides
    public Cat provideCat() {
        return new Cat();
    }
```
需要使用带参的Cat，不仅需要提供一个Cat的对象，还需要对Cat的参数进行注入，代码如下：
```java
    @Provides
    public Cat provideCat(String name) {
        return new Cat(name);
    }
    /**
    *这里提供了一个生成String的方法，在这个Module里生成Cat实例时，
    会查找到这里为上面提供String类型的参数
    **/
    @Provides
    public String provideString() {
        return "Jony";
    }
```
* Dagger2是先从@Privodes查找类实例，如果找到了就用@Module提供的方法来创建类实例，如果没有就从构造函数里用@Inject注解的生成类实例，如果二者都没有，则报错，简而言之，就是@Module的优先级高于@Inject。
* 在providePoetry(String)方法中，String这个参数也是要注入提供的，必须也要有在同一个连接器里面有提供，其中在构建类实例的时候，会按照以下顺序执行：
    1. 从Module中查找类实例创建方法
    2. Module中存在创建方法，则看此创建方法有没有参数
        1. 如果有参数，这些参数也是由Component提供的，返回步骤1逐一生成参数类实例，最后再生成最终类实例
        2. 如果无参数，则直接由这个方法生成最终类实例
    3. Module中没有创建方法，则从构造函数里面找那个用@Inject注解的构造函数
        1. 如果该构造函数有参数，则也是返回到步骤1逐一生成参数类实例，最后调用该构造函数生成类实例
        2. 如果该构造函数无参数，则直接调用该构造函数生成类实例

有了 @Inject, @Component, @Module 基本上注入的类就可以实现来使用了，但是被注入的类在注入这些对象来使用的时候，会遇到多次注入的情况（非单例模式）。如果我们对于一些类，希望用单例的方式来使用，**这个时候我们就会用到 @Scope 标记当前生成对象的使用范围，标识一个类型的注射器只实例化一次，在同一个作用域内，只会生成一个实例，然后在此作用域内共用一个实例。**
实现如下：
首先，自定义一个 @Scope 注解
```java
@Scope
@Retention(RetentionPolicy.RUNTIME)
public @interface ZooScope {
}
```

同时在Module与Component加上这个自定义Scope:

```java
@ZooScope
@Component(modules = AnimalModule.class)
public interface AnimalComponent {
    void inject(MainActivity activity);
}


@Module
public class AnimalModule {
    @ZooScope
    @Provides
    public Dag provideDag() {
        return new Dag();
    }

    @ZooScope
    @Provides
    public Cat provideCat(String name) {
        return new Cat(name);
    }
}
```
