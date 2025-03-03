'use client';

import '@/styles/ui.scss'

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h3 className={`card-title ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: CardProps) {
  return <p className={`card-description ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`card-content ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardProps) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}