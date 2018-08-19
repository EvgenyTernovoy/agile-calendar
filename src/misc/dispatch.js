import isNull from 'lodash/isNull'
import isString from 'lodash/isString'
import Raven from 'raven-js'

import countAsync from 'src/modules/asyncCounters/types'
import HTTPError from './HTTPError'

function ActionError(message, original) {
  this.message = message
  this.stack = Error().stack
  this.original = original
}
ActionError.prototype = Object.create(Error.prototype)
ActionError.prototype.name = 'ActionError'

const failAction = (dispatch, type, payload, meta) =>
  dispatch({
    type,
    payload: isString(payload) ? new ActionError(payload) : payload,
    pending: false,
    status: 'fail',
    error: true,
    meta,
  })

const promiseAction = (dispatch, getState, type, promise, meta) => {
  const metaSubkey = meta ? JSON.stringify(meta) : ''
  const key = `${type}-${metaSubkey}`
  const count = getState().asyncCounters[key] + 1 || 1

  dispatch({ type, pending: true, status: 'pending', meta })
  dispatch({ type: countAsync.COUNT_ASYNC, payload: { key, value: count } })
  promise
    .then(payload => {
      if (getState().asyncCounters[key] !== count) {
        return null
      }
      return (
        !isNull(payload) &&
        dispatch({ type, payload, meta, pending: false, status: 'done' })
      )
    })
    .catch(payload => {
      if (payload instanceof ActionError) {
        return failAction(dispatch, type, payload, meta)
      }

      if (Raven.isSetup()) {
        if (payload instanceof HTTPError) {
          payload.response
            .text()
            .then(body => Raven.captureException(payload, { extra: { body } }))
        } else if (
          !(
            payload instanceof TypeError &&
            payload.message.includes('NetworkError')
          )
        ) {
          Raven.captureException(payload)
        }
      }

      if (getState().asyncCounters[key] !== count) {
        return null
      }

      console.log(payload)

      return failAction(
        dispatch,
        type,
        new ActionError('Error occurred. Try again', payload),
        meta,
      )
    })

  return promise
}

const same = data => data
const makeCreator = (type, fn = same) => (...theArgs) => ({
  type,
  payload: fn(...theArgs),
})

export { failAction, promiseAction, makeCreator, ActionError }
