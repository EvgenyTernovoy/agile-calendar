
const askToken = fn => (...args) => {
  const [,, user] = args
  return user && user.token && fn(...args)
}

export default {
  sprint: {
    pattern: '/sprint/:id',
  }
}
