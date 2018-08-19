const safeJSONParse = (str, fallback) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return fallback
  }
}

export default safeJSONParse
