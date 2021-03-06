# 手写promise

> 手写promise首先需要掌握promise的基本用法,然后根据用法去思考实现原理

### 1.创建一个自己的promse一个类

>promse就是一个类,在执行这个类的时候 需要传递一个执行器 执行器立即执行

```javascript
class MyPromise {
    //1.promse就是一个类 在执行这个类的时候 需要传递一个执行器 执行器立即执行
    constructor (executor) {   
        //executor:立即执行的执行器,它的两个回调函数分别是resolve,reject
        executor(this.resolve,this.reject);
    }
    
    resolve = (value) => {}
    
    reject = (errInfo) => {}
}
module.exports = MyPromise
```

### 2.promse的三种状态

>等待:pending 成功:rejected 失败fulfilled  一旦状态确认就不可更改

```javascript
//2.promse有三种状态,等待:pending 成功:rejected 失败fulfilled
//把状态定义成常量的好处是:1.复用性 2.编辑器会有提示,而字符串是没有提示的
const PENDING = 'pending';      //等待
const FULFILLED = 'fulfilled';  //成功
const REJECTED = 'rejected';    //失败

class MyPromise {
    constructor (executor) {   
        //executor:立即执行的执行器,它的两个回调函数分别是resolve,reject
        executor(this.resolve,this.reject);
    }

    //resolve和reject之所以定义成箭头函数就是为了让其内部this指向MyPromise
    resolve = () => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
    }

    reject = () => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
    }
}

module.exports = MyPromise
```

### 3.resolve和reject

>resolve和reject分别改变状态为成功和失败 调用resolve是pending->fulfilled  调用reject是pending->rejected

```javascript
const PENDING = 'pending';      //等待
const FULFILLED = 'fulfilled';  //成功
const REJECTED = 'rejected';    //失败

class MyPromise {
    constructor (executor) {   
        executor(this.resolve,this.reject);
    }

    //状态
    status = PENDING;
    //成功值
    value = undefined;
    //失败原因
    errInfo = undefined;     

    //3.resolve和reject分别改变状态为成功和失败 调用resolve是pending->fulfilled  调用reject是pending->rejected
    resolve = () => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为成功
        this.status = FULFILLED;
    }

    reject = () => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为失败
        this.status = REJECTED;
    }
    
}

module.exports = MyPromise
```

### 4.then方法判断状态

> 如果状态成功调用成功的回调 如果状态是失败则调用失败的回调函数

```javascript
//2.promse有三种状态,等待:pending 成功:rejected 失败fulfilled
//把状态定义成常量的好处是:1.复用性 2.编辑器会有提示,而字符串是没有提示的
const PENDING = 'pending';      //等待
const FULFILLED = 'fulfilled';  //成功
const REJECTED = 'rejected';    //失败

class MyPromise {
    //1.promse就是一个类 在执行这个类的时候 需要传递一个执行器 执行器立即执行
    constructor (executor) {   
        //executor:立即执行的执行器,它的两个回调函数分别是resolve,reject
        executor(this.resolve,this.reject);
    }

    //状态
    status = PENDING;
    //成功值
    value = undefined;
    //失败原因
    errInfo = undefined;     

    //3.resolve和reject分别改变状态为成功和失败 调用resolve是pending->fulfilled  调用reject是pending->rejected
    //resolve和reject之所以定义成箭头函数就是为了让其内部this指向MyPromise
    resolve = (value) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为成功
        this.status = FULFILLED;
        //保存成功之后的值
        this.value = value;
    }

    reject = (errInfo) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为失败
        this.status = REJECTED;
        //保存失败之后的值
        this.errInfo = errInfo;
    }
    
    then (successCallback,failCallback) {
        //4.then方法内部做的事情就是判断状态,如果状态成功调用成功的回调 如果状态是失败则调用失败的回调函数
        //5.成功回调参数:this.value 失败回调参数:errInfo
        if(this.status === FULFILLED) successCallback(this.value);
        if(this.status === REJECTED) failCallback(this.errInfo);
    }
}

module.exports = MyPromise
```

