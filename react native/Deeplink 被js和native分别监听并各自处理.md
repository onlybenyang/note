#### Deeplink 被js和native同时监听并正确处理

看标题觉得不明觉厉，因为RN的js部分都在一个MainActivity，其他native页面时另外的activity；而一个Deeplink在一个app中被两个Activity监听到，并且可以各自处理，这基本是不可能的事情。因为在浏览器打开一个 deeplink 的app时如果有2个Activity注册了去监听，那么会让你去选择一个来打开这个deeplink，被选的那个会被唤醒去处理link。

所以要做到这一点，需要一个中间层的actvity去监听deeplink，然后根据在后台时是React所在的MainActivity还是Native其他Activity来决定 从中间层Activity往哪个Activity进行跳转。当然，没有在后台的话，就根据情况看link需要显示的页面是js的还是native的来进行跳转。这就是一个有其他native actitvity的React Native的App应对deeplink的思路。大概思路很简单，但实际实现会遇到很多问题。

#### react navigation 的 deeplink不能处理这种复杂的情况

react navigation 可以监听到MainActivity的deeplink，并且可以根据uriPredix来提取所需的link信息；但是它只适用与纯RN项目。所以直接放弃react navigation对deeeplink的处理

####怎么在显示完deeplink页面后，返回到正确的页面

##### 前提：

* App的Launch Activity是RN的MainActivity

* link page是react page

##### 情景

app在后台：这种情况比较复杂，要分为在MainActivity还是在其他 Native Activity

**MainActivity**： 这个时候无法确定用户是在react的哪个页面的，我们需要保证用户浏览link page后，能返回到之前曾浏览的react page。这就需要原本的MainActivity不能被销毁，并且LinkModuleActivity 跳转的MainActivty也必须是原本的MainActivty。这就要保证这个任务栈中只有一个MainActivty，综合这种情况，singleTop，singleTask，singleInstance都是可选的，但考虑到singleInstance会让MainActivity在另外一个新的 Task Stack；而singleTask和singleTop很相似，但后续考虑到LinkModuleActivity的一些特殊情况，这里需要使用singleTask，保证栈内只有唯一的MainActivity；当让，如果选择设置为别的，那么在LinkModuleActivity就需要设置initent flag为FLAG_ACTIVITY_CLEAR_TOP。

**其他Native Activity**： 在这种情况下，因为link page是在react，所以会创建一个MainActivity在栈顶，这个时候如果LinkModuleActivity在栈内的话，当我singleTop的MainActivity出现的时候，就会盖住LinkModuleActivity和之前的其他Native Activity（包含MainActivity）。这样任务栈出现了意料外的MainActivity又有多余的LinkModuleActivity，所以，这个时候，把LinkModuleActivity设置为singleInstance就很必要了，需要让它单独待一个栈里去。但是这样又会在deep link唤醒LinkModuleActivity后，在手机的Recently Task中显示出来，所以要在AndroidManifest.xml中给它设置个android:excludeFromRecents="true"，再设置个android:noHistory="true"，让它跳转后就被销毁。 

这样也存在问题，退出link page后，会直接显示react 的home页面。这样就没法完美避免了。



app未启动：这是最简单的情况，直接由中间层的LinkModuleActivity 跳转到 MainActivity就行，然后在react中使用RN提供的Linking的getInitialURL来监听是不是由deep link 唤醒的，然后直接jump 到 link page。这里要注意getInitialURL的promise返回的url会始终为undefined，需要从LinkModuleActivity 中的监听方法中传递正确deeplink url给react来进行跳转。



#### 怎么告知react 的link page正确的deep link url

这个有很多方法，广播，EventBus，回调都可以把link url传递给react link page。

