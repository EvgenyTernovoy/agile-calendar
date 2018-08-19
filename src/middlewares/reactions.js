import reduce from 'lodash/reduce'
// import installation from 'src/modules/installation/reactions'
// import modal from 'src/modules/modal/reactions'
// import cases from 'src/modules/cases/reactions'
import sprints from 'src/modules/sprints/reactions'

const reactionsByActionType = reduce(
  [
    // installation,
    sprints,
  ],
  (accumulator, subindex) =>
    reduce(
      subindex,
      (subacc, items, key) => ({
        ...subacc,
        [key]: (subacc[key] || []).concat(items),
      }),
      accumulator,
    ),
  {},
)

const reactions = store => nextDispatch => action => {
  if (!reactionsByActionType[action.type]) {
    nextDispatch(action)
    return
  }

  const prevState = store.getState()
  nextDispatch(action)

  reactionsByActionType[action.type].forEach(doReaction => {
    const actions = doReaction(action, store, prevState)
    if (!actions) {
      return
    }

    if (!Array.isArray(actions)) {
      store.dispatch(actions)
      return
    }

    actions.forEach(item => store.dispatch(item))
  })
}

export default reactions
