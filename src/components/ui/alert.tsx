'use client';

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