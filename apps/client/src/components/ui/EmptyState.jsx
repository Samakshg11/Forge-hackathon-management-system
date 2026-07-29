import React from 'react';
import { RiveMascot } from './RiveMascot';

export function EmptyState({
  title = 'No items found',
  description = 'There is nothing to display here yet.',
  state = 'empty',
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border-subtle rounded-xl bg-surface/40 ${className}`}>
      <RiveMascot state={state} className="w-20 h-20 mb-4" />
      <h4 className="text-base font-semibold text-text-primary mb-1">{title}</h4>
      <p className="text-sm text-text-secondary max-w-sm mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
