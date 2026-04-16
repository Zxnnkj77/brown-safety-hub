import React, { FormEvent, useState } from 'react';
import { SafeLocation } from '../../api';
import {
  createAdminSafeLocation,
  deleteAdminSafeLocation,
  updateAdminSafeLocation,
} from '../adminApi';

type SafeLocationsScreenProps = {
  token: string;
  safeLocations: SafeLocation[];
  onRefresh: () => Promise<void> | void;
};

const categoryOptions: SafeLocation['category'][] = ['building', 'service', 'emergency', 'shelter', 'other'];

const emptyDraft = {
  name: '',
  description: '',
  latitude: 41.8268,
  longitude: -71.4025,
  category: 'other' as SafeLocation['category'],
  is_active: true,
};

const SafeLocationsScreen: React.FC<SafeLocationsScreenProps> = ({ token, safeLocations, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (location: SafeLocation) => {
    setEditingId(location.id);
    setDraft({
      name: location.name,
      description: location.description,
      latitude: location.latitude,
      longitude: location.longitude,
      category: location.category,
      is_active: location.is_active,
    });
    setError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await updateAdminSafeLocation(token, editingId, draft);
      } else {
        await createAdminSafeLocation(token, draft);
      }
      resetForm();
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save safe location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (location: SafeLocation) => {
    if (!window.confirm(`Delete safe location "${location.name}"? This cannot be undone.`)) return;

    setSaving(true);
    setError(null);

    try {
      await deleteAdminSafeLocation(token, location.id);
      if (editingId === location.id) resetForm();
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete safe location');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (location: SafeLocation) => {
    setSaving(true);
    setError(null);

    try {
      await updateAdminSafeLocation(token, location.id, { is_active: !location.is_active });
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update safe location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{editingId ? 'Edit safe location' : 'Add safe location'}</h3>
        <p className="mt-1 text-sm text-slate-600">Active safe locations appear on the student map.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-1 w-full rounded-lg border-slate-300 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              className="mt-1 min-h-24 w-full rounded-lg border-slate-300 text-sm"
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Latitude</span>
              <input
                type="number"
                step="any"
                value={draft.latitude}
                onChange={(event) => setDraft({ ...draft, latitude: Number(event.target.value) })}
                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Longitude</span>
              <input
                type="number"
                step="any"
                value={draft.longitude}
                onChange={(event) => setDraft({ ...draft, longitude: Number(event.target.value) })}
                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                required
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Category</span>
            <select
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value as SafeLocation['category'] })}
              className="mt-1 w-full rounded-lg border-slate-300 text-sm"
            >
              {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })}
              className="rounded border-slate-300 text-[#002147] focus:ring-[#002147]"
            />
            Active on student map
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-[#002147] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Location'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-xl font-bold text-slate-950">Safe locations</h3>
          <p className="mt-1 text-sm text-slate-600">{safeLocations.length} curated locations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Name', 'Category', 'Coordinates', 'State', 'Actions'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safeLocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm font-medium text-slate-500">No safe locations yet.</td>
                </tr>
              ) : safeLocations.map((location) => (
                <tr key={location.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{location.name}</p>
                    <p className="mt-1 max-w-xl truncate text-xs text-slate-500">{location.description}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{location.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-600">
                    {location.latitude}, {location.longitude}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${location.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {location.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(location)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(location)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700"
                      >
                        {location.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(location)}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default SafeLocationsScreen;
