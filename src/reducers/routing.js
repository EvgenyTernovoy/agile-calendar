import { routerReducer } from 'react-router-redux'
import { LOCATION_CHANGE } from 'react-router-redux'
import { matchPath } from 'react-router'
import map from 'lodash/map'
import keyBy from 'lodash/keyBy'
import flatten from 'lodash/flatten'
import reduce from 'lodash/reduce'

import routes from 'src/routes'
import create from 'src/misc/create'
import RESOURCE from 'src/modules/resources/types'
// import USER from 'src/modules/user/types'

const routesList = map(routes, item => item).filter(item => item.resourcesFn)

const initialState = {
  pathname: '',
}

const checkResources = (data, user) => {
  const { pathname, search } = data
  const list = flatten(
    map(routesList, ({ pattern, resourcesFn }) => {
      const match = matchPath(pathname, {
        path: pattern,
        strict: true,
        exact: true,
      })

      if (!match || !match.isExact) {
        return null
      }

      return resourcesFn(match, search, user)
    }).filter(item => item),
  )

  const byKey = keyBy(list, 'key')

  return {
    list,
    byKey,
  }
}

const checkPresence = (toCheck, presence) =>
  reduce(
    toCheck,
    (result, item) => {
      if (!presence || !presence.hasOwnProperty(item.key)) {
        return [...result, item]
      }

      return result
    },
    [],
  )

const getDiff = (oldValue, newValue) => ({
  added: checkPresence(newValue, oldValue),
  removed: checkPresence(oldValue, newValue),
})

const getActionsQueue = (state, action, fullState) => {
  const data = action.type === LOCATION_CHANGE ? action.payload : state

  const neededResources = checkResources(data, fullState.user)
  const oldValue = state.neededResources && state.neededResources.byKey
  const changes = getDiff(oldValue, neededResources.byKey)

  const actionsQueue = [
    ...changes.added.map(item =>
      create(RESOURCE.RESOURCE_NEEDED, {
        name: item.name,
        need: item,
        needy: item,
      }),
    ),
    ...changes.removed.map(item =>
      create(RESOURCE.RESOURCE_NOT_NEEDED, {
        name: item.name,
        need: item,
        needy: item,
      }),
    ),
  ]
  return {
    neededResources,
    actionsQueue,
  }
}

const reducer = (state, action, fullState) => {
  switch (action.type) {
    case LOCATION_CHANGE: {
      return {
        ...routerReducer(state, action),
        pathname: action.payload.pathname,
        search: action.payload.search,
        query: action.payload.query,
        ...getActionsQueue(state, action, fullState),
      }
    }
    case USER.USER_AUTH_CHANGED: {
      return {
        ...state,
        ...getActionsQueue(state, action, fullState),
      }
    }
    default: {
      return null
    }
  }
}

export default { reducer, initialState }
