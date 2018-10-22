React Native官网在原生模块通信只提供了 String 类型的示例。网上也没有其他数据类型通信的demo。

**@ReactMethod** 注明的方法支持的从 Java传到JS 的参数类型如下，它们会被转为对于的js类型：
```
java -> js:
Boolean -> Bool
Integer -> Number
Double -> Number
Float -> Number
String -> String
Callback -> function
ReadableMap -> Object
ReadableArray -> Array
```
*ReadableMap* 和 *ReadableArray* 可以把java的字典和数组数据传到js，js拿到的分别是Obeject和array，js的Object都是{}形式的。
只是ReadableMap和ReadableArray都只能使用getXX()方法获得信息，不能在java层写入数据。
查看源码后发现还有 *WritableMap* 和 *WritableArray* 分别继承了ReadableMap和ReadableArray，且都提供了putXX()和pushxx()来让我们写入数据。

在java使用这两个**WritableMap**和**WritableArray**来传递比较复杂的数据。
