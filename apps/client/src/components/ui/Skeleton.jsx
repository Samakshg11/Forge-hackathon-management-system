import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-surface-raised/60 border border-border-subtle/40 rounded-md ${className}`}
    />
  );
}
