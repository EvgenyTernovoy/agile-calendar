import isNil from 'lodash/isNil'
import canUseLocalStorage from './canUseLocalStorage'

const getStorageValue = (key, fallback) => {
  if (!canUseLocalStorage) {
    return fallback
  }
  const saved = window.localStorage.getItem(key)
  return isNil(saved) ? fallback : saved
}

export default getStorageValue
