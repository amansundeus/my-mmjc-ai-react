import './FormField.css'

function FormField({
  label,
  required = false,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  options = [],
  id,
  name,
  disabled = false,
  className = '',
  prefix = '',
  isAiFilled = false,
  step,
  multiple = false,
  error = null,
}) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '-')

  let displayValue = value !== undefined && value !== null ? value : ''
  if (type === 'date' && displayValue) {
    const parts = displayValue.split('/')
    if (parts.length === 3) {
      displayValue = `${parts[2]}-${parts[1]}-${parts[0]}`
    }
  }

  const handleInputChange = (e) => {
    let newValue = e.target.value
    if (type === 'date' && newValue) {
      const parts = newValue.split('-')
      if (parts.length === 3) {
        newValue = `${parts[2]}/${parts[1]}/${parts[0]}`
      }
    }
    // Create a synthetic target object that preserves necessary properties
    onChange({
      ...e,
      target: { 
        name: e.target.name,
        id: e.target.id,
        value: newValue,
        type: e.target.type,
        checked: e.target.checked
      }
    })
  }

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <div className="form-field__select-wrapper">
            <select
              className="form-field__input form-field__select"
              id={fieldId}
              name={name || fieldId}
              value={displayValue}
              onChange={handleInputChange}
              disabled={disabled}
            >
              {placeholder && <option value="">{placeholder}</option>}
              {(options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="form-field__select-arrow">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        )
      
      case 'file':
        return (
          <div className="form-field__file-wrapper">
            <input
              type="file"
              id={fieldId}
              style={{ display: 'none' }}
              onChange={onChange}
              disabled={disabled}
              multiple={multiple}
            />
            <div 
              className="form-field__file-display" 
              onClick={() => !disabled && document.getElementById(fieldId)?.click()}
              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              <span className="form-field__file-icon">📎</span>
              <span className="form-field__file-name">{value || placeholder || 'Choose file...'}</span>
              <button className="form-field__file-upload-btn" type="button" id={`${fieldId}-upload`} disabled={disabled}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M8 3L4.5 6.5M8 3L11.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )
      
      case 'radio':
        return (
          <div className="form-field__radio-group" id={fieldId}>
            {(options || []).map((opt) => (
              <label key={opt.value} className="form-field__radio-label">
                <input
                  type="radio"
                  name={fieldId}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={onChange}
                  disabled={disabled}
                  className="form-field__radio-input"
                />
                <span className="form-field__radio-text">{opt.label}</span>
              </label>
            ))}
          </div>
        )
      
      case 'currency':
        return (
          <div className="form-field__currency-wrapper">
            {prefix && <span className="form-field__currency-prefix">{prefix}</span>}
            <input
              className="form-field__input form-field__input--with-prefix"
              type="number"
              id={fieldId}
              name={name || fieldId}
              placeholder={placeholder}
              value={displayValue}
              onChange={handleInputChange}
              disabled={disabled}
            />
          </div>
        )

      default:
        return (
          <input
            className="form-field__input"
            type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
            id={fieldId}
            name={name || fieldId}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            disabled={disabled}
            step={type === 'number' ? step : undefined}
          />
        )
    }
  }

  return (
    <div className={`form-field ${isAiFilled ? 'form-field--ai-filled' : ''} ${className}`}>
      {label && (
        <label className="form-field__label" htmlFor={fieldId}>
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      <div className="form-field__control">
        {renderInput()}
        {isAiFilled && (
          <div className="form-field__ai-indicator" title="Auto-filled by AI">
            ✨
          </div>
        )}
      </div>
      {error && (
        <div className="form-field__error" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default FormField
