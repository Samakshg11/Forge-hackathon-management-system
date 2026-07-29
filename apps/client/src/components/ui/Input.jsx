import React from 'react';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-surface border border-border-subtle rounded-md px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary transition-all ${
          error ? 'border-status-danger focus:border-status-danger' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-status-danger mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-surface border border-border-subtle rounded-md px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary transition-all resize-y min-h-[100px] ${
          error ? 'border-status-danger focus:border-status-danger' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-status-danger mt-1">{error}</p>}
    </div>
  );
}
