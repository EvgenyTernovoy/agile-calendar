import TYPES from './types'

const dispatchQueued = ({ dispatch, getState }) => next => action => {
  if (action.type === TYPES.ACTIONS_QUEUE_SHIFTED) {
    return next(action)
  }

  next(action)

  const state = getState()
  if (!state.actionsQueue || !state.actionsQueue.length) {
    return null
  }

  const [queuedAction] = state.actionsQueue

  dispatch({ type: TYPES.ACTIONS_QUEUE_SHIFTED })
  dispatch(queuedAction)

  return null
}

export default dispatchQueued
