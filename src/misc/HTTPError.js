function HTTPError(response) {
  this.response = response
  this.message = `${response.status} ${response.url}`
  this.stack = Error().stack
}

HTTPError.prototype = Object.create(Error.prototype)
HTTPError.prototype.name = 'HTTPError'

export default HTTPError
