import get from 'lodash/get'

import { getResource } from 'src/misc/resourceId'
import { handleResourceChange } from './utils'

const handleDeps = (state, { payload: { needy, need, handler } }, fullState) => {
  const needyRes = getResource(fullState, needy, false)
  if (!needyRes) {
    return null
  }

  const needRes = need.map(identity => {
    const res = getResource(fullState, identity, false)
    return res && res.item
  })

  const changes = [

  ]
    .map(fn => fn(needyRes.item, handler, needRes, fullState))
    .filter(item => item)

  if (!changes.length) {
    return null
  }

  const currentResource = needyRes

  const curRes = changes.reduce(({ actionsQueue = [], ...currentResource }, item) => {
    const { actionsQueue: __actionsQueue, ..._item } = item
    const newResource = {
      ...currentResource,
      item: {
        ...currentResource.item,
        ..._item,
      },
      actionsQueue: [...actionsQueue, ...(__actionsQueue || [])],
    }
    return newResource
  }, currentResource)

  return handleResourceChange(state, curRes)
}


export default handleDeps
