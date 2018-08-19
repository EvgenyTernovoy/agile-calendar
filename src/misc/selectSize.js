const getAspect = ({ width, height }) => width / height

const selectAspect = (wider, taller, currentAspect) => {
  const wideAspect = getAspect(wider)
  const tallAspect = getAspect(taller)
  const normalizedRatio = Math.min(wideAspect, Math.max(tallAspect, currentAspect))

  const factor = (normalizedRatio - tallAspect) / (wideAspect - tallAspect)
  const justifiedWidth = taller.width + ((wider.width - taller.width) * factor)
  const justifiedHeight = justifiedWidth / normalizedRatio

  return {
    width: justifiedWidth,
    height: justifiedHeight,
  }
}

const selectSize = (currentAspect, steps) => {
  if (!currentAspect) {
    return null
  }

  if (getAspect(steps[0]) < currentAspect) {
    return steps[0]
  }

  const { next, prev } = steps.reduce((result, step) => {
    const { prev, next } = result
    if (next) {
      return result
    }

    if (getAspect(step) < currentAspect) {
      return {
        prev,
        next: step,
      }
    }

    return {
      prev: step,
    }
  }, {
    prev: steps[0],
  })

  if (!next) {
    return prev
  }

  return selectAspect(prev, next, currentAspect)
}

export const fitSize = (size, aspectRatio) => {
  const height = size.width / aspectRatio
  if (height <= size.height) {
    return {
      width: size.width,
      height,
    }
  }

  return {
    width: size.height * aspectRatio,
    height: size.height,
  }
}

export default selectSize
