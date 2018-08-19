import React from 'react'
import cs from 'classnames'

import css from './index.css'

import pen from './pen.svg'

const handleFocus = event => {
  event.target.select()
}

const Editable = ({
      value, change, inputClassName, placeholder, disallowEdit, inputWrapClass,
      type = 'input', maxRows = '3',
}) => (
  <label className={cs(css.inputWrap, css[inputWrapClass])} >
    {
      type === 'textarea'
      ? <textarea
        className={cs(css.input, inputClassName)}
        type="text"
        onBlur={this.disableEdit}
        value={value || ''}
        onChange={change}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disallowEdit}
        size={5}
      />
      : <input
        className={cs(css.input, inputClassName)}
        type="text"
        onBlur={this.disableEdit}
        value={value || ''}
        onChange={change}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disallowEdit}
        size={5}
      />
    }
    <svg className={css.inputIcon} viewBox={pen.viewBox}>
      <use xlinkHref={`#${pen.id}`} />
    </svg>
    <span className={css.buffer}>{value || placeholder}</span>
  </label>
)

export default Editable

