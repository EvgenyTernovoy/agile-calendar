import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { store, history } from 'src/store'

export const Root = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>
)

if (!module.hot) render(<Root />, document.querySelector('react'))

