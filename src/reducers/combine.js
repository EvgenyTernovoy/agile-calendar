import reduce from 'lodash/reduce'
import isFunction from 'lodash/isFunction'

import helpCombine from 'src/modules/actionsQueue/helpCombine'
import actionsQueueReducer from 'src/modules/actionsQueue/reducer'

export default schema => {
  const initialState = reduce(
    schema,
    (result, item, key) => {
      if (isFunction(item)) {
        return result
      }
      return { ...result, [key]: item.initialState }
    },
    {},
  )

  const callList = reduce(
    schema,
    (result, reducer, key) => {
      if (isFunction(reducer)) {
        return [
          ...result,
          {
            key,
            fn: (state, action) => reducer(state && state[key], action),
          },
        ]
      }
      const fn = reducer.fn
      return [
        ...result,
        {
          key,
          fn: (state, action) => {
            const original = state || initialState
            return { ...original[key], ...fn(original[key], action, original) }
          },
        },
      ]
    },
    [],
  )

  return (state, action) => {
    const actionsQueue = (state && state.actionsQueue) || []
    const stepState = reduce(
      callList,
      (result, item) => helpCombine(result, item.key, item.fn(state, action)),
      {},
    )

    const fullState = {
      ...stepState,
      actionsQueue: [...actionsQueue, ...stepState.actionsQueue],
    }

    return {
      ...fullState,
      actionsQueue:
        actionsQueueReducer.reducer(
          fullState.actionsQueue,
          action,
          fullState,
        ) || fullState.actionsQueue,
    }
  }
}
