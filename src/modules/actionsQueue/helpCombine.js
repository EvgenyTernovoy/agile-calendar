const mergeQueues = (actionsQueue, subQueue) => {
  if (!actionsQueue && !subQueue) {
    return []
  }

  if (!subQueue) {
    return actionsQueue.filter(item => item)
  }

  if (!actionsQueue) {
    return subQueue.filter(item => item)
  }

  return [...actionsQueue, ...subQueue].filter(item => item)
}

const collectQueues = (
  { actionsQueue, ...state },
  key,
  { actionsQueue: subQueue, ...subState },
) => ({
  ...state,
  [key]: subState,
  actionsQueue: mergeQueues(actionsQueue, subQueue),
})

export default collectQueues
