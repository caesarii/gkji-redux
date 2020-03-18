
# 这是一个 redux 源码解析项目

* 结合 redux 文档食用


## redux 核心逻辑
* src 中是counter, 没有使用 react-redux 的计数器, /redux 是移植的 redux 源码, 该应用直接引用 redux 源码

* 在这个情况下其实只依赖 redux ceateStore 一个方法, 然后依赖 Store 实例的 getState/dispatch/subscibe 方法, 这就是 redux 的核心流程. 具体的解读参见这三个方法的源码, 很简单, 完全没有任何难度

## applyMiddleware API
结合文档中的 高级-middleware 和 API.applymiddleware 食用

* applyMiddleware 的使用方式

``` js
const store = createStore(counter, applyMiddleware(logger, crashReporter))
```

* 根据 applyMiddleware 的使用方式, 其返回值是作为 enhancer 参数传递到 createStore 中的, 在 createStore 中使用方式如下

```javascript
    return enhancer(createStore)(reducer, initialState)
```

因为直接 return 了, 以上调用的最终返回值必须是 store 实例, 所示 applyMiddleware 实际调用逻辑如下

```js

const store = applyMiddleware(middlewares)(createStore)(reducer, initialState)

```

* 由以上调用方式以及源码可知, applyMiddleware 是一个三层柯里化函数

``` js

applyMiddleware = middlewares => createSore => (reducer, initialState) => store

```

* 由外到内依次来分析每一次调用的返回值, 上面已经说过 applyMiddleware(middlewares) 的返回值是作为 enhancer 参数传递到 createStore 中的, 即

```js
applyMiddleware = middlewares => storeEnhancer
```

* applyMiddleware(middlewares)(createSotre) 的返回值: 
第三次函数调用时传入 reducer 和 initialState 参数, 这跟 createStore 的参数是一致的, 可知其返回值仍然是 `createStore` 方法, 即

```js
storeEnhancer = createStore => createStore
```

*已知 `createStore = (reducer, initialState) => store`,  综上所述
```js
applyMiddleware = middlewares => storeEnhancer

storeEnhancer = createStore => createStore

createStore = (reducer, initialState) => store

applyMiddleware = middlewares => createSore => (reducer, initialState) => store

```


## 中间件
* 根据文档可知 middleware 签名如下
```js
({getState, dispatch}) => next => action => dispatch
```
也就是说 middleware 也是一个三层柯里化函数, 需要三次调用

* 在 applyMiddleware 源码中, 使用中间件的逻辑如下
```js
const middlewareAPI: MiddlewareAPI = {
    getState: store.getState,
    dispatch: (action, ...args) => dispatch(action, ...args)
}
const chain = middlewares.map(middleware => middleware(middlewareAPI))
dispatch = compose<typeof dispatch>(...chain)(store.dispatch)
```
首先需要解释下 compose, compose = (函数列表) => 组合函数, 即 compose(f1, f2, f3) 返回 f1(f2(f3)), 把源码复制出来run一下就明白了

为了便于理解我们假定只有一个中间件, 这样就可以忽略compose, 由以上代码可见 middleware 的前两次调用
```js
// 第一次调用
middlewareBody = middleware({getState, dispatch})
// 把第一次调用返回的函数称为 middlewareBody, 因为这才是中间件实体, 第一次调用的目的只是绑定 store 

// 第二次调用
middlewareDispatch = middlewareBody(store.dispatch)
// 第二次调用的结果是一个 dispatch, 这个 dispatch 就是组件中使用的 dispatch, 但已经不是 store.dispatch, 把它叫做 middlewareDispatch

// 第三次调用就是 
middlewareDispatch(action)
```

* 为了理解多个中间件是如何组织的, 关键在于解释 next 参数, 这需要结合一个具体的中间件

```js
function logger({ getState }) {
  return (next) => (action) => {
    console.log('will dispatch', action)

    // 调用 middleware 链中下一个 middleware 的 dispatch。
    let returnValue = next(action)

    console.log('state after dispatch', getState())

    return returnValue
  }}

```

* 结合以上中间件, 在只有一个中间件的情况下, next = store.dispatch, 那 middlewareDispatch 为: 

```js 
middlewareDispatch = (action) => {
    console.log('will dispatch', action)

    // 调用 middleware 链中下一个 middleware 的 dispatch。
    let returnValue = store.dispatch(action)

    console.log('state after dispatch', getState())

    return returnValue
  }}

```

在有多个中间件的情况, 如 middlewareBodys = [fn1, fn2, fn3] (注意这里是 middlewareBody), 
那第二次调用就会变为 `middlewareDispatch = fn1(fn2(fn3(store.dispatch)))`, 
对于 fn3, next = store.dispatch, 
对于 fn2, next = middlewareDispatchFn3, 即 next 是下一个中间件的 middlewareDispatch, 
这里的`下一个`是相对中间件的指定顺序来说的, 
最后一个中间件的 middlewareDispatch 就是 store.dispatch

在 dispatch(action) 时实际调用顺序如何, 也就是执行 fn1(fn2(fn3(store.dispatch)))(action), 展开一下
以下内容结合 counter 中的 demo 理解
```js

fn1 = next => action => {
    fn1Before()
    next(action)
    fn1After()
}

fn2 = next => action => {
    fn2Before()
    next(action)
    fn2After()
}

fn3 = store.dispatch => action => {
    
}

// fn3 代入  fn2, fn2 代入 fn1

fn2 = next => action => {
    fn2Before()

    fn3Before()
    store.dispatch(action)
    fn3After()

    fn2After()
}

fn1 = next => action => {
    fn1Before()

    fn2Before()

    fn3Before()
    store.dispatch(action)
    fn3After()

    fn2After()

    fn1After()
}
```

fn1 就是实际使用的 dispatch. 

完结散花