代码片段测试,打印 '成功'.

```javascript
new MyPromise((resolve,reject)=>{
    resolve('成功')
    reject('失败')
}).then((res)=>{
    console.log(res);
},(err)=>{
    console.error(err)
})
```

加入异步代码测试. 一秒之后无输出. 首先执行器是一个同步代码最先被执行,然后执行then函数,由于状态还是pending,所以无任何输出,一秒之后状态被改变但是then已经执行了.

```javascript
new MyPromise((resolve,reject)=>{
    setTimeout(()=>{
        resolve('成功');
    },1000)
}).then((res)=>{
    console.log(res);
},(err)=>{
    console.error(err);
})
```

### 6.在promise类中加入异步代码

```javascript
const PENDING = 'pending';      //等待
const FULFILLED = 'fulfilled';  //成功
const REJECTED = 'rejected';    //失败
class MyPromise {
    constructor (executor) {   
        executor(this.resolve,this.reject);
    }
    
    status = PENDING;
    value = undefined;
    errInfo = undefined;     
    successCallback = undefined;
    failCallback = undefined;
    resolve = (value) => {
        if(this.status !== PENDING) return;
        this.status = FULFILLED;
        this.value = value;
        //判断成功回调是否是异步执行
        this.successCallback && this.successCallback(value);
    }

    reject = (errInfo) => {
        if(this.status !== PENDING) return;
        this.status = REJECTED;
        this.errInfo = errInfo;
        //判断失败回调是否是异步执行
        this.failCallback && this.failCallback(errInfo);        
    }
    
    then (successCallback,failCallback) {
        if(this.status === FULFILLED) successCallback(this.value);
        if(this.status === REJECTED) failCallback(this.errInfo);
        if(this.status === PENDING) {
        		//在then中加入异步逻辑
            this.successCallback = successCallback;
            this.failCallback = failCallback;
        }
    }
}
```

但如果是多次调用呢,如下

```javascript
promise.then((res)=>{
    console.log(res);
},(err)=>{
    console.error(err);
})

promise.then((res)=>{
    console.log(res);
},(err)=>{
    console.error(err);
})

promise.then((res)=>{
    console.log(res);
},(err)=>{
    console.error(err);
})
```

### 7.实现then方法多次使用

```javascript
const PENDING = 'pending';      //等待
const FULFILLED = 'fulfilled';  //成功
const REJECTED = 'rejected';    //失败

class MyPromise {
    constructor (executor) {   
        executor(this.resolve,this.reject);
    }
    status = PENDING;
    value = undefined;
    errInfo = undefined;     
    //成功回调
    successCallback = [];
    //失败回调
    failCallback = [];
    resolve = (value) => {
        if(this.status !== PENDING) return;
        this.status = FULFILLED;
        this.value = value;
        //判断成功回调是否是异步执行
        while(this.successCallback.length) this.successCallback.shift()(value);
    }

    reject = (errInfo) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为失败
        this.status = REJECTED;
        //保存失败之后的值
        this.errInfo = errInfo;
        //判断失败回调是否是异步执行
        while(this.failCallback.length)this.failCallback.shift()(errInfo);
    }
    
    then (successCallback,failCallback) {
        if(this.status === FULFILLED) successCallback(this.value);
        if(this.status === REJECTED) failCallback(this.errInfo);
        if(this.status === PENDING) {
            this.successCallback.push(successCallback);
            this.failCallback.push(failCallback);
        }
    }
}
```

### 8.then实现return一个值的链式调用

>后面then方法的回调函数拿到的值是上一个then方法的回调函数的返回值,如下,最后需要打印 '成功'和100. 

```javascript
let promise = new MyPromise((resolve,reject)=>{
    resolve('成功');
}).then((res)=>{
    console.log(res);
    return 100
}).then((res)=>{
    console.log(res);
})
```

>这里主要修改then中的代码,then中要返回一个新的promise对象,而且每次接收的参数要是上次一返回的值,其实then中的第一个参数就是successCallback,要得到它的返回值调用一下它即可.

