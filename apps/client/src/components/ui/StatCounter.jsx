import React, { useEffect, useRef } from 'react';
import { animateCounter } from '../../animations/gsap';

export function StatCounter({ value, suffix = '', label, className = '' }) {
  const elRef = useRef(null);

  useEffect(() => {
    if (elRef.current && typeof value === 'number') {
      animateCounter(elRef.current, { from: 0, to: value, duration: 1.5, suffix });
    }
  }, [value, suffix]);

  return (
    <div className={`space-y-1 ${className}`}>
      <div
        ref={elRef}
        className="text-3xl font-extrabold tracking-tight font-display text-text-primary"
      >
        {value?.toLocaleString() || 0}
        {suffix}
      </div>
      {label && <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>}
    </div>
  );
}
