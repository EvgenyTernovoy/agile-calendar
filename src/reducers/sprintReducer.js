import types from './types'

const sprintReducer = (state={}, action) => {
  switch (action.type) {
    case types.SP_CREATE : {
      return state
    }
    default: {
      return state
    }
  }
}

export default sprintReducer
