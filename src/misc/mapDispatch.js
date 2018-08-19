import mapValues from 'lodash/mapValues'

export const mapDispatchNormal = actions => (dispatch, props) =>
  mapValues(actions, value => e => {
    const action = value(props, e)
    return action ? dispatch(action) : null
  })

const mapDispatch = actions => (dispatch, props) => {
  const mapped = mapDispatchNormal(actions)(dispatch, props)
  return () => mapped
}

export default mapDispatch
