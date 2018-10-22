# modal的使用

modal在react native 中可以看作是一个覆盖在最上层的窗口，当它出现时会占据所有的屏幕，且用户无法对下层的UI进行操作。这样看起来有些霸道，但也正因为无法操作下层的UI，我们可以随意定义modal上的UI和操作而不用担心影响到下层UI。所以，modal在我们的想象力下可以自定义成为许多自定义控件。

## 基本知识

1. Modal组件可以用来覆盖包含React Native根视图的原生视图。
2. 通过 **visible** 属性控制Modal组件是否出现
3. 在很多情况下需要使用 **transparent** 设置Modal的透明度.

透明度的设置： _先设置transparent={true},再在子根组件设置backgroundColor: 'rbga(0,0,0,0.5)'才可以达到预期效果_

1. 如果你的代码要在Android上运行，必须实现onRequestClose回调方法来说明在点击back键后Modal的行为。
2. 记得在 **state** 中保存Modal当前的 **visible** 情况。

## Modal可以自定义哪些东西

- 缩略图的全屏大图查看控件
- 一个Alert
- 一个自定义，复杂的dialog控件 ![modal dialog](http://images2015.cnblogs.com/blog/459873/201602/459873-20160229223956236-1761782240.png)
- 一个抽屉控件
- 一个下拉列表控件

_虽然Modal很厉害，但最好不要用它来实现一个通知控件，可以想象当一个通知来了，Modal做的通知控件蹦了出来，然后用户就没法做别的事了，而必须先移除这个通知，这不符合一个通知控件该有的设计_

--------------------------------------------------------------------------------

下面会实现一个简单的缩略图的全屏大图查看控件

```javascript
render() {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress = {() => this.setState({modalVisible: true})}>
                <View>
                    <Image
                        onPress = {() => this.setState({modalVisible: true})}
                        resizeMode='cover'
                        source={require('./AyaPolly.jpg')} />
                </View>
            </TouchableOpacity>
            <Modal
                animationType='fade'
                transparent={false}
                visible={this.state.modalVisible}
                onRequestClose={() => this.setState({modalVisible: false})}
            >
                <View
                    style = {styles.modalView}
                >
                    <Image
                        style = {styles.bigImage}
                        resizeMode='contain'
                        source={require('./AyaPolly.jpg')} />
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000'
    },
    bigImage: {
        flex:1,
        width: '100%'
    }
});
```
