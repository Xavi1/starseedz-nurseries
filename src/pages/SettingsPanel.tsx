import React from 'react';
import StoreSettings from '../components/Settings/StoreSettings';
import { Pencil, Trash2, Plus, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase'; // adjust path to your Firebase config

// ── Types ──────────────────────────────────────────────────────────────────────

interface FirestoreUser {
  id: string; // Firestore document ID
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  segment: string;
  receiveEmails: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  segment: string;
  receiveEmails: boolean;
};

const EMPTY_FORM: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  segment: 'new',
  receiveEmails: false,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const segmentColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  returning: 'bg-purple-100 text-purple-700',
  vip: 'bg-yellow-100 text-yellow-700',
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function tsToIso(val: unknown): string {
  if (!val) return '';
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return '';
}

// ── User Roles (static – not stored in Firestore) ──────────────────────────────

const initialRoles = [
  { name: 'Administrator', description: 'Full access to all settings and data' },
  { name: 'Manager', description: 'Can manage products, orders, and customers' },
  { name: 'Staff', description: 'Can view orders and manage inventory' },
];

// ── Component ──────────────────────────────────────────────────────────────────

const UserManagement: React.FC = () => {
  // Firebase state
  const [users, setUsers] = React.useState<FirestoreUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Roles (local)
  const [roles, setRoles] = React.useState(initialRoles);
  const [showRoleModal, setShowRoleModal] = React.useState(false);
  const [roleForm, setRoleForm] = React.useState({ name: '', description: '' });
  const [showEditRoleModal, setShowEditRoleModal] = React.useState(false);
  const [editRoleIndex, setEditRoleIndex] = React.useState<number | null>(null);
  const [editRoleForm, setEditRoleForm] = React.useState({ name: '', description: '' });

  // Add user modal
  const [showUserModal, setShowUserModal] = React.useState(false);
  const [form, setForm] = React.useState<UserFormData>(EMPTY_FORM);

  // Edit user modal
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<FirestoreUser | null>(null);
  const [editForm, setEditForm] = React.useState<UserFormData>(EMPTY_FORM);

  // ── Fetch users from Firestore ─────────────────────────────────────────────

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const fetched: FirestoreUser[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          uid: data.uid ?? d.id,
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          location: data.location ?? '',
          segment: data.segment ?? 'new',
          receiveEmails: data.receiveEmails ?? false,
          createdAt: tsToIso(data.createdAt),
          updatedAt: tsToIso(data.updatedAt),
          lastLogin: tsToIso(data.lastLogin),
        };
      });
      setUsers(fetched);
    } catch (err) {
      setError('Failed to load users. Check your Firestore permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Add user ───────────────────────────────────────────────────────────────

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = serverTimestamp();
      const docRef = await addDoc(collection(db, 'users'), {
        ...form,
        uid: '',          // uid is set by Firebase Auth on registration; leave blank here
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
      });
      // Optimistically add to local state
      const isoNow = new Date().toISOString();
      setUsers(prev => [
        ...prev,
        { id: docRef.id, uid: docRef.id, ...form, createdAt: isoNow, updatedAt: isoNow, lastLogin: isoNow },
      ]);
      setShowUserModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError('Failed to add user.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit user ──────────────────────────────────────────────────────────────

  const handleEditUser = (user: FirestoreUser) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      segment: user.segment,
      receiveEmails: user.receiveEmails,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const ref = doc(db, 'users', editingUser.id);
      await updateDoc(ref, { ...editForm, updatedAt: serverTimestamp() });
      const isoNow = new Date().toISOString();
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id ? { ...u, ...editForm, updatedAt: isoNow } : u
        )
      );
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      setError('Failed to update user.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete user ────────────────────────────────────────────────────────────

  const handleDeleteUser = async (user: FirestoreUser) => {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'users', user.id));
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      setError('Failed to delete user.');
      console.error(err);
    }
  };

  // ── Roles (local) ──────────────────────────────────────────────────────────

  const handleEditRole = (idx: number) => {
    setEditRoleIndex(idx);
    setEditRoleForm(roles[idx]);
    setShowEditRoleModal(true);
  };

  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editRoleIndex !== null) {
      const updated = [...roles];
      updated[editRoleIndex] = editRoleForm;
      setRoles(updated);
      setShowEditRoleModal(false);
      setEditRoleIndex(null);
    }
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    setRoles(prev => [...prev, roleForm]);
    setShowRoleModal(false);
    setRoleForm({ name: '', description: '' });
  };

  // ── Shared form field helper ───────────────────────────────────────────────

  const UserFormFields = ({
    values,
    onChange,
  }: {
    values: UserFormData;
    onChange: (patch: Partial<UserFormData>) => void;
  }) => (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={values.firstName}
            onChange={e => onChange({ firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={values.lastName}
            onChange={e => onChange({ lastName: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={values.email}
          onChange={e => onChange({ email: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={values.phone}
          onChange={e => onChange({ phone: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={values.location}
          onChange={e => onChange({ location: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Segment</label>
        <select
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={values.segment}
          onChange={e => onChange({ segment: e.target.value })}
        >
          <option value="new">New</option>
          <option value="returning">Returning</option>
          <option value="vip">VIP</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="receiveEmails"
          checked={values.receiveEmails}
          onChange={e => onChange({ receiveEmails: e.target.checked })}
          className="h-4 w-4 text-green-600 border-gray-300 rounded"
        />
        <label htmlFor="receiveEmails" className="text-sm font-medium text-gray-700">
          Receive email notifications
        </label>
      </div>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button className="ml-auto text-red-500 hover:text-red-700" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            User Management
            {!loading && (
              <span className="ml-2 text-sm text-gray-400 font-normal">({users.length} users)</span>
            )}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              title="Refresh"
            >
              ↻
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4" /> Add User
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading users from Firestore…
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No users found in the collection.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 font-bold text-base flex-shrink-0">
                        {user.firstName.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{user.phone || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{user.location || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${segmentColors[user.segment] ?? 'bg-gray-100 text-gray-700'}`}>
                        {user.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{formatDate(user.lastLogin)}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button className="p-2 rounded hover:bg-gray-100" title="Edit" onClick={() => handleEditUser(user)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-2 rounded hover:bg-red-50" title="Delete" onClick={() => handleDeleteUser(user)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <UserFormFields values={form} onChange={patch => setForm(f => ({ ...f, ...patch }))} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <UserFormFields values={editForm} onChange={patch => setEditForm(f => ({ ...f, ...patch }))} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
                </button>
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
              <button className="p-2 rounded hover:bg-gray-100" title="Edit" onClick={() => handleEditRole(idx)}>
                <Pencil className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
        <div className="pt-4">
          <button onClick={() => setShowRoleModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Plus className="h-4 w-4" /> Add Role
          </button>
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditRoleModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Role</h3>
            <form onSubmit={handleEditRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role Name</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editRoleForm.name} onChange={e => setEditRoleForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editRoleForm.description} onChange={e => setEditRoleForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowEditRoleModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  const [methods, setMethods] = React.useState([
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
  const [showEditMethodModal, setShowEditMethodModal] = React.useState(false);
  const [editMethodIndex, setEditMethodIndex] = React.useState<number | null>(null);
  const [editMethodForm, setEditMethodForm] = React.useState({ name: '', description: '', status: 'Enabled' });
    // Edit payment method
    const handleEditMethod = (idx: number) => {
      setEditMethodIndex(idx);
      setEditMethodForm({
        name: methods[idx].name,
        description: methods[idx].description,
        status: methods[idx].status,
      });
      setShowEditMethodModal(true);
    };

    const handleEditMethodSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editMethodIndex !== null) {
        const updatedMethods = [...methods];
        updatedMethods[editMethodIndex] = {
          ...updatedMethods[editMethodIndex],
          name: editMethodForm.name,
          description: editMethodForm.description,
          status: editMethodForm.status,
        };
        setMethods(updatedMethods);
        setShowEditMethodModal(false);
        setEditMethodIndex(null);
      }
    };
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addMethodForm, setAddMethodForm] = React.useState({ name: '', description: '', status: 'Enabled' });
  // Payment processor state
  const [processor, setProcessor] = React.useState('Stripe');
  const [mode, setMode] = React.useState('Test Mode');
  const [apiKey, setApiKey] = React.useState('sk_test_************');

  // Add payment method
  const handleAddMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let icon = null;
    if (addMethodForm.name.toLowerCase().includes('credit')) {
      icon = <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-gray-100"><CreditCard className="h-6 w-6 text-gray-700" /></span>;
    } else if (addMethodForm.name.toLowerCase().includes('paypal')) {
      icon = <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-blue-100"><span className="font-bold text-blue-700 text-lg">PayPal</span></span>;
    } else if (addMethodForm.name.toLowerCase().includes('apple')) {
      icon = <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-yellow-100"><span className="font-bold text-yellow-700 text-base">Apple</span></span>;
    } else {
      icon = <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-gray-200"><span className="font-bold text-gray-700 text-base">{addMethodForm.name.charAt(0).toUpperCase()}</span></span>;
    }
    const statusColor = addMethodForm.status === 'Enabled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
    setMethods([
      ...methods,
      {
        name: addMethodForm.name,
        description: addMethodForm.description,
        icon,
        status: addMethodForm.status,
        statusColor,
      },
    ]);
    setShowAddModal(false);
    setAddMethodForm({ name: '', description: '', status: 'Enabled' });
  };

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
                <span className={`px-2 py-1 rounded text-xs font-semibold ${method.status === 'Enabled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{method.status}</span>                 <button className="p-2 rounded hover:bg-gray-100" title="Edit" onClick={() => handleEditMethod(idx)}><Pencil className="h-4 w-4 text-gray-500" /></button>
              </div>
            </div>
          ))}
                {/* Edit Payment Method Modal */}
                {showEditMethodModal && (
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Payment Method</h3>
                      <form onSubmit={handleEditMethodSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editMethodForm.name} onChange={e => setEditMethodForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editMethodForm.description} onChange={e => setEditMethodForm(f => ({ ...f, description: e.target.value }))} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editMethodForm.status} onChange={e => setEditMethodForm(f => ({ ...f, status: e.target.value }))}>
                            <option value="Enabled">Enabled</option>
                            <option value="Disabled">Disabled</option>
                          </select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowEditMethodModal(false)}>Cancel</button>
                          <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Save Changes</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
          <div className="px-6 py-4">
            <button type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><Plus className="h-4 w-4" /> Add Payment Method</button>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Payment Method</h3>
            <form onSubmit={handleAddMethodSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={addMethodForm.name} onChange={e => setAddMethodForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={addMethodForm.description} onChange={e => setAddMethodForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={addMethodForm.status} onChange={e => setAddMethodForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Add</button>
              </div>
            </form>
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

const SecuritySettings: React.FC = () => {
  const [twoFactor, setTwoFactor] = React.useState(false);
  const [strongPassword, setStrongPassword] = React.useState(true);
  const [passwordExpiry, setPasswordExpiry] = React.useState(false);
  const [apiAccess, setApiAccess] = React.useState(true);
  const [sessionTimeout, setSessionTimeout] = React.useState(30);

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
    <div className="space-y-10">
      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="bg-gray-50 rounded-lg flex items-center justify-between px-6 py-4 mb-6">
          <div>
            <div className="font-medium text-gray-900">Enable Two-Factor Authentication</div>
            <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
          </div>
          <Switch checked={twoFactor} onChange={() => setTwoFactor(v => !v)} />
        </div>
      </div>

      {/* Password Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password Settings</h3>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="divide-y divide-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Require Strong Passwords</div>
                <div className="text-sm text-gray-500">Passwords must include letters, numbers, and special characters</div>
              </div>
              <Switch checked={strongPassword} onChange={() => setStrongPassword(v => !v)} />
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-gray-900">Password Expiry</div>
                <div className="text-sm text-gray-500">Force users to reset password periodically</div>
              </div>
              <Switch checked={passwordExpiry} onChange={() => setPasswordExpiry(v => !v)} />
            </div>
          </div>
        </div>
      </div>

      {/* API Access */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Access</h3>
        <div className="bg-gray-50 rounded-lg flex items-center justify-between px-6 py-4 mb-6">
          <div>
            <div className="font-medium text-gray-900">API Access</div>
            <div className="text-sm text-gray-500">Allow external applications to access your store data</div>
            <button className="inline-flex items-center mt-3 px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Manage API Keys
            </button>
          </div>
          <Switch checked={apiAccess} onChange={() => setApiAccess(v => !v)} />
        </div>
      </div>

      {/* Session Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Settings</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-xs">
          <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700 mb-1">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            name="session-timeout"
            id="session-timeout"
            min={1}
            value={sessionTimeout}
            onChange={e => setSessionTimeout(Number(e.target.value))}
            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

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