import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`flex-col h-[20rem] justify-center items-center rounded-3xl shadow-glass ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={className}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h2 className={`font-bold text-primary-dark ${className}`}>{children}</h2>;
}

export function CardDescription({ children, className = '' }: CardProps) {
  return <p className={className}>{children}</p>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardProps) {
  return <div className={className}>{children}</div>;
}