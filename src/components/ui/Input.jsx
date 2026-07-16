import { useState } from 'react';
import './Input.css';

export default function Input({
  label,
  type = 'text',
  error,
  helperText,
  fullWidth = true,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random()}`;

  return (
    <div className={`input-group ${fullWidth ? 'input-group--full' : ''} ${error ? 'input-group--error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="input-group__label">{label}</label>}
      {type === 'textarea' ? (
        <textarea id={inputId} className="input-group__field input-group__textarea" {...props} />
      ) : (
        <input id={inputId} type={type} className="input-group__field" {...props} />
      )}
      {error && <span className="input-group__error" role="alert">{error}</span>}
      {helperText && !error && <span className="input-group__helper">{helperText}</span>}
    </div>
  );
}
