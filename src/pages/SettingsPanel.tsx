import React from 'react';
import StoreSettings from '../components/Settings/StoreSettings';

// User Management UI matching screenshot
import { Pencil, Trash2, Plus, CreditCard } from 'lucide-react';
const initialUsers = [
  {
    name: 'Admin User',
    email: 'admin@greenthumb.com',
    role: 'Administrator',
    status: 'Active',
  },
  {
    name: 'John Smith',
    email: 'john@greenthumb.com',
    role: 'Manager',
    status: 'Active',
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@greenthumb.com',
    role: 'Staff',
    status: 'Active',
  },
];
const roleColors = {
  Administrator: 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Staff: 'bg-green-100 text-green-700',
};
const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
};
const initialRoles = [
  {
    name: 'Administrator',
    description: 'Full access to all settings and data',
  },
  {
    name: 'Manager',
    description: 'Can manage products, orders, and customers',
  },
  {
    name: 'Staff',
    description: 'Can view orders and manage inventory',
  },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = React.useState(initialUsers);
  const [roles, setRoles] = React.useState(initialRoles);
  const [showUserModal, setShowUserModal] = React.useState(false);
  const [showRoleModal, setShowRoleModal] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', role: 'Staff', status: 'Active' });
  const [roleForm, setRoleForm] = React.useState({ name: '', description: '' });

  // Add user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers([...users, form]);
    setShowUserModal(false);
    setForm({ name: '', email: '', role: 'Staff', status: 'Active' });
  };
  // Add role
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    setRoles([...roles, roleForm]);
    setShowRoleModal(false);
    setRoleForm({ name: '', description: '' });
  };
  // Delete user
  const handleDeleteUser = (idx: number) => {
    setUsers(users.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 font-bold text-base">
                      {user.name.charAt(0)}
                    </span>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${(roleColors as Record<string, string>)[user.role] || 'bg-gray-100 text-gray-700'}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${(statusColors as Record<string, string>)[user.status] || 'bg-gray-100 text-gray-700'}`}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button className="p-2 rounded hover:bg-gray-100" title="Edit"><Pencil className="h-4 w-4 text-gray-500" /></button>
                    <button className="p-2 rounded hover:bg-gray-100" title="Delete" onClick={() => handleDeleteUser(idx)}><Trash2 className="h-4 w-4 text-gray-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Roles Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Roles</h3>
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-md">
          {roles.map((role, idx) => (
            <div className="flex justify-between items-center p-4" key={idx}>
              <div>
                <span className="font-semibold text-gray-900">{role.name}</span>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
              <button className="p-2 rounded hover:bg-gray-100" title="Edit"><Pencil className="h-4 w-4 text-gray-500" /></button>
            </div>
          ))}
        </div>
        <div className="pt-4">
          <button onClick={() => setShowRoleModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><Plus className="h-4 w-4" /> Add Role</button>
        </div>
      </div>

      {/* Add Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Role</h3>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role Name</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={roleForm.name} onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={roleForm.description} onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowRoleModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Add Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentMethods: React.FC = () => {
  const [methods] = React.useState([
    {
      name: 'Credit Card',
      description: 'Accept Visa, Mastercard, Amex, Discover',
      icon: <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-gray-100"><CreditCard className="h-6 w-6 text-gray-700" /></span>,
      status: 'Enabled',
      statusColor: 'bg-green-100 text-green-700',
    },
    {
      name: 'PayPal',
      description: 'Accept payments via PayPal',
      icon: <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-blue-100"><span className="font-bold text-blue-700 text-lg">PayPal</span></span>,
      status: 'Enabled',
      statusColor: 'bg-green-100 text-green-700',
    },
    {
      name: 'Apple Pay',
      description: 'Accept payments via Apple Pay',
      icon: <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-yellow-100"><span className="font-bold text-yellow-700 text-base">Apple</span></span>,
      status: 'Disabled',
      statusColor: 'bg-gray-100 text-gray-700',
    },
  ]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  // Payment processor state
  const [processor, setProcessor] = React.useState('Stripe');
  const [mode, setMode] = React.useState('Test Mode');
  const [apiKey, setApiKey] = React.useState('sk_test_************');

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          {methods.map((method, idx) => (
            <div key={idx} className={`flex items-center px-6 py-4 ${idx !== methods.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="flex-shrink-0 mr-4">{method.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{method.name}</div>
                <div className="text-sm text-gray-500">{method.description}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${method.status === 'Enabled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{method.status}</span>
                <button className="p-2 rounded hover:bg-gray-100" title="Edit"><Pencil className="h-4 w-4 text-gray-500" /></button>
              </div>
            </div>
          ))}
          <div className="px-6 py-4">
            <button type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><Plus className="h-4 w-4" /> Add Payment Method</button>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal (stub) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Payment Method</h3>
            <div className="text-gray-500 mb-4">(Form UI not implemented)</div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800" onClick={() => setShowAddModal(false)}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processor Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Processor</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Processor</label>
            <select className="block w-full border border-gray-300 rounded-md shadow-sm p-2" value={processor} onChange={e => setProcessor(e.target.value)}>
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="Square">Square</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select className="block w-full border border-gray-300 rounded-md shadow-sm p-2" value={mode} onChange={e => setMode(e.target.value)}>
              <option value="Test Mode">Test Mode</option>
              <option value="Live Mode">Live Mode</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input type="password" className="block w-full border border-gray-300 rounded-md shadow-sm p-2" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = React.useState({
    newOrder: true,
    orderStatus: true,
    lowStock: false,
    customerRegistration: true,
  });
  const [smsNotifications, setSmsNotifications] = React.useState({
    orderStatus: false,
    delivery: false,
  });
  const [adminEmail] = React.useState('admin@greenthumb.com');

  const toggleEmail = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleSms = (key: keyof typeof smsNotifications) => {
    setSmsNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Switch UI
  const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-green-600' : 'bg-gray-200'}`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="divide-y divide-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">New Order</div>
                <div className="text-sm text-gray-500">Send email when a new order is placed</div>
              </div>
              <Switch checked={emailNotifications.newOrder} onChange={() => toggleEmail('newOrder')} />
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Order Status Update</div>
                <div className="text-sm text-gray-500">Send email when an order status changes</div>
              </div>
              <Switch checked={emailNotifications.orderStatus} onChange={() => toggleEmail('orderStatus')} />
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Low Stock Alert</div>
                <div className="text-sm text-gray-500">Send email when product stock is low</div>
              </div>
              <Switch checked={emailNotifications.lowStock} onChange={() => toggleEmail('lowStock')} />
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Customer Registration</div>
                <div className="text-sm text-gray-500">Send email when a new customer registers</div>
              </div>
              <Switch checked={emailNotifications.customerRegistration} onChange={() => toggleEmail('customerRegistration')} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h3>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="divide-y divide-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Order Status Updates</div>
                <div className="text-sm text-gray-500">Send SMS when order status changes</div>
              </div>
              <Switch checked={smsNotifications.orderStatus} onChange={() => toggleSms('orderStatus')} />
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Delivery Notifications</div>
                <div className="text-sm text-gray-500">Send SMS when order is delivered</div>
              </div>
              <Switch checked={smsNotifications.delivery} onChange={() => toggleSms('delivery')} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Notifications</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-700 mb-1">Notification Email</div>
          <div className="font-medium text-gray-900">{adminEmail}</div>
        </div>
      </div>
    </div>
  );
};

const SecuritySettings: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex justify-between items-center">
        <div>
          <h5 className="text-sm font-medium text-gray-900">
            Password Expiry
          </h5>
          <p className="text-sm text-gray-500">
            Force users to reset password periodically
          </p>
        </div>
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          API Access
        </h4>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                API Access
              </h5>
              <p className="text-sm text-gray-500 mt-1">
                Allow external applications to access your store data
              </p>
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Manage API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Session Settings
      </h4>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
            Session Timeout (minutes)
          </label>
          <div className="mt-1">
            <input type="number" name="session-timeout" id="session-timeout" defaultValue="30" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface SettingsPanelProps {
  activeSettingsTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ activeSettingsTab, onTabChange }) => {
  const tabs = [
    { key: 'store', label: 'Store Settings' },
    { key: 'users', label: 'User Management' },
    { key: 'payment', label: 'Payment Methods' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 focus:outline-none ${
              activeSettingsTab === tab.key
                ? 'border-green-600 text-green-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-400 bg-gray-50'
            }`}
            onClick={() => onTabChange(tab.key)}
            type="button"
            aria-current={activeSettingsTab === tab.key ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeSettingsTab === 'store' && <StoreSettings />}
      {activeSettingsTab === 'users' && <UserManagement />}
      {activeSettingsTab === 'payment' && <PaymentMethods />}
      {activeSettingsTab === 'notifications' && <NotificationSettings />}
      {activeSettingsTab === 'security' && <SecuritySettings />}
    </div>
  );
};

export default SettingsPanel;