const create = (type, payload) => ({ type, payload })

const same = data => data
const prepare = (type, fn = same) => (...theArgs) =>
  create(type, fn(...theArgs))

export { prepare }
export default create
