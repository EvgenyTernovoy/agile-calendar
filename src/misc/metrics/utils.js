import reduce from 'lodash/reduce'
import isObject from 'lodash/isObject'
import mapKeys from 'lodash/mapKeys'

const toValue = obj => {
  if (!Array.isArray(obj)) {
    return obj
  }

  return JSON.stringify(obj)
}

const addKeysPrefix = (prefix, props) =>
  mapKeys(props, (value, key) => `${prefix}${key}`)

const flat = (props, separator = '.') =>
  reduce(
    props,
    (result, value, key) => {
      const usableValue = toValue(value)

      if (!isObject(usableValue)) {
        return {
          ...result,
          [key]: usableValue,
        }
      }

      const prefixed = addKeysPrefix(`${key}${separator}`, value)

      return {
        ...result,
        ...flat(prefixed, separator),
      }
    },
    {},
  )

export { flat }
