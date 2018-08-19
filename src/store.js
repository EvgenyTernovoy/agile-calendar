import { createStore, compose, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import thunk from 'redux-thunk'
import actionsQueue from 'src/modules/actionsQueue/middleware'
import reactions from 'src/middlewares/reactions'
import reducers from './reducers'


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const initialState = {
  resources: {
    sprints: [
      {
        name: 'My first sprint',
        id: '1',
      },
    ],
  },
}

const history = createHistory()

const store = createStore(
  reducers,
  // initialState,
  composeEnhancers(
    applyMiddleware(
      ...[
        thunk,
        routerMiddleware(history),
        reactions,
        actionsQueue,
        createLogger({ collapsed: true, duration: true, colors: true, logErrors: false }),
      ].filter(item => item),
    ),
  ),
)

store.subscribe(() => {
  console.log('store changed', store.getState())
})


export { store, history }

