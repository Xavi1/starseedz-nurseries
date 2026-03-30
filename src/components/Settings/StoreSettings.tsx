import React from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase'; // adjust path to your Firebase config

// ── Types ──────────────────────────────────────────────────────────────────────

interface StoreSettingsData {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCity: string;
  storeProvince: string;
  storePostalCode: string;
  storeCountry: string;
  currency: string;
  timezone: string;
  taxRate: number;
  taxIncluded: boolean;
  storeLogo: string;         // URL or base64
  storeDescription: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
}

const DEFAULT_SETTINGS: StoreSettingsData = {
  storeName: '',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  storeCity: '',
  storeProvince: '',
  storePostalCode: '',
  storeCountry: 'Philippines',
  currency: 'PHP',
  timezone: 'Asia/Manila',
  taxRate: 12,
  taxIncluded: false,
  storeLogo: '',
  storeDescription: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
};

// Firestore document: storeSettings/main
const STORE_DOC_REF = (dbInstance: typeof db) =>
  doc(dbInstance, 'storeSettings', 'main');

// ── Component ──────────────────────────────────────────────────────────────────

const StoreSettings: React.FC = () => {
  const [form, setForm] = React.useState<StoreSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // ── Load from Firestore ──────────────────────────────────────────────────────

  React.useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(STORE_DOC_REF(db));
        if (snap.exists()) {
          const data = snap.data() as Partial<StoreSettingsData>;
          setForm({ ...DEFAULT_SETTINGS, ...data });
        }
        // If doc doesn't exist yet, keep DEFAULT_SETTINGS
      } catch (err) {
        setError('Failed to load store settings. Check your Firestore permissions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ── Save to Firestore ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await setDoc(
        STORE_DOC_REF(db),
        { ...form, updatedAt: serverTimestamp() },
        { merge: true }   // non-destructive: only updates provided fields
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save store settings. Check your Firestore permissions.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const patch = (updates: Partial<StoreSettingsData>) =>
    setForm(f => ({ ...f, ...updates }));

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading store settings from Firestore…
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button type="button" className="ml-auto text-red-500 hover:text-red-700" onClick={() => setError(null)}>✕</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Store settings saved successfully.
        </div>
      )}

      {/* ── General Information ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="My Awesome Store"
              value={form.storeName}
              onChange={e => patch({ storeName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
            <input
              type="email"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="store@example.com"
              value={form.storeEmail}
              onChange={e => patch({ storeEmail: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Phone</label>
            <input
              type="tel"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="+63 9XX XXX XXXX"
              value={form.storePhone}
              onChange={e => patch({ storePhone: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 resize-none"
              rows={3}
              placeholder="A short description of your store…"
              value={form.storeDescription}
              onChange={e => patch({ storeDescription: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://example.com/logo.png"
              value={form.storeLogo}
              onChange={e => patch({ storeLogo: e.target.value })}
            />
            {form.storeLogo && (
              <img
                src={form.storeLogo}
                alt="Store logo preview"
                className="mt-2 h-16 w-auto rounded border border-gray-200 object-contain"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

        </div>
      </section>

      {/* ── Address ──────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Store Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="123 Main Street"
              value={form.storeAddress}
              onChange={e => patch({ storeAddress: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City / Municipality</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Quezon City"
              value={form.storeCity}
              onChange={e => patch({ storeCity: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province / Region</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Metro Manila"
              value={form.storeProvince}
              onChange={e => patch({ storeProvince: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="1100"
              value={form.storePostalCode}
              onChange={e => patch({ storePostalCode: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Philippines"
              value={form.storeCountry}
              onChange={e => patch({ storeCountry: e.target.value })}
            />
          </div>

        </div>
      </section>

      {/* ── Regional Settings ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              value={form.currency}
              onChange={e => patch({ currency: e.target.value })}
            >
              <option value="PHP">PHP – Philippine Peso (₱)</option>
              <option value="USD">USD – US Dollar ($)</option>
              <option value="EUR">EUR – Euro (€)</option>
              <option value="GBP">GBP – British Pound (£)</option>
              <option value="SGD">SGD – Singapore Dollar (S$)</option>
              <option value="JPY">JPY – Japanese Yen (¥)</option>
              <option value="AUD">AUD – Australian Dollar (A$)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              value={form.timezone}
              onChange={e => patch({ timezone: e.target.value })}
            >
              <option value="Asia/Manila">Asia/Manila (PHT, UTC+8)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
              <option value="Asia/Hong_Kong">Asia/Hong Kong (HKT, UTC+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
              <option value="Asia/Bangkok">Asia/Bangkok (ICT, UTC+7)</option>
              <option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option>
              <option value="America/New_York">America/New York (ET)</option>
              <option value="America/Los_Angeles">America/Los Angeles (PT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              value={form.taxRate}
              onChange={e => patch({ taxRate: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="taxIncluded"
              checked={form.taxIncluded}
              onChange={e => patch({ taxIncluded: e.target.checked })}
              className="h-4 w-4 text-green-600 border-gray-300 rounded accent-green-600"
            />
            <label htmlFor="taxIncluded" className="text-sm font-medium text-gray-700">
              Prices include tax
            </label>
          </div>

        </div>
      </section>

      {/* ── Social Media ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Social Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input
              type="url"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://facebook.com/yourpage"
              value={form.facebookUrl}
              onChange={e => patch({ facebookUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input
              type="url"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://instagram.com/yourhandle"
              value={form.instagramUrl}
              onChange={e => patch({ instagramUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
            <input
              type="url"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://twitter.com/yourhandle"
              value={form.twitterUrl}
              onChange={e => patch({ twitterUrl: e.target.value })}
            />
          </div>

        </div>
      </section>

      {/* ── Save Button ───────────────────────────────────────────────────────── */}
      <div className="flex justify-end pb-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

    </form>
  );
};

export default StoreSettings; 