import React, { useState, useEffect } from 'react';

export function CountdownTimer({ targetDate, label = 'Deadline', onExpire }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.expired) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-danger bg-status-danger/10 px-3 py-1 rounded-full border border-status-danger/30">
        <span className="w-1.5 h-1.5 rounded-full bg-status-danger" />
        {label} Expired
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 bg-surface-raised/80 border border-border-subtle px-3.5 py-1.5 rounded-lg font-mono text-xs text-text-primary">
      <span className="text-text-secondary uppercase font-sans text-[10px] tracking-wider">{label}:</span>
      <div className="flex items-center gap-1 font-bold text-accent-primary">
        <span>{String(timeLeft.days).padStart(2, '0')}d</span>
        <span>:</span>
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span>:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
}
