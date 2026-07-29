import React from 'react';

export function Badge({ status, role, children, className = '' }) {
  let style = 'bg-surface-raised text-text-secondary border-border-subtle';

  if (status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'submitted':
      case 'completed':
      case 'published':
        style = 'bg-status-success/10 text-status-success border-status-success/30';
        break;
      case 'pending':
      case 'draft':
      case 'registration_open':
      case 'submissions_open':
        style = 'bg-status-warning/10 text-status-warning border-status-warning/30';
        break;
      case 'rejected':
      case 'cancelled':
      case 'locked':
        style = 'bg-status-danger/10 text-status-danger border-status-danger/30';
        break;
      case 'judging':
      case 'under_review':
        style = 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/30';
        break;
      default:
        break;
    }
  }

  if (role) {
    switch (role.toLowerCase()) {
      case 'admin':
        style = 'bg-role-admin/10 text-role-admin border-role-admin/30';
        break;
      case 'organizer':
        style = 'bg-role-organizer/10 text-role-organizer border-role-organizer/30';
        break;
      case 'judge':
        style = 'bg-role-judge/10 text-role-judge border-role-judge/30';
        break;
      case 'participant':
        style = 'bg-role-participant/10 text-role-participant border-role-participant/30';
        break;
      default:
        break;
    }
  }

  const label = children || status || role;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
