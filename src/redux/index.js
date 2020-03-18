
const log = console.log

export function createStore (reducer, preloadedState) {

    let currentReducer = reducer
    let currentState = preloadedState 
    let currentListeners = []
    let nextListeners = currentListeners
    
    function getState() {
        log('get state', currentState)
        return currentState 
    }
    
    function subscribe(listener) {
        log('subscribe')
        let isSubscribed = true
        nextListeners.push(listener)

        // 直接一个  unsubscribe 而非返回 index
        return function unsubscribe() {
            if (!isSubscribed) {
            return
            }
    
            isSubscribed = false
    
            // 解除订阅
            const index = nextListeners.indexOf(listener)
            nextListeners.splice(index, 1)
            currentListeners = null
        }
    }

    function dispatch(action) {
        log('dispatch', action)
        // 生成新状态
        currentState = currentReducer(currentState, action)

        // 调用所有 listen
        const listeners = (currentListeners = nextListeners)
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i]
            listener()
        }
        return action
    }

    // 派发初始化事件, 从 reducer 生成初始状态
  
    dispatch({ type: "INIT" })

    const store = {
        dispatch,
        subscribe,
        getState,
    }

    return store
}
