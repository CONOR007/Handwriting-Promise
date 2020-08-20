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

    //传递成功的函数 (由于resolve和reject在其它地方调用.这里必须用箭头函数,才能保证函数内this指向当前对象)
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


function P1 () {
    return new MyPromise((resolve,reject)=>{
        reject('ss')
    })
}


P1()
.then(value=>console.log(value))
// .catch(errInfo=>console.log(errInfo))

// module.exports = MyPromise