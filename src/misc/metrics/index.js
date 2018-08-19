/* eslint no-console: 0 */
import omitBy from 'lodash/omitBy'
import isNil from 'lodash/isNil'

import config, { commonEnvProps } from '~/config'
import { flat } from './utils'

let globalProps = {}

export const setUserProps = props => {
  if (config.disableAnalyticsTracking || config.metricsToConsole) {
    return
  }

  if (window.heap) {
    window.heap.addUserProperties(props)
  }

  if (window.ga) {
    window.ga('set', props)
  }

  if (window.mixpanel) {
    window.mixpanel.people.set(props)
  }

  if (window.amplitude) {
    window.amplitude.getInstance().setUserProperties(props)
  }

  if (window.analytics) {
    window.analytics.identify(props)
  }

  if (window.Intercom) {
    window.Intercom('update', flat(props, '__'))
  }
}

export const trackEnvProps = props => {
  setUserProps(props)

  globalProps = {
    ...globalProps,
    ...props,
  }

  if (config.disableAnalyticsTracking || config.metricsToConsole) {
    return
  }

  if (window.heap) {
    // https://docs.heapanalytics.com/reference#addeventproperties
    // not addUserProperties but addEventProperties
    window.heap.addEventProperties(props)
  }

  if (window.mixpanel) {
    // https://mixpanel.com/help/reference/javascript#super-properties
    window.mixpanel.register(props)
  }
}

export const track = (name, _props = {}) => {
  const date = new Date()

  const cleanDottedProps = omitBy(
    {
      ...flat({ env: globalProps }),
      ...flat(_props),
      time: date.toJSON(),
      localHour: date.getHours(),
    },
    isNil,
  )

  if (config.metricsToConsole) {
    console.log(name, cleanDottedProps)
    return
  }

  if (config.disableAnalyticsTracking) {
    return
  }

  if (window.heap) {
    window.heap.track(name, cleanDottedProps)
  }

  if (window.ga) {
    window.ga('send', 'event', 'empty', name, null, null, cleanDottedProps)
  }

  if (window.mixpanel) {
    window.mixpanel.track(name, cleanDottedProps)
  }

  if (window.amplitude) {
    window.amplitude.getInstance().logEvent(name, cleanDottedProps)
  }

  if (window.analytics) {
    window.analytics.track(name, cleanDottedProps)
  }

  if (window.Intercom) {
    window.Intercom(
      'trackEvent',
      name,
      omitBy(
        {
          ...flat({ env: globalProps }, '__'),
          ...flat(_props, '--'),
          time: date.toJSON(),
          localHour: date.getHours(),
        },
        isNil,
      ),
    )
  }
}

export const trackOutUser = () => {
  if (config.disableAnalyticsTracking || config.metricsToConsole) {
    return
  }

  if (window.amplitude) {
    // https://amplitude.zendesk.com/hc/en-us/articles/115001361248#logging-out-and-anonymous-users
    window.amplitude.getInstance().setUserId(null) // not string 'null'
    window.amplitude.getInstance().regenerateDeviceId()
  }

  // heap has no way to logout

  if (window.mixpanel) {
    window.mixpanel.reset()

    // https://mixpanel.com/help/reference/javascript#super-properties
    // temporarly used to help fetch proper retention from mixpanel
    window.mixpanel.register(
      flat({
        temp: {
          user: {
            has_auth: false,
            is_truckerpath: false,
          },
        },
      }),
    )
  }

  if (window.ga) {
    // could be wrong
    // https://stackoverflow.com/questions/11647713/is-it-possible-to-manually-end-a-google-analytics-session
    window.ga('send', 'pageview', { sessionControl: 'start' })
  }

  if (window.analytics) {
    window.analytics.reset()
  }

  trackEnvProps(commonEnvProps)
}

export const trackName = (firstName, lastName) => {
  if (config.disableAnalyticsTracking || config.metricsToConsole) {
    return
  }

  const fullName = [firstName, lastName].filter(i => i).join(' ')

  if (window.heap) {
    window.heap.addUserProperties({
      name: fullName,
    })
  }

  if (window.mixpanel) {
    window.mixpanel.people.set({
      name: fullName,
    })
  }

  if (window.amplitude) {
    window.amplitude.getInstance().setUserProperties({
      name: fullName,
    })
  }

  if (window.Intercom) {
    window.Intercom('update', {
      name: fullName,
    })
  }
}

export const trackUser = (user, signup) => {
  if (config.disableAnalyticsTracking || config.metricsToConsole) {
    return
  }

  const userName = [user.firstName, user.lastName].filter(i => i).join(' ')

  window.heap.identify(user.id)
  window.heap.addUserProperties({
    name: userName,
    email: user.email,
  })

  if (window.ga) {
    window.ga('set', 'userId', user.id)
  }

  if (window.mixpanel) {
    if (signup) {
      window.mixpanel.alias(user.id)
    } else {
      window.mixpanel.identify(user.id)
    }

    window.mixpanel.people.set({
      name: userName,
      email: user.email,
    })

    // https://mixpanel.com/help/reference/javascript#super-properties
    // temporarly used to help fetch proper retention from mixpanel
    window.mixpanel.register(
      flat({
        temp: {
          user: {
            has_auth: true,
            is_truckerpath:
              user.email && Boolean(user.email.match(/\@truckerpath\.com$/)),
          },
        },
      }),
    )
  }

  if (window.amplitude) {
    window.amplitude.getInstance().setUserId(user.id)
    window.amplitude.getInstance().setUserProperties({
      name: userName,
      email: user.email,
    })
  }

  if (window.analytics) {
    if (signup) {
      window.analytics.alias(user.id)
    } else {
      window.analytics.identify(user.id)
    }
  }
}

export const trackPageView = action => {
  const pathname = action.payload.pathname

  const commonProps = { 'page-pathname': pathname }
  const eventProps = { pathname: pathname }
  const eventPropsExtended = {
    ...flat({ env: globalProps }),
    ...eventProps,
  }

  if (config.metricsToConsole) {
    console.log('trackPageView', action)
  }

  if (config.disableAnalyticsTracking) {
    return
  }

  if (window.heap) {
    // https://docs.heapanalytics.com/reference#addeventproperties
    // not addUserProperties but addEventProperties
    window.heap.addEventProperties(commonProps)
    window.heap.track('page_viewed', eventPropsExtended)
  }

  if (window.mixpanel) {
    // https://mixpanel.com/help/reference/javascript#super-properties
    window.mixpanel.register(commonProps)

    if (action.payload.action !== 'REPLACE') {
      window.mixpanel.track('page viewed', {
        url: pathname,
      })
    }
  }

  if (window.ga) {
    window.ga('set', {
      page: pathname,
    })

    if (action.payload.action !== 'REPLACE') {
      window.ga('send', 'pageview')
    }
  }

  if (window.amplitude) {
    // https://amplitude.zendesk.com/hc/en-us/articles/207108327-Step-4-Set-User-Properties-and-Event-Properties
    window.amplitude.getInstance().setUserProperties(commonProps)

    if (action.payload.action !== 'REPLACE') {
      window.amplitude.logEvent('pageview', eventPropsExtended)
    }
  }

  if (window.analytics) {
    if (action.payload.action !== 'REPLACE') {
      window.analytics.page(pathname)
      window.analytics.track('page_viewed', eventPropsExtended)
    }
  }

  if (window.Intercom) {
    window.Intercom('trackEvent', 'pageview', {
      ...flat({ env: globalProps }, '__'),
      ...eventProps,
    })
  }
}
