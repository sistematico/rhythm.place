'use client';

import '@/styles/ui.scss'

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return <div className={`spinner spinner-${size} ${className}`}></div>;
}