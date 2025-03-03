// components/ui/Select.tsx
'use client';

import React from 'react';
import './styles.css';

type SelectProps = {
  id?: string;
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
};

export function Select({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = '-- Selecione uma opção --',
  disabled = false,
  required = false,
  className = '',
  error,
}: SelectProps) {
  return (
    <div className={`select-container ${className}`}>
      {label && (
        <label htmlFor={id} className="select-label">
          {label} {required && <span className="select-required">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={`select-input ${error ? 'select-error' : ''}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="select-error-message">{error}</p>}
    </div>
  );
}

// components/ui/Alert.tsx
import React from 'react';
import './styles.css';

type AlertProps = {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
};

export function Alert({ children, variant = 'info', className = '' }: AlertProps) {
  return <div className={`alert alert-${variant} ${className}`}>{children}</div>;
}

// components/ui/LoadingSpinner.tsx
import React from 'react';
import './styles.css';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return <div className={`spinner spinner-${size} ${className}`}></div>;
}