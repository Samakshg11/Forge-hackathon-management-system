import React from 'react';

export function Card({ children, interactive = false, className = '', ...props }) {
  return (
    <div
      className={`bg-surface border border-border-subtle rounded-lg p-5 shadow-sm ${
        interactive
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-text-secondary/30 transition-all duration-200'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