```javascript
    then (successCallback,failCallback) {
        return new MyPromise((resolve,reject)=>{
            if(this.status === FULFILLED) {
                const x = successCallback(this.value);
                resolve(x);
            }
        })
    }
```

### 9.then实现return新promise时的链式调用

>如下,最后应该要打印 '成功'和'other'

```javascript
function other () {
    return new MyPromise((resolve,reject)=>{
        resolve('other');
    })
}
let promise = new MyPromise((resolve,reject)=>{
    resolve('成功');
}).then((res)=>{
    console.log(res);
    return other()
}).then((res)=>{
    console.log(res);
})
```

这里的x不确定是一个值还是一个promise对象. 需要对他进行判断,如果是promise则需要对它返回的值进行判断,同样成功调用resolve,失败调用reject

```javascript
then (successCallback,failCallback) {
        //8.实现链式调用,每次都返回一个新的实例
        return new MyPromise((resolve,reject)=>{
            if(this.status === FULFILLED) {
                const x = successCallback(this.value);
                resolvePromise(x,resolve,reject);
                //resolve(x);
            }
            if(this.status === REJECTED) failCallback(this.errInfo);
            if(this.status === PENDING) {
                //6.在promise中加入异步代码
                this.successCallback.push(successCallback);
                this.failCallback.push(failCallback);
            }
        })
}
```

```javascript
function resolvePromise (x,resolve,reject) {
    //如何判断x是不是prmise 就判断它是不是MyPromise的实例
    if(x instanceof MyPromise){
        //是promise就需要调用then去查看它对应的状态,成功的调用resolve传递下去,失败调用reject
        x.then(value=>resolve(value),errInfo=>reject(errInfo))
    }else{
        resolve(x);
    }
}
```

### 10.循环调用异常处理

> then返回的promise对象就是最后所生成的对象,所以在then的成功回调中不能再次返回被声明的promise,不然会出现循环调用的情况,如下

```javascript
let other = new Promise((resolve,reject)=>{
    setTimeout(() => {
        resolve('other');
    }, 100);
})

let p1 = other.then(value=>{
    console.log(value)
    return p1
})

p1.then(value=>{
    console.log(value)
},(errInfo)=>{
    console.log(errInfo.message)
})
```

具体实现主要是判断CurPromise和CurX是否是同一个promise,如果是就抛出错误,不是的话继续执行

```javascript
    then (successCallback,failCallback) {
        const CurPromise = new MyPromise((resolve,reject)=>{
            if(this.status === FULFILLED) {
                //这里是为了使用异步执行,因为当前这个执行器是被立即执行的,此时new MyPromise的操作并未完成,故拿不到CurPromise
                setTimeout(()=>{
                    const CurX = successCallback(this.value);
                    //10.首先.then最后返回的是CurPromise,所以在then的成功回调中不能再次返回被声明的promise,不然会出现循环调用的情况
                    resolvePromise(CurPromise,CurX,resolve,reject);
                },0)
            }
            if(this.status === REJECTED) failCallback(this.errInfo);
            if(this.status === PENDING) {
                this.successCallback.push(successCallback);
                this.failCallback.push(failCallback);
            }
        })
        return CurPromise
    }
```

```javascript
function resolvePromise (CurPromise,CurX,resolve,reject) {
    //判断CurPromise和CurX是否是同一个promise
    if(CurPromise === CurX){
        //直接抛错并退出
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }
    //如何判断CurX是不是prmise 就判断它是不是MyPromise的实例
    if(CurX instanceof MyPromise){
        //是promise就需要调用then去查看它对应的状态,成功的调用resolve传递下去,失败调用reject
        CurX.then(value=>resolve(value),errInfo=>reject(errInfo))
    }else{
        resolve(CurX);
    }
}
```

### 11.目前为止全部代码

