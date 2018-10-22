# react native 的flex布局
## flex=1和flex=0（默认)有什么区别？
react native是基于flex容器进行设计的，当对component没有显式地设置flex的时候，flex=0，此时的component类似与android中的'content-wrap'，它的长和宽由自身的style来设置，或者在style没有设置长宽的时候由子组件的长宽来设置(包裹子组件)。

当flex=1且没有同级的组件，那它就会占满父组件或占满屏幕。flex>0时，它就是对一个组件大小权重的设置。

## 如何利用flexDirection和flexWrap实现一个GridView
首先，flexDirection代表子组件放置方向，可以设置'row'(按行放置)或者'column'(按列放置)；flexWrap代表子组件顺着轴线放置，当超过父组件的轴线时，是否进行换行('wrap'/'nowrap')。
为了实现一个GridView，可以使用React Native的ListView(FlatList)，因为只有当子组件超过父组件的轴线时才会换行，所以必须在renderRow中指定子组件的width。在最新的RN中，width和height都可以用百分比来表示，这对于屏幕适配更好，但实现GridView的时候，应该设置width再通过**aspectRatio**去设置height，这样才会达到预期的效果。如果width和height都去设置，会因为ListView的每个cell的height都被styles.grid限制了，使用百分比就达不到预期效果。（*styles.grid在styles.item的外层*）
```js
_renderRow() {
    return (
        <View
            style = {styles.item}
        />
    );
}

<ListView
    contentContainerStyle={styles.grid}
    dataSource={this.state.dataSource}
    renderRow={this._renderRow}
>
</ListView>

const styles = StyleSheet.create({
    grid: {
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    item:{
        width: 200
    }
});
```
所以，在flex的使用不必在每个组件中去写flex:1，也可以通过用百分比设置长宽，或者height/width+aspectRatio来写弹性组件。

## alighItem, justifyContent 和 alignSelf
这三个属性是设置组件排列顺序的，react native在flex容器有一个主轴和一个副轴，通过用这三个属性来指定组件分别向两个轴的哪个方向放置。
1. justifyContent 是管主轴方向子组件的排列顺序，在flex布局中，默认的flexDirection是'column'，所以主轴方向是'column'（y轴方向）。可以设置的参数：'flex-start', 'flex-end', 'center', 'stretch'(默认)

2. alighItem 是管副轴方向子组件的排列顺序(默认是x轴方向),可以设置的参数：'flex-start'(默认), 'flex-end', 'center', 'space-between', 'space-around'

3. alignSelf 是管副轴方向子组件的排列顺序(默认是x轴方向)，但它会覆盖父组件的alignItems，很强大很好用。可以设置的参数：'auto'(默认)，'flex-start', 'flex-end', 'center', 'stretch'(默认)

## 绝对布局 position: 'absolute'
在某些情况下需要一个组件固定在父组件的某一个位置上，躲开flexDirection的控制，这个时候，可以设置该组件的position: 'absolute'，此时，这个组件一样是占据了父组件的空间的。
那如果想要组件悬浮在父组件的某个指定位置，我们只需要设置**elevation**的值就可以让这个组件跑到父组件的上面，但要小心它会盖住父组件下面的内容。
