import React from 'react'

import css from './pure.css'

const Panel = () => (

  <div className={css.panelWrap}>
    <div className={css.panelHead}>
      <div className={css.user}>
        <img className={css.userThumbs} src="/images/avatar.png" alt="avatar"/>
        <div className={css.userName}>
          John
        </div>
      </div>
    </div>

  </div>

)

export default Panel
