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

  const handleDeleteRole = (idx: number) => {
    if (!window.confirm(`Delete role "${roles[idx].name}"? This cannot be undone.`)) return;
    setRoles(prev => prev.filter((_, i) => i !== idx));
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
              <div className="flex gap-2">
                <button className="p-2 rounded hover:bg-gray-100" title="Edit" onClick={() => handleEditRole(idx)}>
                  <Pencil className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-2 rounded hover:bg-red-50" title="Delete" onClick={() => handleDeleteRole(idx)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
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

// ── Types for PaymentMethods ───────────────────────────────────────────────────

interface PaymentMethodDoc {
  id: string;         // Firestore doc ID (same as normalized type key)
  name: string;       // Display name e.g. "Cash on Delivery"
  description: string;
  enabled: boolean;
  updatedAt?: string;
}

interface OrderPaymentStat {
  type: string;       // raw paymentMethod.type from orders
  count: number;
  totalRevenue: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Normalize a raw payment type string into a stable Firestore doc ID key */
function normalizeType(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/** Pick icon + colour palette based on method name */
function methodIcon(name: string): React.ReactNode {
  const n = name.toLowerCase();
  if (n.includes('credit') || n.includes('card') || n.includes('visa') || n.includes('mastercard'))
    return <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-gray-100"><CreditCard className="h-6 w-6 text-gray-700" /></span>;
  if (n.includes('paypal'))
    return <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-blue-100"><span className="font-bold text-blue-700 text-sm">PP</span></span>;
  if (n.includes('apple'))
    return <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-yellow-100"><span className="font-bold text-yellow-700 text-sm">AP</span></span>;
  if (n.includes('cash') || n.includes('cod') || n.includes('delivery'))
    return <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-green-100"><span className="text-green-700 text-lg font-bold">₱</span></span>;
  if (n.includes('gcash') || n.includes('g-cash'))
    return <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-blue-100"><span className="font-bold text-blue-600 text-sm">GC</span></span>;
  return (
    <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-gray-200">
      <span className="font-bold text-gray-700 text-base">{name.charAt(0).toUpperCase()}</span>
    </span>
  );
}

const PaymentMethods: React.FC = () => {
  // ── Firestore state ──────────────────────────────────────────────────────────
  const [methods, setMethods] = React.useState<PaymentMethodDoc[]>([]);
  const [orderStats, setOrderStats] = React.useState<OrderPaymentStat[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingMethod, setEditingMethod] = React.useState<PaymentMethodDoc | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', description: '', enabled: true });
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addForm, setAddForm] = React.useState({ name: '', description: '', enabled: true });

  // ── Fetch: payment method settings + order stats ───────────────────────────
  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load saved payment method settings from `paymentMethods` collection
      const pmSnap = await getDocs(collection(db, 'paymentMethods'));
      const savedMethods: PaymentMethodDoc[] = pmSnap.docs.map(d => ({
        id: d.id,
        name: (d.data().name as string) ?? d.id,
        description: (d.data().description as string) ?? '',
        enabled: (d.data().enabled as boolean) ?? true,
        updatedAt: tsToIso(d.data().updatedAt),
      }));

      // 2. Load orders to derive payment method usage stats
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const statMap = new Map<string, OrderPaymentStat>();

      ordersSnap.docs.forEach(d => {
        const data = d.data();
        const pm = data.paymentMethod as { type?: string; last4?: string } | undefined;
        const rawType = pm?.type ?? 'Unknown';
        const key = normalizeType(rawType);
        const total = typeof data.total === 'number' ? data.total : 0;

        if (statMap.has(key)) {
          const existing = statMap.get(key)!;
          existing.count += 1;
          existing.totalRevenue += total;
        } else {
          statMap.set(key, { type: rawType, count: 1, totalRevenue: total });
        }

        // Auto-create a settings doc if this type was never seen before
        if (!savedMethods.find(m => m.id === key)) {
          savedMethods.push({
            id: key,
            name: rawType,
            description: `Collected from orders`,
            enabled: true,
          });
        }
      });

      setMethods(savedMethods);
      setOrderStats(Array.from(statMap.values()).sort((a, b) => b.count - a.count));
    } catch (err) {
      setError('Failed to load payment data. Check your Firestore permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Toggle enabled/disabled & persist to Firestore ─────────────────────────
  const handleToggleEnabled = async (method: PaymentMethodDoc) => {
    const newEnabled = !method.enabled;
    // Optimistic update
    setMethods(prev => prev.map(m => m.id === method.id ? { ...m, enabled: newEnabled } : m));
    try {
      const ref = doc(db, 'paymentMethods', method.id);
      await updateDoc(ref, { enabled: newEnabled, updatedAt: serverTimestamp() }).catch(async () => {
        // Doc might not exist yet — create it
        await addDoc(collection(db, 'paymentMethods'), {
          ...method,
          enabled: newEnabled,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      setError('Failed to update payment method.');
      // Rollback
      setMethods(prev => prev.map(m => m.id === method.id ? { ...m, enabled: !newEnabled } : m));
      console.error(err);
    }
  };

  // ── Edit method ────────────────────────────────────────────────────────────
  const handleEditMethod = (method: PaymentMethodDoc) => {
    setEditingMethod(method);
    setEditForm({ name: method.name, description: method.description, enabled: method.enabled });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'paymentMethods', editingMethod.id);
      const payload = { ...editForm, updatedAt: serverTimestamp() };
      // Try update first; if doc doesn't exist, set it
      try {
        await updateDoc(docRef, payload);
      } catch {
        await addDoc(collection(db, 'paymentMethods'), { id: editingMethod.id, ...payload });
      }
      setMethods(prev =>
        prev.map(m => m.id === editingMethod.id ? { ...m, ...editForm } : m)
      );
      setShowEditModal(false);
      setEditingMethod(null);
    } catch (err) {
      setError('Failed to save payment method.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Add new custom method ──────────────────────────────────────────────────
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = normalizeType(addForm.name);
      if (methods.find(m => m.id === id)) {
        setError(`A method named "${addForm.name}" already exists.`);
        setSaving(false);
        return;
      }
      const payload = { ...addForm, updatedAt: serverTimestamp() };
      await addDoc(collection(db, 'paymentMethods'), { id, ...payload });
      setMethods(prev => [...prev, { id, ...addForm }]);
      setShowAddModal(false);
      setAddForm({ name: '', description: '', enabled: true });
    } catch (err) {
      setError('Failed to add payment method.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Stat lookup helper ─────────────────────────────────────────────────────
  const statFor = (methodId: string): OrderPaymentStat | undefined =>
    orderStats.find(s => normalizeType(s.type) === methodId);

  // ── Inline toggle switch ───────────────────────────────────────────────────
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-green-600' : 'bg-gray-300'}`}
      aria-pressed={checked}
      title={checked ? 'Disable' : 'Enable'}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-200 transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button className="ml-auto text-red-500 hover:text-red-700" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* ── Order Usage Summary ─────────────────────────────────────────────── */}
      {!loading && orderStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Payment Usage from Orders</h3>
          <p className="text-sm text-gray-500 mb-4">Live counts pulled from your <code className="text-xs bg-gray-100 px-1 rounded">orders</code> collection.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderStats.map(stat => (
              <div key={stat.type} className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex-shrink-0">{methodIcon(stat.type)}</div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{stat.type}</div>
                  <div className="text-sm text-gray-500">{stat.count} order{stat.count !== 1 ? 's' : ''}</div>
                  <div className="text-xs text-green-700 font-medium">₱{stat.totalRevenue.toFixed(2)} total</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Payment Method Settings ─────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Enable or disable methods available at checkout.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAll}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              title="Refresh"
            >↻</button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> Add Method
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-gray-400 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading payment methods…
          </div>
        ) : methods.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No payment methods found.</div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
            {methods.map(method => {
              const stat = statFor(method.id);
              return (
                <div key={method.id} className="flex items-center px-6 py-4 gap-4">
                  <div className="flex-shrink-0">{methodIcon(method.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                    {stat && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {stat.count} order{stat.count !== 1 ? 's' : ''} · ₱{stat.totalRevenue.toFixed(2)} revenue
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${method.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {method.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Toggle checked={method.enabled} onChange={() => handleToggleEnabled(method)} />
                    <button
                      className="p-2 rounded hover:bg-gray-100"
                      title="Edit"
                      onClick={() => handleEditMethod(method)}
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {showEditModal && editingMethod && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Payment Method</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Enabled</label>
                <input
                  type="checkbox"
                  checked={editForm.enabled}
                  onChange={e => setEditForm(f => ({ ...f, enabled: e.target.checked }))}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Modal ───────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Payment Method</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g. GCash, Bank Transfer"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g. Accept payments via GCash"
                  value={addForm.description}
                  onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Enable immediately</label>
                <input
                  type="checkbox"
                  checked={addForm.enabled}
                  onChange={e => setAddForm(f => ({ ...f, enabled: e.target.checked }))}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



// ── Types for ShippingMethods ──────────────────────────────────────────────────

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  enabled: boolean;
  updatedAt?: string;
}

type ShippingFormData = {
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  enabled: boolean;
};

const EMPTY_SHIPPING_FORM: ShippingFormData = {
  name: '',
  description: '',
  price: 0,
  estimatedDays: '',
  enabled: true,
};

const ShippingMethods: React.FC = () => {
  const [methods, setMethods] = React.useState<ShippingMethod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingMethod, setEditingMethod] = React.useState<ShippingMethod | null>(null);
  const [editForm, setEditForm] = React.useState<ShippingFormData>(EMPTY_SHIPPING_FORM);

  // Add modal state
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addForm, setAddForm] = React.useState<ShippingFormData>(EMPTY_SHIPPING_FORM);

  // ── Fetch shipping methods from Firestore ────────────────────────────────────
  const fetchMethods = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'shippingMethods'));
      const fetched: ShippingMethod[] = snap.docs.map(d => ({
        id: d.id,
        name: (d.data().name as string) ?? '',
        description: (d.data().description as string) ?? '',
        price: (d.data().price as number) ?? 0,
        estimatedDays: (d.data().estimatedDays as string) ?? '',
        enabled: (d.data().enabled as boolean) ?? true,
        updatedAt: tsToIso(d.data().updatedAt),
      }));
      // Seed with defaults if collection is empty
      if (fetched.length === 0) {
        setMethods([
          { id: 'standard', name: 'Standard Shipping', description: 'Regular delivery to your doorstep', price: 99, estimatedDays: '5–7 days', enabled: true },
          { id: 'express', name: 'Express Shipping', description: 'Faster delivery, prioritized handling', price: 199, estimatedDays: '2–3 days', enabled: true },
          { id: 'same_day', name: 'Same-Day Delivery', description: 'Order before 12 PM for same-day delivery', price: 349, estimatedDays: 'Same day', enabled: false },
        ]);
      } else {
        setMethods(fetched);
      }
    } catch (err) {
      setError('Failed to load shipping methods. Check your Firestore permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchMethods(); }, [fetchMethods]);

  // ── Toggle enabled ────────────────────────────────────────────────────────────
  const handleToggleEnabled = async (method: ShippingMethod) => {
    const newEnabled = !method.enabled;
    setMethods(prev => prev.map(m => m.id === method.id ? { ...m, enabled: newEnabled } : m));
    try {
      const ref = doc(db, 'shippingMethods', method.id);
      await updateDoc(ref, { enabled: newEnabled, updatedAt: serverTimestamp() }).catch(async () => {
        await addDoc(collection(db, 'shippingMethods'), { ...method, enabled: newEnabled, updatedAt: serverTimestamp() });
      });
    } catch (err) {
      setError('Failed to update shipping method.');
      setMethods(prev => prev.map(m => m.id === method.id ? { ...m, enabled: !newEnabled } : m));
      console.error(err);
    }
  };

  // ── Open edit modal ───────────────────────────────────────────────────────────
  const handleEditMethod = (method: ShippingMethod) => {
    setEditingMethod(method);
    setEditForm({
      name: method.name,
      description: method.description,
      price: method.price,
      estimatedDays: method.estimatedDays,
      enabled: method.enabled,
    });
    setShowEditModal(true);
  };

  // ── Submit edit ───────────────────────────────────────────────────────────────
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;
    setSaving(true);
    try {
      const payload = { ...editForm, updatedAt: serverTimestamp() };
      const ref = doc(db, 'shippingMethods', editingMethod.id);
      try {
        await updateDoc(ref, payload);
      } catch {
        await addDoc(collection(db, 'shippingMethods'), { id: editingMethod.id, ...payload });
      }
      setMethods(prev => prev.map(m => m.id === editingMethod.id ? { ...m, ...editForm } : m));
      setShowEditModal(false);
      setEditingMethod(null);
    } catch (err) {
      setError('Failed to save shipping method.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Submit add ────────────────────────────────────────────────────────────────
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = addForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      if (methods.find(m => m.id === id)) {
        setError(`A shipping method named "${addForm.name}" already exists.`);
        setSaving(false);
        return;
      }
      const payload = { ...addForm, updatedAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, 'shippingMethods'), { id, ...payload });
      setMethods(prev => [...prev, { id: docRef.id, ...addForm }]);
      setShowAddModal(false);
      setAddForm(EMPTY_SHIPPING_FORM);
    } catch (err) {
      setError('Failed to add shipping method.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDeleteMethod = async (method: ShippingMethod) => {
    if (!window.confirm(`Delete "${method.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'shippingMethods', method.id));
      setMethods(prev => prev.filter(m => m.id !== method.id));
    } catch (err) {
      setError('Failed to delete shipping method.');
      console.error(err);
    }
  };

  // ── Toggle switch ─────────────────────────────────────────────────────────────
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-green-600' : 'bg-gray-300'}`}
      aria-pressed={checked}
      title={checked ? 'Disable' : 'Enable'}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-200 transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );

  // ── Shared form fields ────────────────────────────────────────────────────────
  const ShippingFormFields = ({
    values,
    onChange,
  }: {
    values: ShippingFormData;
    onChange: (patch: Partial<ShippingFormData>) => void;
  }) => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Method Name</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="e.g. Standard Shipping"
          value={values.name}
          onChange={e => onChange({ name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="e.g. Regular delivery to your doorstep"
          value={values.description}
          onChange={e => onChange({ description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (₱)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={values.price}
            onChange={e => onChange({ price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Estimated Delivery</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="e.g. 3–5 days"
            value={values.estimatedDays}
            onChange={e => onChange({ estimatedDays: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="shippingEnabled"
          checked={values.enabled}
          onChange={e => onChange({ enabled: e.target.checked })}
          className="h-4 w-4 text-green-600 border-gray-300 rounded accent-green-600"
        />
        <label htmlFor="shippingEnabled" className="text-sm font-medium text-gray-700">
          Enable this shipping method
        </label>
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button className="ml-auto text-red-500 hover:text-red-700" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* ── Shipping Methods List ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Shipping Methods</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Configure delivery options available at checkout.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchMethods}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              title="Refresh"
            >↻</button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> Add Method
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-gray-400 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading shipping methods…
          </div>
        ) : methods.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No shipping methods found.</div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
            {methods.map(method => (
              <div key={method.id} className="flex items-center px-6 py-4 gap-4">
                {/* Icon */}
                <span className="inline-flex items-center justify-center h-10 w-10 rounded bg-green-50 flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l-1 9a2 2 0 002 2h12a2 2 0 002-2L19 8m-9 4h4" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                    {method.estimatedDays && <span>🕐 {method.estimatedDays}</span>}
                    <span className="font-medium text-green-700">₱{method.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${method.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {method.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Toggle checked={method.enabled} onChange={() => handleToggleEnabled(method)} />
                  <button
                    className="p-2 rounded hover:bg-gray-100"
                    title="Edit"
                    onClick={() => handleEditMethod(method)}
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    className="p-2 rounded hover:bg-red-50"
                    title="Delete"
                    onClick={() => handleDeleteMethod(method)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Shipping Method Modal ────────────────────────────────────────── */}
      {showEditModal && editingMethod && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Shipping Method</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <ShippingFormFields
                values={editForm}
                onChange={patch => setEditForm(f => ({ ...f, ...patch }))}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700"
                  onClick={() => { setShowEditModal(false); setEditingMethod(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Shipping Method Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Shipping Method</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <ShippingFormFields
                values={addForm}
                onChange={patch => setAddForm(f => ({ ...f, ...patch }))}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700"
                  onClick={() => { setShowAddModal(false); setAddForm(EMPTY_SHIPPING_FORM); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    { key: 'shipping', label: 'Shipping Methods' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`flex-shrink-0 px-4 py-2 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 focus:outline-none whitespace-nowrap ${
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
      {activeSettingsTab === 'shipping' && <ShippingMethods />}
      {activeSettingsTab === 'notifications' && <NotificationSettings />}
      {activeSettingsTab === 'security' && <SecuritySettings />}
    </div>
  );
};

export default SettingsPanel;