```javascript
//2.promse有三种状态,等待:pending 成功:rejected 失败fulfilled
//把状态定义成常量的好处是:1.复用性 2.编辑器会有提示,而字符串是没有提示的
const PENDING = 'pending';      //等待
const FULFILLED = 'fulfilled';  //成功
const REJECTED = 'rejected';    //失败

class MyPromise {
    //1.promse就是一个类 在执行这个类的时候 需要传递一个执行器 执行器立即执行
    constructor (executor) {
        //executor:立即执行的执行器,它的两个回调函数分别是resolve,reject
        executor(this.resolve,this.reject);
    }

    //状态
    status = PENDING;
    //成功值
    value = undefined;
    //失败原因
    errInfo = undefined;     

    //成功回调
    successCallback = [];
    //失败回调
    failCallback = [];

    //3.resolve和reject分别改变状态为成功和失败 调用resolve是pending->fulfilled  调用reject是pending->rejected
    //resolve和reject之所以定义成箭头函数就是为了让其内部this指向MyPromise

    //传递成功的函数
    resolve = (value) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为成功
        this.status = FULFILLED;
        //保存成功之后的值
        this.value = value;
        //判断成功回调是否是异步执行
        //this.successCallback && this.successCallback(value);
        while(this.successCallback.length){
            //7.then方法多次调用,依次执行
            this.successCallback.shift()(value);
        }
    }

    //传递失败对应的函数
    reject = (errInfo) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为失败
        this.status = REJECTED;
        //保存失败之后的值
        this.errInfo = errInfo;
        //判断失败回调是否是异步执行
        // this.failCallback && this.failCallback(errInfo);     
        while(this.failCallback.length){
            //then方法多次调用,依次执行
            this.failCallback.shift()(errInfo);
        }
    }
    
    //查看状态的函数
    then (successCallback,failCallback) {
        //8.实现链式调用,每次都返回一个新的实例
        const CurPromise = new MyPromise((resolve,reject)=>{
            //4.then方法内部做的事情就是判断状态,如果状态成功调用成功的回调 如果状态是失败则调用失败的回调函数
            //5.成功回调参数:this.value 失败回调参数:errInfo
            if(this.status === FULFILLED) {
                //这里是为了使用异步执行,因为当前这个执行器是被立即执行的,此时new MyPromise的操作并未完成,故拿不到CurPromise
                setTimeout(()=>{
                    const CurX = successCallback(this.value);
                    //9.这里的CurX不确定是一个值还是一个promise对象. 需要对他进行判断,如果是promise则需要对它返回的值进行判断,同样成功调用resolve,失败调用reject
                    //resolvePromise(CurX,resolve,reject);
                    //resolve(CurX);
                    //10.首先.then最后返回的是CurPromise,所以在then的成功回调中不能再次返回被声明的promise,不然会出现循环调用的情况
                    resolvePromise(CurPromise,CurX,resolve,reject);
                },0)
            }
            if(this.status === REJECTED) failCallback(this.errInfo);
            if(this.status === PENDING) {
                //6.在promise中加入异步代码
                this.successCallback.push(successCallback);
                this.failCallback.push(failCallback);
            }
        })
        return CurPromise
    }
}

function resolvePromise (CurPromise,CurX,resolve,reject) {
    //判断CurPromise和CurX是否是同一个promise
    if(CurPromise === CurX){
        //直接抛错并退出
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }
    //如何判断CurX是不是prmise 就判断它是不是MyPromise的实例
    if(CurX instanceof MyPromise){
        //是promise就需要调用then去查看它对应的状态,成功的调用resolve传递下去,失败调用reject
        CurX.then(value=>resolve(value),errInfo=>reject(errInfo))
    }else{
        resolve(CurX);
    }
}
```

### 12.加入异常处理

> 为了程序的健壮性,需要对代码进行各种异常处理. 如:executor函数,successCallback函数,failCallback函数

