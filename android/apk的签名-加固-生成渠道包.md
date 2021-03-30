



###1. 加固：加固后apk需要重新签名

* 方法一：上传[腾讯云加固网站](https://cloud.tencent.com/login?s_url=https%3A%2F%2Fconsole.cloud.tencent.com%2Fms%2Findex#)就可以加固，成功后下载apk重新签名

    * 方法二：实现[python版腾讯云api](https://cloud.tencent.com/document/sdk/Python)，使用脚本上传加固，下载加固好的apk到本地

  Python实现上传apk到阿里云，加固，下载加固包.

   ```sh
  # 安装Python sdk
  pip3 install tencentcloud-sdk-python
   ```
  
  
  
  ```python
  from tencentcloud.common import credential
  from tencentcloud.common.exception.tencent_cloud_sdk_exception import TencentCloudSDKException
  # 导入对应产品模块的 client models。
  from tencentcloud.ms.v20180408 import ms_client, models
  
  # 导入可选配置项
  from tencentcloud.common.profile import client_profile
  from tencentcloud.common.profile.http_profile import HttpProfile
  
  import oss2
  import hashlib
  import os
  import time
  import urllib.request
  import sys
  import math
  
  # 本地的要加固apk的路径，计算md5值作为加固参数
  ApkPath = "./app-release.apk"
  # 线上要加固apk的url，不需要认证即可访问
  APKUrl=""
  LeguSecretId=""
  LeguSecretKey=""
  
  
  time_stamp_str = time.strftime("%Y-%m-%d_%H-%M-%S", time.localtime())
  aliyun_access_key_id = ''
  aliyun_access_key_secret = ''
  aliyun_endpoint = 'https://oss-cn-beijing.aliyuncs.com'
  aliyun_bucket_name = 'zyj-bj'
  cdn_url = ''
  cdn_apk_file_path="static/fhc2020_test/"
  
  # 获取本地apk文件的MD5值
  def getFileMd5(filePath):
      md5=None
      if os.path.isfile(filePath):
          f=open(filePath, 'rb')
          md5_obj=hashlib.md5()
          while True:
              d = f.read(8096)
              if not d:
                  break
              md5_obj.update(d)
          hashCode=md5_obj.hexdigest()
          f.close()
          md5=str(hashCode).lower()
          return md5
  
  # 上传apk到cdn
  def upload(name, path):
      global aliyun_access_key_id, aliyun_access_key_secret, aliyun_endpoint, aliyun_bucket_name, cdn_url, cdn_apk_file_path, time_stamp_str
      remote_path = cdn_apk_file_path + name
      auth = oss2.Auth(aliyun_access_key_id, aliyun_access_key_secret)
      bucket = oss2.Bucket(auth, aliyun_endpoint, aliyun_bucket_name)
      bucket.put_object_from_file(remote_path, path)
      remote_path = "%s%s" % (cdn_url, remote_path)
      print("上传oss位置：{0}".format(remote_path))
      print('finish', time_stamp_str)
      return remote_path
  
  
  # 开始上传加固
  def leguStart():
      global APKUrl, ApkPath, LeguSecretId, LeguSecretKey
      print("--开始上传apk到oss--")
      APKUrl = upload("apk-release-{0}.apk".format(time_stamp_str), './app-release.apk')
      print('--开始加固--, oss path = {0}'.format(APKUrl))
      cred = credential.Credential(LeguSecretId, LeguSecretKey)
      httpProfile = HttpProfile()
      httpProfile.endpoint="ms.tencentcloudapi.com"
  
      clientProfile=client_profile.ClientProfile()
      clientProfile.httpProfile=httpProfile
  
      client =ms_client.MsClient(cred, '', clientProfile)
  
      appInfo = models.AppInfo()
      appInfo.AppUrl=APKUrl
      appInfo.AppMd5=getFileMd5(ApkPath)
  
      serviceInfo =  models.ServiceInfo()
      serviceInfo.ServiceEdition = "basic"
      serviceInfo.SubmitSource = "RDM-rdm"
      serviceInfo.CallbackUrl = ""
  
      req = models.CreateShieldInstanceRequest()
      req.AppInfo = appInfo
      req.ServiceInfo = serviceInfo
  
      resp =client.CreateShieldInstance(req)
      queryLeguResult(resp.ItemId)
      # Progress任务状态: 1-已完成,2-处理中,3-处理出错,4-处理超时
      print("加固处理中:" + resp.to_json_string())
  
  # 显示下载加固后的apk的下载进度
  def showDownloadProgress(a,b,size):
      per=100*a*b/size
      per=round(per, 2)
      if per>100:
          per=100
      if per % 20 ==0:
          print("下载进度：{0}%".format(per))
          sys.stdout.write("\r")
  
  # 下载加固后的apk文件到当前目录：app-release_legu.apk
  def downloadFile(url):
      global APKUrl
      localApkFileName = APKUrl.split("/")[-1]
      print("oss apk 路径 "+APKUrl)
      print("准备从{0}下载加固成功的{1}到本地".format(url, localApkFileName))
      urllib.request.urlretrieve(url, localApkFileName, showDownloadProgress)
  
  # 每隔10秒查询加固状态
  def queryLeguResult(itemId):
      taskStatus = 2
      while taskStatus == 2:
          print('\n')
          cred = credential
          cred = credential.Credential(LeguSecretId, LeguSecretKey)
          httpProfile = HttpProfile()
          httpProfile.endpoint="ms.tencentcloudapi.com"
  
          clientProfile=client_profile.ClientProfile()
          clientProfile.httpProfile=httpProfile
  
          client =ms_client.MsClient(cred, '', clientProfile)
  
          params="{\"ItemId\":\"" + itemId + "\"}"
          req = models.DescribeShieldResultRequest()
          req.from_json_string(params)
          print("20s后查询加固状态："+params+'\n')
          time.sleep(20)
          try:
              resp = client.DescribeShieldResult(req)
          except TencentCloudSDKException as e:
              print("error = {0}".format(e.message))
          resp = client.DescribeShieldResult(req)
  
          taskStatus=resp.TaskStatus
          gDownloadApkPath = resp.ShieldInfo.AppUrl
          print(resp.to_json_string()+'\n')
  
      if (taskStatus == 1):
          print("加固成功下载地址:" +gDownloadApkPath+"\n")
  
        print("开始下载->")
          downloadFile(gDownloadApkPath)
      else:
          print("加固失败\n")
  
if __name__ == "__main__":
      leguStart()
  ```
  
  

###2. 签名：使用apksigner进行签名和签名检查

* 签名命令： apksigner sign --ks [keystore_file_path] --ks-key-alias [keystore_alias_name] --ks-pass pass:[keystore_alias_password] --key-pass pass:[keystore_password] --out [signed_apk_path]  [nosigned_apk_path]
* 签名检查命令：apksigner verify -v --print-certs [signed_apk_path]
* 命令apksigner 需要设置环境变量，把android sdk目录下/build-tools/目录设置到PATH中

###3. 生成渠道包

使用美团的[walle](https://github.com/Meituan-Dianping/walle/blob/master/README.md)作为渠道包生成工具。

##### walle 工具使用

使用walle-cli-all.jar来生成渠道包，文件在MathApp/android/walle-cli.all.jar，为了方便使用，可以在.bash_alias配置别名来方便使用，参考如下：

```bash
alias wallefile='java -jar [项目路径]/android/walle-cli-all.jar batch -f'
alias walle='java -jar [项目路径]/android/walle-cli-all.jar'
alias walleshow='java -jar [项目路径]/android/walle-cli-all.jar show'
```

**生成渠道包命令：**wallefile   [项目路径]/android/channel.txt    [源apk包路径]    [生成的文件夹路径]
**查看渠道包信息：**walleshow  [apk路径]

