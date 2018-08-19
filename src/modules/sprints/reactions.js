import resources from 'src/modules/resources/types'
import { getResource } from 'src/misc/resourceId'
import { promiseAction } from 'src/misc/dispatch'

import fakeSprint from './fakeSprint'


const getSprint = (dispatch, getState, id) => Promise.resolve(fakeSprint)

const loadSprintsList = (getState, dispatch, idn, path) => {

}


export default {
  [resources.RESOURCE_REQUESTED]: [
    (action, { dispatch, getState }) => {
      const idn = action.payload
      if (idn.name !== 'sprints') {
        return
      }

      if (!idn.props || !idn.props.id) {
        loadSprintsList(getState, dispatch, idn, '/projects/')
        return
      }

      promiseAction(
        dispatch,
        getState,
        resources.RESOURCE,
        getSprint(dispatch, getState, idn.props.id),
        idn,
      )
    },
  ],
}

