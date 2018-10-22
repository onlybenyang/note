拦截器是一个非常强大的机制，可以**监视，重写和重试call**（request和response）。

这样可以用来很多网络请求问题：

*   监视网络：获得网络请求过程中的connection，url，headers等数据


*   重写请求：处理签名认证需要动态给予accessToken和accessSecret等问题
*   重试：。。。。



调用chain.proceed(request)是每个拦截器实现的一个主要部分。这个简单的方法是HTTP工作发生，产出满足请求的响应之处，

拦截器可以链接，OkHttp使用列表来跟踪拦截器，并且拦截器按顺序被调用。



### 监视网络的简单实现：

```java
class LoggingInterceptor implements Interceptor {
  @Override public Response intercept(Interceptor.Chain chain) throws IOException {
    Request request = chain.request();

    long t1 = System.nanoTime();
    logger.info(String.format("Sending request %s on %s%n%s",
        request.url(), chain.connection(), request.headers()));

    Response response = chain.proceed(request);

    long t2 = System.nanoTime();
    logger.info(String.format("Received response for %s in %.1fms%n%s",
        response.request().url(), (t2 - t1) / 1e6d, response.headers()));

    return response;
  }
}
```

```java
OkHttpClient client = new OkHttpClient.Builder()
    .addInterceptor(new LoggingInterceptor())
    .build();

Request request = new Request.Builder()
    .url("http://www.publicobject.com/helloworld.txt")
    .header("User-Agent", "OkHttp Example")
    .build();

Response response = client.newCall(request).execute();
response.body().close();
```



输出：

```java
INFO: Sending request http://www.publicobject.com/helloworld.txt on null
User-Agent: OkHttp Example

INFO: Received response for https://publicobject.com/helloworld.txt in 1179.7ms
Server: nginx/1.4.6 (Ubuntu)
Content-Type: text/plain
Content-Length: 1759
Connection: keep-alive
```



可以看到请求的时候网址是*http://www.publicobject.com/helloworld.txt*，但是在response看到的request的url是*https://publicobject.com/helloworld.txt*，这说明请求进行了一次重定向。

上面的输出是使用应用拦截器后的输出结果，比较简单，不会有重定向访问的call的数据，使用网络拦截器会有更详细的网络请求的输出（包含重定向的）。

#### 网络拦截器

网络拦截器就是把*addInterceptor()*换成*addNetworkInterceptor()*。

替换后的输出：

```java
INFO: Sending request http://www.publicobject.com/helloworld.txt on Connection{www.publicobject.com:80, proxy=DIRECT hostAddress=54.187.32.157 cipherSuite=none protocol=http/1.1}
User-Agent: OkHttp Example
Host: www.publicobject.com
Connection: Keep-Alive
Accept-Encoding: gzip

INFO: Received response for http://www.publicobject.com/helloworld.txt in 115.6ms
Server: nginx/1.4.6 (Ubuntu)
Content-Type: text/html
Content-Length: 193
Connection: keep-alive
Location: https://publicobject.com/helloworld.txt

INFO: Sending request https://publicobject.com/helloworld.txt on Connection{publicobject.com:443, proxy=DIRECT hostAddress=54.187.32.157 cipherSuite=TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA protocol=http/1.1}
User-Agent: OkHttp Example
Host: publicobject.com
Connection: Keep-Alive
Accept-Encoding: gzip

INFO: Received response for https://publicobject.com/helloworld.txt in 80.9ms
Server: nginx/1.4.6 (Ubuntu)
Content-Type: text/plain
Content-Length: 1759
Connection: keep-alive
```



#### 两种拦截器的选择：

*   应用拦截器

  *   不需要关心像重定向和重试这样的中间响应。
  *   总是调用一次，即使HTTP响应从缓存中获取服务。
  *   监视应用原始意图。不关心OkHttp注入的像If-None-Match头。
  *   允许短路并不调用Chain.proceed()。
  *   允许重试并执行多个Chain.proceed()


*   网络拦截器
  *   可以操作像重定向和重试这样的中间响应。
  *   对于短路网络的缓存响应不会调用。
  *   监视即将要通过网络传输的数据。
  *   访问运输请求的Connection。

### 重写请求

拦截器可以添加，移除或替换请求头。如果有请求主体，它们也可以改变。例如，如果你连接一个已知支持请求主体压缩的网络服务器，你可以使用一个应用拦截器来添加请求主体压缩。

```java
/** This interceptor compresses the HTTP request body. Many webservers can't handle this! */
final class GzipRequestInterceptor implements Interceptor {
  @Override public Response intercept(Interceptor.Chain chain) throws IOException {
    Request originalRequest = chain.request();
    if (originalRequest.body() == null || originalRequest.header("Content-Encoding") != null) {
      return chain.proceed(originalRequest);
    }

    //添加主体压缩的请求头
    Request compressedRequest = originalRequest.newBuilder()
        .header("Content-Encoding", "gzip")
        .method(originalRequest.method(), gzip(originalRequest.body()))
        .build();
    return chain.proceed(compressedRequest);
  }

  private RequestBody gzip(final RequestBody body) {
    return new RequestBody() {
      @Override public MediaType contentType() {
        return body.contentType();
      }

      @Override public long contentLength() {
        return -1; // We don't know the compressed length in advance!
      }

      @Override public void writeTo(BufferedSink sink) throws IOException {
        BufferedSink gzipSink = Okio.buffer(new GzipSink(sink));
        body.writeTo(gzipSink);
        gzipSink.close();
      }
    };
  }
}
```

