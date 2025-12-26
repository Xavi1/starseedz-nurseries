import React from 'react';

const OrdersTable: React.FC = () => {
  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4">Order ID</th>
          <th className="py-2 px-4">Customer</th>
          <th className="py-2 px-4">Status</th>
          <th className="py-2 px-4">Total</th>
        </tr>
      </thead>
      <tbody>
        {/* Order rows here */}
      </tbody>
    </table>
  );
};

export default OrdersTable;
