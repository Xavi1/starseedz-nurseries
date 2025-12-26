import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-200 text-yellow-800',
  completed: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-200 text-red-800',
  shipped: 'bg-blue-200 text-blue-800',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = statusColors[status.toLowerCase()] || 'bg-gray-200 text-gray-800';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>
  );
};
