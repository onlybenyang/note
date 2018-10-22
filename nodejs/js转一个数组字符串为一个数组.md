js怎么把一个数组字符串转成一个数组
```js
_parseArray = (arrStr) => {
    var tempKey = new Date().getTime();
    var arrayJsonStr = '{"' + tempKey + '":' + arrStr + '}';
    var arrayJson;
    if (JSON && JSON.parse) {
        arrayJson = JSON.parse(arrayJsonStr);
    } else {
        arrayJson = eval('(' + arrayJsonStr + ')');
    }
    return arrayJson[tempKey];
};
```
