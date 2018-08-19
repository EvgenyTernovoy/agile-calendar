import TYPES from './types'

const initialState = []

const reducer = (state, action) => {
  if (action.type !== TYPES.ACTIONS_QUEUE_SHIFTED) {
    return null
  }

  const queue = state && state.slice(1)

  return [...queue]
}

export default { reducer, initialState }