```javascript
//2.promse有三种状态,等待:pending 成功:rejected 失败fulfilled
//把状态定义成常量的好处是:1.复用性 2.编辑器会有提示,而字符串是没有提示的
const PENDING = 'pending';      //等待
const FULFILLED = 'fulfilled';  //成功
const REJECTED = 'rejected';    //失败

class MyPromise {
    //1.promse就是一个类 在执行这个类的时候 需要传递一个执行器 执行器立即执行
    constructor (executor) {
        try {
            //异常情况处理
            //executor:立即执行的执行器,它的两个回调函数分别是resolve,reject
            executor(this.resolve,this.reject);
        }catch(err){
            this.reject(err)
        }
    }

    //状态
    status = PENDING;

    //成功值
    value = undefined;

    //失败原因
    errInfo = undefined;     

    //成功回调
    successCallback = [];
    
    //失败回调
    failCallback = [];

    //3.resolve和reject分别改变状态为成功和失败 调用resolve是pending->fulfilled  调用reject是pending->rejected
    //resolve和reject之所以定义成箭头函数就是为了让其内部this指向MyPromise

    //传递成功的函数
    resolve = (value) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为成功
        this.status = FULFILLED;
        //保存成功之后的值
        this.value = value;
        //判断成功回调是否是异步执行
        //this.successCallback && this.successCallback(value);
        while(this.successCallback.length){
            //7.then方法多次调用,依次执行
            // this.successCallback.shift()(value);
            //参数都已经被收集到数组中的函数调用了,不需要传参;
            this.successCallback.shift()();
        }
    }

    //传递失败对应的函数
    reject = (errInfo) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为失败
        this.status = REJECTED;
        //保存失败之后的值
        this.errInfo = errInfo;
        //判断失败回调是否是异步执行
        // this.failCallback && this.failCallback(errInfo);     
        while(this.failCallback.length){
            //then方法多次调用,依次执行
            // this.failCallback.shift()(errInfo);
            //参数都已经被收集到数组中的函数调用了,不需要传参;
            this.failCallback.shift()();
        }
    }
    
    //查看状态的函数
    then (successCallback,failCallback) {
        //8.实现链式调用,每次都返回一个新的实例
        const CurPromise = new MyPromise((resolve,reject)=>{
            //4.then方法内部做的事情就是判断状态,如果状态成功调用成功的回调 如果状态是失败则调用失败的回调函数
            //5.成功回调参数:this.value 失败回调参数:errInfo
            if(this.status === FULFILLED) {
                //这里是为了使用异步执行,因为当前这个执行器是被立即执行的,此时new MyPromise的操作并未完成,故拿不到CurPromise
                setTimeout(()=>{
                    try {
                        //异常情况处理
                        const CurX = successCallback(this.value);
                        //9.这里的CurX不确定是一个值还是一个promise对象. 需要对他进行判断,如果是promise则需要对它返回的值进行判断,同样成功调用resolve,失败调用reject
                        //resolvePromise(CurX,resolve,reject);
                        //resolve(CurX);
                        //10.首先.then最后返回的是CurPromise,所以在then的成功回调中不能再次返回被声明的promise,不然会出现循环调用的情况
                        resolvePromise(CurPromise,CurX,resolve,reject);
                    }catch(err){
                        reject(err)
                    }
                },0)
            }else if(this.status === REJECTED) {
                setTimeout(()=>{
                    try {
                        //异常情况处理
                        const CurX = failCallback(this.errInfo);
                        resolvePromise(CurPromise,CurX,resolve,reject);
                    }catch(err){
                        reject(err)
                    }
                },0)
            }else if(this.status === PENDING) {
                //6.在promise中加入异步代码
                this.successCallback.push(()=>{
                    setTimeout(()=>{
                        try {
                            //异常情况处理
                            const CurX = successCallback(this.value);
                            resolvePromise(CurPromise,CurX,resolve,reject);
                        }catch(err){
                            reject(err)
                        }                    
                    },0)
                });
                this.failCallback.push(()=>{
                    setTimeout(()=>{
                        try {
                            //异常情况处理
                            const CurX = failCallback(this.errInfo);
                            resolvePromise(CurPromise,CurX,resolve,reject);
                        }catch(err){
                            reject(err)
                        }                    
                    },0)
                });
            }
        })
        return CurPromise
    }
}

function resolvePromise (CurPromise,CurX,resolve,reject) {
    //判断CurPromise和CurX是否是同一个promise
    if(CurPromise === CurX){
        //直接抛错并退出
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }
    //如何判断CurX是不是prmise 就判断它是不是MyPromise的实例
    if(CurX instanceof MyPromise){
        //是promise就需要调用then去查看它对应的状态,成功的调用resolve传递下去,失败调用reject
        CurX.then(value=>resolve(value),errInfo=>reject(errInfo))
    }else{
        resolve(CurX);
    }
}

new MyPromise((resolve,reject)=>{
    //throw new Error('executor error')
    setTimeout(()=>{
        reject('reject');
    },1000)
})
.then(value=>{
    console.log(value)
    throw new Error('then error')
},(errInfo)=>{
    throw new Error('then error')
    //return 100
})
.then(value=>{
    console.log(value)
},(errInfo)=>{
    console.log('eee')
    console.log(errInfo.message)
})

```



