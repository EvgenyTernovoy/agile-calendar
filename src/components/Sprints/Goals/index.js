import React from 'react'
import Editable from 'src/components/common/Editable'

import css from './index.css'

const Goals = () => {
  return (
    <React.Fragment>
      <div className={css.wrap}>
        <div className={css.title}>
          Цели спринта
        </div>
        <div className={css.goalsWrap}>
          <div className={css.goal}>
            <div className={css.goalTitle}>
              <div className={css.goalSubTitle}>Цель 1</div>
              <div className={css.titleInput}>
                <Editable value={'Улучшить знание английского языка до Intermediate'} placeholder={'Ваша цель'} type={'textarea'} />
              </div>
            </div>
            <div className={css.stages}>
              <div className={css.stagesTitle}>
                Этапы:
              </div>
              <ol className={css.stagesList}>
                <li>
                  <Editable value={'Найти школу'} placeholder={'Этап'} type={'input'} />
                </li>
                <li>
                  <Editable value={'Построить план занятий'} placeholder={'Этап'} type={'input'} />
                </li>
                <li>
                  <Editable placeholder={'Этап'} type={'input'} />
                </li>
              </ol>
            </div>
          </div>
        </div>

      </div>
    </React.Fragment>
  )
}

export default Goals
