import React from 'react';
import { Flame, Sparkles, Inbox, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Rive Mascot component wrapper (Document 3 §7)
 * State options: 'idle' | 'loading' | 'success' | 'error' | 'celebrate' | 'empty' | 'sleeping'
 */
export function RiveMascot({ state = 'idle', className = 'w-24 h-24' }) {
  // CSS SVG Fallback for Ember the Flame mascot
  const iconMap = {
    idle: <Flame className="w-12 h-12 text-accent-primary animate-pulse" />,
    loading: <Sparkles className="w-12 h-12 text-accent-secondary animate-spin" />,
    success: <CheckCircle2 className="w-12 h-12 text-status-success animate-bounce" />,
    error: <AlertTriangle className="w-12 h-12 text-status-danger" />,
    celebrate: <Flame className="w-12 h-12 text-accent-primary animate-bounce scale-110" />,
    empty: <Inbox className="w-12 h-12 text-text-secondary/50" />,
    sleeping: <Flame className="w-12 h-12 text-text-secondary/30" />,
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-surface-raised/40 border border-border-subtle p-4 ${className}`}
    >
      {iconMap[state] || iconMap.idle}
    </div>
  );
}
