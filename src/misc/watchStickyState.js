import IntersectionObserverPolifil from 'intersection-observer'

const IntersectionObserver =
  window.IntersectionObserver || IntersectionObserverPolifil

const createTriggerPosition = (sticky, styles) => {
  const topValue = styles.top
  switch (topValue) {
    case 'auto':
    case '0px': {
      return null
    }
  }

  // if sticky top position then sentinel should trigger event early then usual
  const sentinel = document.createElement('div')
  sentinel.sticky = sticky

  sentinel.style.position = 'absolute'
  sentinel.style.height = '100%'
  sentinel.style.width = '100%'

  sentinel.style.top = `-${topValue}`

  return sentinel
}

const createSamePosition = (sticky, styles) => {
  const sentinel = document.createElement('div')
  sentinel.sticky = sticky

  sentinel.style.marginTop = styles.marginTop

  sentinel.style.position = 'absolute'
  sentinel.style.height = `${sticky.clientHeight}px`
  sentinel.style.width = `${sticky.clientWidth}px`
  sentinel.style.transform = 'translate(0, -100%)'
  sentinel.style.maxWidth = '100%'

  sentinel.style.visibility = 'hidden'
  return sentinel
}

const createSentinel = sticky => {
  const styles = window.getComputedStyle(sticky)
  const wrap = createSamePosition(sticky, styles)
  const target = createTriggerPosition(sticky, styles)
  if (target) {
    wrap.appendChild(target)
  }
  return {
    wrap,
    target: target || wrap,
  }
}

const matchUnit = /(-??\d+)(.*)/

const parseUnit = string => {
  const parsed = string.match(matchUnit)
  return (
    parsed && {
      value: parseFloat(parsed[1]),
      unit: parsed[2],
    }
  )
}

const mathSign = value => (value >= 0 ? '+' : '-')

function offsetSentinel(sticky) {
  const sentinel = document.createElement('div')
  sentinel.sticky = sticky

  const styles = window.getComputedStyle(sticky)
  const top = parseUnit(styles.top)

  sentinel.style.position = 'absolute'
  sentinel.style.height = `${sticky.clientHeight}px`
  sentinel.style.width = `${sticky.clientWidth}px`
  sentinel.style.top = `calc( ${sticky.offsetTop}px ${mathSign(
    -top.value,
  )} ${Math.abs(top.value)}${top.unit} - ${sticky.clientHeight}px )`
  sentinel.style.left = `${sticky.offsetLeft}px`
  sentinel.style.maxWidth = '100%'
  sentinel.style.zIndex = '-1'

  return {
    wrap: sentinel,
    target: sentinel,
  }
}

function observeHeaders(callback, stickyList, options) {
  const container = options && options.container
  const isRelative = options && options.isRelative

  const handleItem = record => {
    const targetInfo = record.boundingClientRect
    const stickyTarget = record.target.sticky
    const rootBoundsInfo = record.rootBounds

    // Started sticking.
    if (targetInfo.bottom < rootBoundsInfo.top) {
      callback(true, stickyTarget)
    }

    // Stopped sticking.
    if (
      targetInfo.bottom >= rootBoundsInfo.top &&
      targetInfo.bottom < rootBoundsInfo.bottom
    ) {
      callback(false, stickyTarget)
    }
  }
  const observer = new IntersectionObserver(
    records => {
      records.forEach(handleItem)
    },
    { threshold: [0], root: container || null },
  )

  stickyList.forEach(sticky => {
    // Add the top sentinels to each section and attach an observer.
    const sentinel = isRelative
      ? offsetSentinel(sticky)
      : createSentinel(sticky)
    sticky.parentElement.insertBefore(sentinel.wrap, sticky)

    observer.observe(sentinel.target)
  })

  return () => {
    observer.disconnect()
  }
}

export default observeHeaders
