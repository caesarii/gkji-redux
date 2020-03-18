import React from 'react'
import ReactDOM from 'react-dom'
// import { createStore, applyMiddleware } from './redux'
import { createStore } from './redux/index.js'
import Counter from './components/Counter'
import counter from './reducers'
const log = () => {}// console.log

const store = createStore(counter)

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
