import React from 'react';

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Order Placed': return 'bg-yellow-100 text-yellow-800';
    case 'Processing': return 'bg-blue-100 text-blue-800';
    case 'Shipped': return 'bg-purple-100 text-purple-800';
    case 'Delivered': return 'bg-green-100 text-green-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

interface Props {
  status: string;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;