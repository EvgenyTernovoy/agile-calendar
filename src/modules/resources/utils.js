import reduce from 'lodash/reduce'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/fp/set'
import isNil from 'lodash/isNil'

import create from 'src/misc/create'
import resourceId from 'src/misc/resourceId'
import inits from './inits'

import A from './types'

export const createOkResource = (identity, body, needies = {}) => ({
  identity,
  completed: true,
  loading: false,
  error: null,
  needies,
  item: {
    ...body,

    _identity: identity,
    _completed: true,
    _ok: true,
    _error: null,
    _loading: false,
  },
})

export const relatedIdentity = ($identity, parentIdentity) => resourceId(
  $identity.name,
  $identity.props,
  $identity.parentIdentity === false ? null : parentIdentity,
)

export const handleRelated = (result, item) => {
  if (!item) {
    return result
  }
  const { changedList, moreNeeds, moreRelatedIdentities, moreToDo, parentIdentity } = result

  if (!item.$identity) {
    return {
      ...result,
      changedList: [...changedList, item],
    }
  }

  const { $identity, ...body } = item

  const identity = relatedIdentity($identity, parentIdentity)

  return {
    ...result,
    changedList: [...changedList, identity],
    moreToDo: isEmpty(body)
      ? moreToDo
      : [...moreToDo, {
        body,
        identity,
      }],
    moreNeeds,
    moreRelatedIdentities,
    parentIdentity,
  }
}

export const handleList = (result, list, key) => {
  const {
    related = {},
    needs = [],
    relatedIdentities = [],
    toDo = [],
    parentIdentity,
  } = result

  const draft = {
    changedList: [],
    moreNeeds: [],
    moreRelatedIdentities: [],
    moreToDo: [],
    parentIdentity,
  }

  const {
    changedList,
    moreNeeds,
    moreRelatedIdentities,
    moreToDo = [],
  } = Array.isArray(list)
    ? reduce(list, handleRelated, draft)
    : handleRelated(draft, list)

  return {
    related: {
      ...related,
      [key]: Array.isArray(list) ? changedList : changedList[0],
    },
    needs: [...needs, ...moreNeeds],
    relatedIdentities: [...relatedIdentities, ...moreRelatedIdentities],
    toDo: [...toDo, ...moreToDo],
    parentIdentity,
  }
}

const createResource = newResource => {
  const { related, needs = [], toDo } = reduce(newResource.item.related, handleList, {
    parentIdentity: newResource.identity,
  })

  const finalResource = {
    ...newResource,
    needs: [
      ...(newResource.needs || []),
      ...needs,
    ],
    item: inits({
      ...newResource.item,
      related,
    }),
  }

  return {
    finalResource,
    needs,
    toDo,
  }
}

const checkInited = ({ needs, toDo, finalResource }) => {
  const result = reduce(finalResource.item.related, handleList, {
    parentIdentity: finalResource.identity,
    needs,
    toDo,
  })

  return {
    needs: result.needs,
    toDo: result.toDo,
    finalResource: {
      ...finalResource,
      item: {
        ...finalResource.item,
        related: result.related,
      },
    },
  }
}

export const checkRelated = newResource => {
  if (!newResource.item || !newResource.item.related || !newResource.item._ok) {
    return {
      newResource,
    }
  }

  const { finalResource, needs, toDo } = checkInited(createResource(newResource))

  return {
    newResource: finalResource,
    needs,
    toDo,
  }
}

export const createRelated = resource => {
  let list = [resource]
  let addedNeeds = []
  let byKey = {}

  while (list.length) {
    const cur = list.shift()

    const { needs = [], newResource, toDo = [] } = checkRelated(cur)


    addedNeeds = [...addedNeeds, ...(needs.map(need => ({
      name: need.name,
      need,
      needy: newResource.identity,
    })))]

    byKey = {
      ...byKey,
      [newResource.identity.key]: newResource,
    }

    const created = toDo.map(({ body, identity }) => createOkResource(
      identity,
      body,
    ))
    list = [...list, ...created]
  }
  return {
    addedNeeds,
    byKey,
  }
}

export const handleResourceChange = (state, { actionsQueue = [], ...resource }) => {
  const { addedNeeds, byKey } = createRelated(resource)

  const needies = Object.keys(resource.needies).map(needyKey => ({
    need: resource.identity,
    needy: resource.needies[needyKey],
  }))

  const watchNeedies = reduce(byKey,
    ((result = [], res) =>
      [...result, ...(state.watchingFor[res.identity.key] || [])]), [])

  const needs = addedNeeds.map(
    payload => create(A.RESOURCE_NEEDED, payload),
  )

  return {
    ...reduce(byKey, (state, res) =>
      set(['byKey', res.identity.key], res, state), state),
    actionsQueue: [
      ...needs,
      ...needies.map(item => create(A.RESOURCE_UPDATED_DEP, item)),
      ...watchNeedies.map(watchKey =>
        create(A.RESOURCE_WATCHED_UPDATED, state.watchers[watchKey])),
      ...actionsQueue,
    ],
  }
}

export const setItem = (state, idn, path, value) => {
  const fullPath = isNil(path)
    ? ['byKey', idn.key]
    : ['byKey', idn.key, 'item', ...path]

  return set(
    fullPath,
    value,
    state,
  )
}

export const applyChanges = (state, changes) =>
  changes.reduce((state, [idn, path, value]) => setItem(state, idn, path, value), state)
