const list = []

const specialReducer = (state, action, fullState) => {
  const { state: newState } = list.reduce(({ state, fullState }, fn) => {
    const newState = fn(state, action, fullState)
    if (!newState) {
      return {
        state,
        fullState,
      }
    }

    return {
      state: {
        ...state,
        ...newState,
      },
      fullState: {
        ...fullState,
        resources: newState,
      },
    }
  }, {
    state,
    fullState,
  })

  if (state === newState) {
    return null
  }

  return newState
}

export default specialReducer
