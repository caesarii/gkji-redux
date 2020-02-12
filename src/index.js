import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from './redux'
import Counter from './components/Counter'
import counter from './reducers'
const log = console.log

// logger 中间件
const fn1 = store => next => action => {
  log('fn1 before')
  next(action)
  log('fn1 after')
}

const fn2 = store => next => action => {
  log('fn2 before')
  next(action)
  log('fn2 after')
}

const fn3 = store => next => action => {
  log('fn3 before')
  next(action)
  log('fn3 after')
}


const store = createStore(counter, applyMiddleware(fn1, fn2, fn3))

const render = () => {
  console.log('render')
  return ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
      onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
    />,
    document.getElementById('root')
  )
}

render()
store.subscribe(render)
