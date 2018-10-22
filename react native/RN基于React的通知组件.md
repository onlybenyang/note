## 为什么要做一个不用原生控件的通知

目前React Native的通知控件都会涉及使用到原生控件，但是需要知道IOS的通知行为非常麻烦，需要客户端发送通知给apple server，再由apple server发送通知给客户端显示在通知栏。这个行为会有一些不确定因素：网络不稳定，通知延时等。

所以，如果降低通知组件的要求：
1. 不要求app在退出前台后仍然能够收到通知。
2. 不需要通知显示在通知栏

但这个自定义通知组件仍然需要遵循其他通知应该有的特性：
1. 出现通知时，用户仍然可以对app进行操作
2. 用户可以手动去除通知
3. 用户可以通过点击通知，触发一些行为
4. 可以同时收到多条通知，并且用户可以分别触发对应的行为
  看到第一点要求就果断抛弃Modal，但看了react native官方提供的组件，没有能满足这个要求组件。

## react native 的 console.warn()
根据上面的综合需求，发现平时最常用到的 console.warn() 就非常满足了这些的需求。
通过源码查看RN是如何实现console.warn.

### RN源码
- YellowBox.js 对warn这个组件的具体实现
- AppContainer.js RN的人口，初始化RN界面（其中包含开发者code的界面）

利用js的console的warn来获得报错信息。然后通过一个ScrollView来显示一个WarningRow(带TouchableHightlight的View)的数组。

YellowBox.js
``` js
render() {
    if (console.disableYellowBox || this.state.warningMap.size === 0) {
      return null;
    }
    const ScrollView = require('ScrollView');
    const View = require('View');

    const {inspecting, stacktraceVisible} = this.state;
    const inspector = inspecting !== null ?
      <WarningInspector
        warningInfo={this.state.warningMap.get(inspecting)}
        warning={inspecting}
        stacktraceVisible={stacktraceVisible}
        onDismiss={() => this.dismissWarning(inspecting)}
        onDismissAll={() => this.dismissWarning(null)}
        onMinimize={() => this.setState({inspecting: null})}
        toggleStacktrace={() => this.setState({stacktraceVisible: !stacktraceVisible})}
      /> :
      null;

    const rows = [];
    this.state.warningMap.forEach((warningInfo, warning) => {
      if (!isWarningIgnored(warning)) {
        rows.push(
          <WarningRow
            key={warning}
            count={warningInfo.count}
            warning={warning}
            onPress={() => this.setState({inspecting: warning})}
            onDismiss={() => this.dismissWarning(warning)}
          />
        );
      }
    });

    const listStyle = [
      styles.list,
      // Additional `0.4` so the 5th row can peek into view.
      {height: Math.min(rows.length, 4.4) * (rowGutter + rowHeight)},
    ];
    return (
      <View style={inspector ? styles.fullScreen : listStyle}>
        <ScrollView style={listStyle} scrollsToTop={false}>
          {rows}
        </ScrollView>
        {inspector}
      </View>
    );
  }
```
通过YellowBox.js知道，RN只是用View来显示warning信息的，*但是它又是怎么做到显示在UI的最上层，并且不影响其他UI组件的操作呢？*
通过读源码，看到在AppContainer.js中YellowBox作为组件被使用。
``` js
render(): React.Element<*> {
   let yellowBox = null;
   if (__DEV__) {
     const YellowBox = require('YellowBox');
     yellowBox = <YellowBox />;
   }

   return (
     <View style={styles.appContainer} pointerEvents="box-none">
       <View
         collapsable={!this.state.inspector}
         key={this.state.mainKey}
         pointerEvents="box-none"
         style={styles.appContainer} ref={(ref) => {this._mainRef = ref;}}>
         {this.props.children}
       </View>
       {yellowBox}
       {this.state.inspector}
     </View>
   );
 }
```
通过上面代码，可以看到RootView是由开发者的View（this.props.children），YellowBox（warning）和inspector（猜测是摇一摇后出现的devtool列表）。
看到这里就明白RN是通过在把YellowBox作为RootView的一个第二级的子view，再加上一个elevation实现 *在UI的最上层，并且不影响其他UI组件的操作* 这个要求。

## 实现步骤
下载实现一个通知控件的步骤就比较清晰了：
- 实现一个简单的view组件
- 将notificationView添加到RootView，作为第二级View
- 实现一个‘开关’变量控制notificationView的显示与消失
  如果要实现console.warn随调随用，需要再实现一个proxy达到notificationView中各种回调方法的封装和对外调用接口的实现（隐藏notificationView中各种方法的具体实现）。
