import A from './types'

const initialState = {}

const reducer = (state, action) => {
  if (action.type !== A.COUNT_ASYNC) {
    return null
  }

  return { [action.payload.key]: action.payload.value }
}

export default { reducer, initialState }
