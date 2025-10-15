import { EditIcon } from 'lucide-react';

type CustomersListProps = {
  customers: any[];
  filteredCustomers: any[];
  customerSegmentFilter: string;
  setCustomerSegmentFilter: (filter: string) => void;
  selectedCustomer: number | null;
  setSelectedCustomer: (id: number | null) => void;
  onEditCustomer: (customer: any) => void;
};

const CustomersList: React.FC<CustomersListProps> = ({
  customers,
  filteredCustomers,
  customerSegmentFilter,
  setCustomerSegmentFilter,
  selectedCustomer,
  setSelectedCustomer,
  onEditCustomer
}) => {
  // Helper function to get badge color for segment
  const getSegmentBadgeClass = (segment: string) => {
    switch (segment) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'repeat':
        return 'bg-green-100 text-green-800';
      case 'high':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Customers</h3>
        <select 
          value={customerSegmentFilter} 
          onChange={(e) => setCustomerSegmentFilter(e.target.value)}
          className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
        >
          <option value="all">All Segments</option>
          <option value="new">New</option>
          <option value="repeat">Repeat</option>
          <option value="high">High Value</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Segment
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map(customer => (
              <tr 
                key={customer.id}
                className={`hover:bg-gray-50 ${selectedCustomer === customer.id ? 'bg-green-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Added {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.location || 'Not specified'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.ordersCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${customer.totalSpent?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSegmentBadgeClass(customer.segment)}`}>
                    {customer.segment || 'new'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCustomer(customer);
                    }}
                    className="text-green-600 hover:text-green-900"
                  >
                    <EditIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredCustomers.length}</span> of{' '}
          <span className="font-medium">{customers.length}</span> total customers
        </div>
      </div>
    </div>
  );
};

export default CustomersList;