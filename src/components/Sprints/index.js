import React from 'react'
import Editable from 'src/components/common/Editable'
import AsidePanel from 'src/components/AsidePanel'
import Goals from 'src/components/Sprints/Goals'
import RS from 'src/modules/resources/types'
import { connect } from 'react-redux'
import create from 'src/misc/create'

import css from './index.css'
import resourceId from '../../misc/resourceId'


class Sprint extends React.PureComponent {

  componentWillMount() {
    const recourceIdn = resourceId('sprints', { id: 'fb193efc-6bfa-40af-9c97-5cb339a06e45' })
    this.props.dispatch(create(RS.RESOURCE_NEEDED, {
      need: recourceIdn,
      needy: recourceIdn,
    }))
  }

  render() {
    return (
      <React.Fragment>
        <AsidePanel />
        <div className={css.sprintWrap}>
          <div className={css.sprintHead}>
            <div className={css.sprintName}>
              Спринт 1
            </div>
            <div className={css.sprintDates}>
              <div className={css.sprintDate}>
                <span>старт</span> <Editable placeholder={'начало'} />
              </div>
              <div className={css.sprintDate}>
                <span>конец</span> <Editable placeholder={'конец'} />
              </div>
            </div>
          </div>
          <Goals />
        </div>
      </React.Fragment>
    )
  }
}


export default connect()(Sprint)
