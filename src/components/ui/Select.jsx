import React, { useId } from 'react';
import './Select.css';

/**
 * Select — styled native <select> wrapper.
 *
 * @param {object}  props
 * @param {string}  [props.label]
 * @param {{value:string,label:string}[]} props.options
 * @param {string|string[]}  props.value
 * @param {Function}         props.onChange
 * @param {string}  [props.placeholder]
 * @param {string}  [props.error]
 * @param {boolean} [props.multiple]
 * @param {string}  [props.name]
 * @param {boolean} [props.disabled]
 * @param {string}  [props.className]
 */
export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  multiple = false,
  name,
  disabled = false,
  className = '',
  ...rest
}) {
  const uid = useId();
  const selectId = `select-${uid}`;
  const errorId = `select-err-${uid}`;

  const isPlaceholder = value === '' || value === undefined || value === null;

  return (
    <div className={`select-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
        </label>
      )}
      <div className="select-wrapper">
        <select
          id={selectId}
          name={name}
          className={`select-field ${error ? 'select-field--error' : ''} ${isPlaceholder && !multiple ? 'select-field--placeholder' : ''}`}
          value={value}
          onChange={onChange}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        >
          {!multiple && !options.some((opt) => opt.value === '') && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {!multiple && (
          <span className="select-chevron" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </span>
        )}
      </div>
      {error && (
        <span id={errorId} className="select-error" role="alert">
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
