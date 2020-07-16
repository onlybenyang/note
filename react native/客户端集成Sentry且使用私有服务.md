

Sentry：一个开源的，支持客户端和服务端的日志平台。功能和管理平台UI上都很不错，且还在积极维护中。

Sentry提供的官方服务付费策略，免费版只能有限错误数，所以最好自己搭建Sentry服务。

Sentry本身支持react native平台，所以集成简单和查看错误日志支持sourcemap定位。（https://docs.sentry.io/platforms/react-native/），react native > 0.60的集成过程

* 安装： *npm install @sentry/react-native --save*
* 自动配置：*npx sentry-wizard -i reactNative -p ios android* 或 *yarn sentry-wizard -i reactNative -p ios android &&  cd iOS && pod install*
* 使用私有服务：当配置好私有服务后，需要更新App.js中DNS值，保证错误日志传到私有服务后台；然后更改**android/sentry.properties** 和 **ios/sentry.properties**中配置，指定错误和sourcemap上传的组织(organization)和项目(project)；还有最重要的url和auth.token，这两个属性决定sourceman是否能正确上传。*url就是浏览器sentry网址host；auth.token在user setting的 Auth Tokens中进行生成*

**sentry.properties**

```properties
defaults.url=host-url
defaults.org=organization-name
defaults.project=project-name
auth.token=xxxxxx
```



![image-20200716111714930](/Users/lilinyang/Library/Application Support/typora-user-images/image-20200716111714930.png)

配置好后就可以主动触发一下错误验证下服务是否可以收到错误信息以及是否可以通过sourcemap正确找到错误代码。

ps：在配置时为了不每次build iOS都上传sourcemap，可以在Xcode build phases修改**Upload Debug Symbols to Sentry**脚本，添加

```shell
if [ $CONFIGURATION == Release ]; then ... fi
```

