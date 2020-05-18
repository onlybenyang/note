#### Android多渠道打包工具
Android 要发应用宝，OPPO，vivo，华为，小米，抖音5个渠道，神策会记录不同渠道的激活情况。note：由于应用宝上传的包需要乐固加固后才可以，所以会直接给每个渠道包进行一次加固。
##### 渠道包生成流程
构建release apk包 —> 上传乐固加固，下载加固且签名后的apk -> 使用walle工具生成多个渠道包
##### walle 工具使用
Android使用的是walle-cli-all.jar来生成渠道包，文件在MathApp/android/walle-cli.all.jar，为了方便使用，mac可以在.bash_alias配置别名来方便使用，参考如下：
```bash
alias wallefile='java -jar [项目路径]/MathApp/android/walle-cli-all.jar batch -f'
alias walle='java -jar [项目路径]/MathApp/android/walle-cli-all.jar'
alias walleshow='java -jar [项目路径]/MathApp/android/walle-cli-all.jar show'
```
**生成渠道包命令：**wallefile   [项目路径]/android/channel.txt    [源apk包路径]    [生成的文件夹路径]
**查看渠道包信息：**walleshow  [apk路径]



####乐固加固工具

**软件下载地址**： https://console.cloud.tencent.com/ms/reinforce/tool

**登录账号及secret**

id: AKIDXxGNK66K0Wq0NdukaFiz61lJj051ORt9 

secret: FNLMQPFuMphPvEKG1Zv67wZ5RefVBi2C

配置加密证书，若不配置，则下载加固后的apk后本地加密。

加密中选择V1+V2就可以进行加固了 

![legu加固](/Users/lilinyang/work/github/note/数感星球/legu加固.png)





