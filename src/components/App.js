import React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect, withRouter, Switch } from 'react-router-dom'
import routes from 'src/routes'

import Sprints from 'src/components/Sprints'

import './master.css'

const RootComponent = connect((state, props) => ({state}))(
  (props) => {
    const { name } = props.state.resources.sprints[0]
    return <div className={'rootComponent'}>
      Hello App {name}
    </div>
  }
)


const App = () => (
  <div className={'mainContainer'}>
    <Switch>
      <Route path={routes.sprint.pattern} component={Sprints} />
    </Switch>
  </div>
)



export default App
