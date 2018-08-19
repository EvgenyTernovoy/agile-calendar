import { reducer as formReducer } from 'redux-form'

// import config from 'src/modules/config'
import asyncCounters from 'src/modules/asyncCounters/reducer'
// import now from 'src/modules/now/reducer'
import resources from 'src/modules/resources/reducer'
// import window from 'src/modules/window/reducer'
// import user from 'src/modules/user/reducer'
// import modal from 'src/modules/modal/reducer'
// import slideTableContent from 'src/modules/slideTableContent/reducer'
// import uploadedFiles from 'src/modules/uploadedFiles/reducer'
// import browse from 'src/modules/browse/reducer'

import routing from './routing'
import combine from './combine'

const updater = (fn, initialState) => ({ fn, initialState })

export default combine({
  // installation: updater(installation.reducer, installation.init()),
  // meta: updater(meta.reducer, meta.initialState),
  // form: formReducer,
  // config: updater(config.reducer, config.initialState),
  // browse: updater(browse.reducer, browse.initialState),
  // routing: updater(routing.reducer, routing.initialState),
  // user: updater(user.reducer, user.init()),
  asyncCounters: updater(asyncCounters.reducer, asyncCounters.initialState),
  // now: updater(now.reducer, now.initialState),
  resources: updater(resources.reducer, resources.initialState),
  // window: updater(window.reducer, window.init()),
  // modal: updater(modal.reducer, modal.initialState),
  // slideTableContent: updater(slideTableContent.reducer, slideTableContent.initialState),
  // uploadedFiles: updater(uploadedFiles.reducer, uploadedFiles.initialState),
})