### 13.then参数可选

>当then没有回调的时候,还是要把值继续延续下去,知道有回调为止.具体主要是通过补充一个函数把值传递下去,如下在then中加入判断:

```js
successCallback = successCallback ? successCallback : value=>value;
failCallback = failCallback ? failCallback : errInfo=>{throw errInfo};
```

```javascript
new MyPromise((resolve,reject)=>{
    reject('resolve');
})
.then()
.then()
.then(value=>{
	console.log(value)
},err=>{
    console.log(err)
})
```

### 14.promise all方法

>按照数组中的顺序返回对应的值,有一个失败就终止

```javascript
  function P1 () {
      return new MyPromise((resolve,reject)=>{
          setTimeout(()=>{
              resolve('1111')
          },1000)
      })
  }

  function P2 () {
      return new MyPromise((resolve,reject)=>{
          resolve('222')
      })
  }

	//静态方法,可以直接调用
  MyPromise.all([P1(),P2(),'3','4','5','6']).then((result)=>{
    console.log(result)
    // result -> ['1111','222','3','4','5','6'] 
  },(err)=>{
      console.log(err)
  })
```

```javascript
    //批量执行
    static all (array) {
        let result = [];
        let index = 0;
        return new MyPromise((resolve,rejected)=>{
            function addData (value,i) {
                index++;
                result[i] = value;
                if(index === array.length){
                    //等待所以的异步操作完成之后,才能输出
                    resolve(result)
                }
            }
            for (let i = 0 ; i< array.length ; i++){
                if(array[i] instanceof MyPromise){
                    //如果是MyPromise对象那么执行它,最后看它的状态是什么,如果成功那么添加数据,如果失败那么终止操作
                    array[i].then(value=>addData(value,i),(errInfo)=>rejected(errInfo));
                }else{
                    //普通值,直接添加数据
                    addData(array[i],i)
                }
            }
        })
    }
```

### 15.promise resolve方法

> 也是一个静态方法,把给定的值转成promise对象,
>
> 如果接受的是一个值,那么创建一个promise对象并把该直接传递下去
>
> 如果接受的是一个promise对象,那么直接返回该对象

```javascript
function P1 () {
    return new MyPromise((resolve,reject)=>{
        resolve('hello')
    })
}
//如果接受的是一个值,那么创建一个promise对象并把该直接传递下去
MyPromise.resolve(10).then((result)=>{console.log(result)});
//如果接受的是一个promise对象,那么直接返回该对象
MyPromise.resolve(P1()).then((result)=>{console.log(result)});
```

```javascript
//把给定的值转成promise对象
static resolve (val) {
  if(val instanceof MyPromise) return val;
  return new MyPromise ((resolve,rejected)=>{
  	resolve (val)
  });
}
```

### 16.promise finally方法

>finally不是一个静态方法,它定义在类的原型上
>
>无论当前promise的执行是成功还是失败,finally当中的函数始终都会执行一次
>
>在finally后可以通过链式调用拿到当前的结果

