# ScrollView
[API](http://reactnative.cn/docs/0.44/scrollview.html#content)
ScrollView是其中最简单的一个组件，它只是以列表的方式来显示子组件，并且只会render一次。对于很多应用场景而言这是不好的，当我需要渲染的数据data特别大，比如5000条数据的时候，我需要等待许久才能看到ScrollView中的东西，并且在我想要进行滑动的时候会感受到明显的卡顿。严重的时候android会ANR。
所以这一特点使得ScrollView一般只有在渲染数据量少的情况下才会使用。
**应用场景**：幻灯片，部分GridView，广告列表栏...
但有个场景ScrollView非常合适，当item中有很复杂的绘制，比如说有一个View的数组，那使用
ScrollView在滑动的时候就不会出现VIew数组重新render的情况，避免一些意想不到的UI问题

# ListView
[API](http://reactnative.cn/docs/0.44/listview.html#content)
这个组件的设计思路和ScrollView完全不同，ListView基于一个数据源，对数据源中的每一项数据调用renderRow进行render。并且不会一次性render所有数据，而是首先render屏幕上能看到的数据（假实现）。这样对于内存消耗和当数据量过大时避免卡顿有所帮助。基于这种设计，我们可以在renderRow中使用rowData为数据源再嵌套一个子ListView
**应用场景**：数据量多的list
## 缺点
1.该组件对于render数据的优化并不完全，一般而言，当数据量超过500+后且已经滑动到500+行，继续滑动屏幕会有明显卡顿，这是因为ListView的内部实现还是ScrollView，react-native的Listview确实就是在scrollView里面不断添加row，但row移出可见范围之外后依然还在scrollview里面，不像安卓和ios的在移出视野之外后可以继续被后面出来的row复用。。
2.需要绘制分隔线的时候，第一个元素的上面不会绘制分隔线。
3.当数据结构比较复杂的时候，比如[{"key":[{},{}...]}, {}...]的时候，默认的section解析方式就不能正确解析出你需要的数据，需要自己去定义getRowData()和getSectionHeader()来解析数据。
###有SectionHeader的默认数据结构:

![1485097-2482ce9c80424623.jpg](http://upload-images.jianshu.io/upload_images/5964931-05730a45ba2ce639.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


4.性能问题参考链接： 
[ListView renders all rows?](https://github.com/facebook/react-native/issues/499)
[ListView 性能问题](https://github.com/soliury/noder-react-native/issues/7)
5.因为FlatList的出世，ListView基本上就是过去式了。


# FlatList 
[API](http://reactnative.cn/docs/0.44/flatlist.html#content)
**核心原理** :  用户看不到的 items，就用空白代替，这样既节约内存，渲染又快。缺点就是，用户可能滚动太快，空白还没被渲染成真的 items，就被看见了。


在官方api中首先强调的就是这是一个**高性能的**组件。FlatList应该是实现了 真 ·只 render所见内容。因为FlatList是基于 [<VirtualizedList>](http://reactnative.cn/docs/0.44/virtualizedlist.html)组件进行的封装。所以有下面的问题需要注意
- 当某行滑出渲染区域之外后，其内部状态将不会保留。请确保你在行组件以外的地方保留了数据。
- 为了优化内存占用同时保持滑动的流畅，列表内容会在屏幕外异步绘制。这意味着如果用户滑动的速度超过渲染的速度，则会先看到空白的内容。这是为了优化不得不作出的妥协，而我们也在设法持续改进。
- 本组件继承自PureComponent而非通常的Component，这意味着如果其props在浅比较中是相等的，则不会重新渲染。所以请先检查你的renderItem函数所依赖的props数据（包括data
  属性以及可能用到的父组件的state），如果是一个引用类型（Object或者数组都是引用类型），则需要先修改其引用地址（比如先复制到一个新的Object或者数组中），然后再修改其值，否则界面很可能不会刷新。
- 默认情况下每行都需要提供一个不重复的key属性。也可以提供一个keyExtractor函数来生成key。

**由于上述Flatist做出的优化而会导致一个问题，如果在每个Item中有个从网络拿的Image，那么在list很长的情况下，底部的部分数据的Image可能永远都无法显示。**

**注意**  : 这里可以看到FlatList特性的解释和一个官方的例子 [FlatList Features & Example](https://github.com/facebook/react-native/commit/a3457486e39dc752799b1103ebe606224a8e8d32)


## 为什么使用FlatList而非ListView
首先是在大数据量的情况下，FlatList性能更好。其次，ListView和FlatList的使用方式基本一致，ListView很容易转换为FlatList。最后，FlatList对于app而言具有良好的扩展性