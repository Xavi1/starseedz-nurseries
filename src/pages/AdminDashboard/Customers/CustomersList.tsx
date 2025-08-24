type CustomersListProps = {
  customers: any[];
  filteredCustomers: any[];
  customerSegmentFilter: string;
  setCustomerSegmentFilter: (filter: string) => void;
  selectedCustomer: number | null;
  setSelectedCustomer: (id: number | null) => void;
};

const CustomersList: React.FC<CustomersListProps> = ({
  customers,
  filteredCustomers,
  customerSegmentFilter,
  setCustomerSegmentFilter,
  selectedCustomer,
  setSelectedCustomer
}) => {
  // Use props for table rendering and filtering
  return (
    <div>
      <h2>Customers List</h2>
      
      {/* Segment filter dropdown */}
      <select 
        value={customerSegmentFilter} 
        onChange={(e) => setCustomerSegmentFilter(e.target.value)}
      >
        <option value="">All Segments</option>
        {/* Add segment options here */}
      </select>

      {/* Customers table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Segment</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map(customer => (
            <tr 
              key={customer.id} 
              onClick={() => setSelectedCustomer(customer.id)}
              style={{ 
                backgroundColor: selectedCustomer === customer.id ? '#e3f2fd' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>{customer.segment}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Total customers: {customers.length}</p>
      <p>Filtered customers: {filteredCustomers.length}</p>
    </div>
  );
};

export default CustomersList;