```javascript
function P1 () {
    return new MyPromise((resolve,reject)=>{
        resolve('finally')
    })
}

function P2 () {
    return new MyPromise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('hello')
        },1000)
    })
}

P1().finally((value)=>{
    console.log(value)
    return P2()
}).then(value=>console.log(value),errInfo=>console.log(errInfo));
```

```javascript
//无论成功或失败都执行一次
finally(callback){
    return this.then((value)=>{
        //把值传递下去
        // callback(value);
        // return value
        //处理异步
        return MyPromise.resolve(callback(value)).then(value=>value);
    },(errInfo)=>{
        //把错误传递下去
        // callback(errInfo);
        // throw errInfo;
        return MyPromise.resolve(callback(value)).then(value=>value,errInfo=>{throw errInfo});
    })
}
```

### 17.promise中的catch方法

>catch处理最终状态为失败的情况,在then中可以不传递失败回调,通过catch去捕获失败的回调,其实就是在catch方法的内部去调用then方法,成功回调传一个undefined,失败回调传递一个函数

```javascript

function P1 () {
    return new MyPromise((resolve,reject)=>{
        resolve('finally')
    })
}
P1()
.then(value=>console.log(value))
.catch(errInfo=>console.log(errInfo))
```

```javascript
//捕获错误的回调
catch(failCallBack){
	return this.then(undefined,failCallBack);
}
```

### 18.最终代码

