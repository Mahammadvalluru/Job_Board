import React from 'react';
import Button from './Button';
import './EmptyState.css';

/**
 * EmptyState — centered placeholder with icon, title, description, optional CTA.
 *
 * @param {string|React.ReactNode} [props.icon]
 * @param {string}  props.title
 * @param {string}  [props.description]
 * @param {object}  [props.action]     — { label, onClick, variant, ...rest }
 * @param {boolean} [props.compact]
 * @param {string}  [props.className]
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className = '',
}) {
  return (
    <div className={`empty-state ${compact ? 'empty-state--compact' : ''} ${className}`}>
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && (
        <div className="empty-state__action">
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            {...action}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
