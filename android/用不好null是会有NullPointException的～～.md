用不好null是会有NullPointException的～～

1.  null可以随便赋给引用的对象，而java中除了基本类型都是引用。

2.  null可以随便强转为任意类型，但类型需要继承了Object

3.  NullPointException来了：

```java
Integer obj_int = null;
int base_int = obj_int;   // NullPointException 
```
这个时候如果有个HashMap使用Integer作为键值也会出现NullPointException。

4.  使用*instanceof*检查null是不是某类型可以预防NullPointException,
```java
Integer iAmNull = null;
if(iAmNull instanceof Integer){
    System.out.println("iAmNull is instance of Integer");       
}else{
    System.out.println("iAmNull is NOT an instance of Integer");
}
```
输出： iAmNull is NOT an instance of Integer