```javascript
//2.promse有三种状态,等待:pending 成功:rejected 失败fulfilled
//把状态定义成常量的好处是:1.复用性 2.编辑器会有提示,而字符串是没有提示的
const PENDING = 'pending';      //等待
const FULFILLED = 'fulfilled';  //成功
const REJECTED = 'rejected';    //失败

class MyPromise {
    //1.promse就是一个类 在执行这个类的时候 需要传递一个执行器 执行器立即执行
    constructor (executor) {
        try {
            //11.异常情况处理
            //executor:立即执行的执行器,它的两个回调函数分别是resolve,reject
            executor(this.resolve,this.reject);
        }catch(err){
            this.reject(err)
        }
    }

    //状态
    status = PENDING;

    //成功值
    value = undefined;

    //失败原因
    errInfo = undefined;     

    //成功回调
    successCallback = [];
    
    //失败回调
    failCallback = [];

    //3.resolve和reject分别改变状态为成功和失败 调用resolve是pending->fulfilled  调用reject是pending->rejected
    //resolve和reject之所以定义成箭头函数就是为了让其内部this指向MyPromise

    //传递成功的函数
    resolve = (value) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为成功
        this.status = FULFILLED;
        //保存成功之后的值
        this.value = value;
        //判断成功回调是否是异步执行
        //this.successCallback && this.successCallback(value);
        while(this.successCallback.length){
            //7.then方法多次调用,依次执行
            // this.successCallback.shift()(value);
            //参数都已经被收集到数组中的函数调用了,不需要传参;
            this.successCallback.shift()();
        }
    }

    //传递失败对应的函数
    reject = (errInfo) => {
        //一旦状态确认就不可更改
        if(this.status !== PENDING) return;
        //将状态更改为失败
        this.status = REJECTED;
        //保存失败之后的值
        this.errInfo = errInfo;
        //判断失败回调是否是异步执行
        // this.failCallback && this.failCallback(errInfo);     
        while(this.failCallback.length){
            //then方法多次调用,依次执行
            // this.failCallback.shift()(errInfo);
            //参数都已经被收集到数组中的函数调用了,不需要传参;
            this.failCallback.shift()();
        }
    }
    
    //查看状态的函数
    then (successCallback,failCallback) {
        //12.当then没有回调的时候,还是要把值继续延续下去,知道有回调为止
        successCallback = successCallback ? successCallback : value=>value;
        failCallback = failCallback ? failCallback : errInfo=>{throw errInfo};
        //8.实现链式调用,每次都返回一个新的实例
        const CurPromise = new MyPromise((resolve,reject)=>{
            //4.then方法内部做的事情就是判断状态,如果状态成功调用成功的回调 如果状态是失败则调用失败的回调函数
            //5.成功回调参数:this.value 失败回调参数:errInfo
            if(this.status === FULFILLED) {
                //这里是为了使用异步执行,因为当前这个执行器是被立即执行的,此时new MyPromise的操作并未完成,故拿不到CurPromise
                setTimeout(()=>{
                    try {
                        //异常情况处理
                        const CurX = successCallback(this.value);
                        //9.这里的CurX不确定是一个值还是一个promise对象. 需要对他进行判断,如果是promise则需要对它返回的值进行判断,同样成功调用resolve,失败调用reject
                        //resolvePromise(CurX,resolve,reject);
                        //resolve(CurX);
                        //10.首先.then最后返回的是CurPromise,所以在then的成功回调中不能再次返回被声明的promise,不然会出现循环调用的情况
                        resolvePromise(CurPromise,CurX,resolve,reject);
                    }catch(err){
                        reject(err)
                    }
                },0)
            }else if(this.status === REJECTED) {
                setTimeout(()=>{
                    try {
                        //异常情况处理
                        const CurX = failCallback(this.errInfo);
                        resolvePromise(CurPromise,CurX,resolve,reject);
                    }catch(err){
                        reject(err)
                    }
                },0)
            }else if(this.status === PENDING) {
                //6.在promise中加入异步代码
                this.successCallback.push(()=>{
                    setTimeout(()=>{
                        try {
                            //异常情况处理
                            const CurX = successCallback(this.value);
                            resolvePromise(CurPromise,CurX,resolve,reject);
                        }catch(err){
                            reject(err)
                        }
                    },0)
                });
                this.failCallback.push(()=>{
                    setTimeout(()=>{
                        try {
                            //异常情况处理
                            const CurX = failCallback(this.errInfo);
                            resolvePromise(CurPromise,CurX,resolve,reject);
                        }catch(err){
                            reject(err)
                        }
                    },0)
                });
            }
        })
        return CurPromise
    }

    //批量执行
    static all (array) {
        let result = [];
        let index = 0;
        return new MyPromise((resolve,rejected)=>{
            function addData (value,i) {
                index++;
                result[i] = value;
                if(index === array.length){
                    //等待所以的异步操作完成之后,才能输出
                    resolve(result)
                }
            }
            for (let i = 0 ; i< array.length ; i++){
                if(array[i] instanceof MyPromise){
                    //如果是MyPromise对象那么执行它,最后看它的状态是什么,如果成功那么添加数据,如果失败那么终止操作
                    array[i].then(value=>addData(value,i),(errInfo)=>rejected(errInfo));
                }else{
                    //普通值,直接添加数据
                    addData(array[i],i)
                }
            }
        })
    }

    //把给定的值转成promise对象
    static resolve (val) {
        if(val instanceof MyPromise) return val;
        return new MyPromise ((resolve,rejected)=>{
            resolve (val)
        });
    }

    //无论成功或失败都执行一次
    finally(callback){
        return this.then((value)=>{
            //把值传递下去
            // callback(value);
            // return value
            //处理异步
            return MyPromise.resolve(callback(value)).then(value=>value);
        },(errInfo)=>{
            //把错误传递下去
            // callback(errInfo);
            // throw errInfo;
            return MyPromise.resolve(callback(value)).then(value=>value,errInfo=>{throw errInfo});
        })
    }

    //捕获错误的回调
    catch(failCallBack){
        return this.then(undefined,failCallBack);
    }
}

function resolvePromise (CurPromise,CurX,resolve,reject) {
    //判断CurPromise和CurX是否是同一个promise
    if(CurPromise === CurX){
        //直接抛错并退出
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }
    //如何判断CurX是不是prmise 就判断它是不是MyPromise的实例
    if(CurX instanceof MyPromise){
        //是promise就需要调用then去查看它对应的状态,成功的调用resolve传递下去,失败调用reject
        CurX.then(value=>resolve(value),errInfo=>reject(errInfo))
    }else{
        resolve(CurX);
    }
}
```