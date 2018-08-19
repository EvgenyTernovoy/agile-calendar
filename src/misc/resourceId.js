import reduce from 'lodash/reduce'
import sortBy from 'lodash/sortBy'
import mapValues from 'lodash/mapValues'
import isPlainObject from 'lodash/isPlainObject'
import get from 'lodash/get'

const getSortedProps = props => {
  const list = reduce(
    props,
    (result, item, key) => [...result, [key, item]],
    [],
  )

  const sortedList = sortBy(list, ['0'])

  return reduce(
    sortedList,
    (result, item) => ({
      ...result,
      [item[0]]: item[1],
    }),
    {},
  )
}

const getDeeplySortedProps = props => {
  const sorted = getSortedProps(props)

  return mapValues(sorted, item => {
    if (!isPlainObject(item)) {
      return item
    }

    return getDeeplySortedProps(item)
  })
}

const getResourceKey = (name, mainKey, parentIdentity) =>
  `${name}-${mainKey}${parentIdentity ? `-(${parentIdentity.key})` : ''}`

const resourceId = (name, props, parentIdentityRaw) => {
  const mainKey = JSON.stringify(getDeeplySortedProps(props))
  const parentIdentity = parentIdentityRaw || false
  return {
    name,
    props,
    parentIdentity,
    shortkey: mainKey,
    mediumkey: `${mainKey}-${name}-${
      parentIdentity ? parentIdentity.name : ''
    }`,
    key: getResourceKey(name, mainKey, parentIdentity),
  }
}

export const getResource = (fullState, identity, getBody) => {
  if (!identity) {
    throw new Error('identity should be provided')
  }
  const path = ['resources', 'byKey', identity.key]

  return get(fullState, getBody !== false ? [...path, 'item'] : path)
}


export const getResourceWithoutId = (
  fullState,
  name,
  props,
  parentIdentity,
  getBody,
) => {
  const identity = resourceId(name, props, parentIdentity)

  return getResource(fullState, identity, getBody)
}

export const mapIdn = (idnPath, mapFn) => (fullState, props) => {
  const idn = idnPath ? get(props, idnPath) : props.idn
  const resource = idn && getResource(fullState, idn)

  return mapFn(resource, fullState, props)
}

export const bindGet = fullState => fn => idn => fn(idn && getResource(fullState, idn))

export const getRelated = (fullState, idn, pathRelated) =>
  reduce(
    pathRelated,
    (cur, pathPart) => {
      const related = get(cur, 'related')
      const result = get(related, pathPart)
      if (Array.isArray(result)) {
        return result
      }

      return result && getResource(fullState, result)
    },
    getResource(fullState, idn),
  )

export const selectParent = (idn, name) => {
  let cur = idn
  while (cur) {
    if (cur.name === name) {
      return cur
    }
    cur = cur.parentIdentity
  }

  return null
}

export const hasFullBody = (fullState, idn) => {
  const item = getResource(fullState, idn)
  return Boolean(item && item.fullBody)
}

export default resourceId
