import omit from 'lodash/omit'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import set from 'lodash/fp/set'

import { getResource } from 'src/misc/resourceId'
import create from 'src/misc/create'
import A from './types'
import handleDeps from './handleDeps'
import { handleResourceChange, createOkResource, setItem } from './utils'
import specialReducer from './specialReducer'

const initialState = {
  byKey: {},
  watchers: {},
  watchingFor: {},
}

const watchFor = (state, list, watcherKey) =>
  list.reduce((result, { key }) => {
    const currentValue = state[key] || []
    const newValue = [...currentValue, watcherKey]
    return {
      ...result,
      [key]: newValue,
    }
  }, {})

const actionsToDispatch = (oldValue, noNeedies, need) => {
  if (Boolean(oldValue) === Boolean(noNeedies)) {
    // no changes - nothing to do;
    return null
  }

  if (noNeedies) {
    // resource not needed anymore
    return [create(A.RESOURCE_DISPOSED, need)]
  }
  // resource has first needy, so it request should be send
  return [create(A.RESOURCE_REQUESTED, need)]
}

const checkNeed = (state, { need, needy }, toAdd) => {
  const subState = state.byKey || {}
  const { needies, ...resource } = subState[need.key] || {
    identity: need,
    item: {
      _identity: need,
    },
    needies: {},
    emptyNeedies: true,
  }

  const newNeedies = toAdd
    ? { ...needies, [needy.key]: needy }
    : omit(needies, needy.key)

  const newResource = {
    ...resource,
    needies: newNeedies,
    emptyNeedies: isEmpty(newNeedies),
  }

  const shouldBeRemoved = newResource.emptyNeedies

  if (shouldBeRemoved && !(resource.loading || resource.error)) {
    // disable diposing
    return null
  }

  const index = shouldBeRemoved
    ? omit(subState, need.key)
    : {
      ...subState,
      [need.key]: newResource,
    }

  return {
    ...state,
    byKey: index,
    actionsQueue: actionsToDispatch(
      resource.emptyNeedies,
      newResource.emptyNeedies,
      need,
    ),
  }
}

const resourceLoad = ({ payload, error, pending }, resource) => {
  if (error) {
    return {
      ...resource,
      completed: true,
      error: payload,
      loading: false,
      item: {
        _identity: resource.identity,
        _completed: true,
        _ok: false,
        _error: payload,
        _loading: false,
      },
    }
  }

  if (pending) {
    return {
      ...resource,
      loading: true,
      item: {
        _identity: resource.identity,
        _completed: false,
        _error: null,
        _loading: true,
      },
    }
  }

  if (payload) {
    return {
      ...resource,
      ...createOkResource(resource.identity, payload, resource.needies),
      needies: resource.needies,
    }
  }
  return null
}

const propValue = (fullState, idn, type, prop, value) => {
  if (!type) {
    return value
  }
  const item = getResource(fullState, idn, true)
  const currentValue = item[prop]
  switch (type) {
    case 'increase': {
      return currentValue + value
    }
    case 'decrease': {
      return currentValue - value
    }
  }
  return currentValue
}

const handleCommon = (state, action, fullState) => {
  switch (action.type) {
    case A.RESOURCE_WATCHED: {
      const key = `${action.payload.handler}: ${action.payload.needy.key}`

      if (state.watchers[key]) {
        return null
        // TODO: decide if can watch same thing twice
        // throw new Error('watcher exists')
      }

      return {
        watchers: {
          ...state.watchers,
          [key]: {
            ...action.payload,
            key,
          },
        },
        watchingFor: {
          ...state.watchingFor,
          ...watchFor(state.watchingFor, action.payload.need, key),
        },
        actionsQueue: [
          create(A.RESOURCE_WATCHED_UPDATED, action.payload),
        ],
      }
    }
    case A.RESOURCE_NEEDED: {
      return checkNeed(state, action.payload, true)
    }
    case A.RESOURCE_NOT_NEEDED: {
      return checkNeed(state, action.payload, false)
    }
    case A.RESOURCE: {
      debugger
      const { key } = action.meta
      const resource = get(state, ['byKey', key])
      if (!resource) {
        return null
      }

      const tempRes = resourceLoad(action, resource)

      return handleResourceChange(state, tempRes)
    }

    case A.RESOURCE_WATCHED_UPDATED: {
      return handleDeps(state, action, fullState)
    }

    case A.RESOURCE_PROP_UPDATED: {
      const { idn, prop, value, type } = action.payload
      return setItem(state, idn, [prop], propValue(fullState, idn, type, prop, value))
    }
  }

  return null
}

const reducer = (state, action, fullState) => {
  const changes = handleCommon(state, action, fullState)
  const stateUpdated = changes ? {
    ...state,
    ...changes,
  } : state
  const fullStateUpdated = changes ? {
    ...fullState,
    resourses: stateUpdated,
  } : fullState


  const finalChanges = specialReducer(stateUpdated, action, fullStateUpdated)
  if (finalChanges) {
    return finalChanges
  }

  if (changes) {
    return changes
  }

  return null
}

export default { reducer, initialState }
