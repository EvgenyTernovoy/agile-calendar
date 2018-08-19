let cachedValue
const key = '_check_key_'
try {
  localStorage.setItem(key, key)
  localStorage.removeItem(key)
  cachedValue = true
} catch (e) {
  cachedValue = false
}
export default cachedValue
