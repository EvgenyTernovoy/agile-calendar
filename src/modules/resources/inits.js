
const inits = {
}

const init = res => {
  const name = res._identity.name
  if (!inits[name]) {
    return res
  }

  return {
    ...res,
    ...inits[name](res),
  }
}

export default init
