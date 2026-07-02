import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';
}

const VARIANTS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'gray' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${VARIANTS[variant]}`}
  >
    {label}
  </span>
);

export const statusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PENDING: { label: 'En attente', variant: 'gray' },
    IN_PROGRESS: { label: 'En cours', variant: 'blue' },
    COMPLETED: { label: 'Terminé', variant: 'green' },
    CANCELLED: { label: 'Annulé', variant: 'red' },
  };
  const cfg = map[status] ?? { label: status, variant: 'gray' };
  return <Badge label={cfg.label} variant={cfg.variant} />;
};
