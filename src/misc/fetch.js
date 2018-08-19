/* eslint no-restricted-globals: [2, "find"] */

import isString from 'lodash/isString'

import config from 'src/config'
import getStorageValue from 'src/misc/getStorageValue'
import create from 'src/misc/create'
import USER from 'src/modules/user/types'

import HTTPError from './HTTPError'

// const host = getStorageValue('host') || config.tpApiHost || 'api'
// const protocol = host === 'api' ? 'https:' : location.protocol
const apiHost = ''

const throwOnError = response => {
  if (response.status >= 400) {
    throw new HTTPError(response)
  }
  return response
}

// const clientHeaderValue = 'InstapayOperation/20180108.0000.0'

const getFetchedJSON = response => response.json()

const fetchWithState = (
  dispatch,
  getState,
  { url, body, headers = {}, method = 'GET', hasCustomBody },
  skipToken,
) => {
  const string = isString(body)
  const customBody = Boolean(hasCustomBody || headers['Content-Type'])
  const hds = {
    ...headers,
    // Client: clientHeaderValue,
  }

  if (!customBody && (method !== 'GET' && method !== 'DELETE')) {
    hds['Content-Type'] = string
        ? 'application/x-www-form-urlencoded'
        : 'application/json'
  }

  const state = getState()
  const token = state.user.token

  if (!skipToken && token) {
    hds.Authorization = `Bearer ${token}`
  }
  const id = state.installation && state.installation.id
  if (id) {
    hds['Installation-ID'] = id
  }

  const fullURL = url.startsWith('http') ? url : `${apiHost}${url}`

  return window
    .fetch(fullURL, {
      method,
      headers: hds,
      mode: 'cors',
      body: (string || customBody) ? body : JSON.stringify(body),
    })
    .then(resp => {
      if (resp.status === 401) {
        return resp.clone().text().then(text => {
          if (text.includes('JWT token')) {
            dispatch(create(USER.USER_TOKEN_EXPIRED))
          }
          return resp
        })
      }

      return resp
    })
    .then(throwOnError)
}

export { getFetchedJSON, throwOnError, fetchWithState }
