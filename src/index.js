import React from 'react'
import ReactDOM from 'react-dom'
// import { createStore, applyMiddleware } from './redux'
import { createStore } from './redux/index.js'
import Counter from './components/Counter'
import counter from './reducers'
const log = () => {}// console.log

const store = createStore(counter, 0)
const render = () => {
  const state = store.getState()
  console.log('render', state)
  return ReactDOM.render(
    <Counter
      value={state}
      onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
      onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
    />,
    document.getElementById('root')
  )
}

render()
store.subscribe(render)
