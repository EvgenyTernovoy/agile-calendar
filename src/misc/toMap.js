export default arr =>
  arr.reduce((accumulator, value) => ({ ...accumulator, [value]: value }), {})
