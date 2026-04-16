import React, { FormEvent, useState } from 'react';
import { PublicIncident } from '../../api';
import {
  createAdminIncident,
  deleteAdminIncident,
  IncidentStatus,
  updateAdminIncident,
} from '../adminApi';

type IncidentsScreenProps = {
  token: string;
  incidents: PublicIncident[];
  onRefresh: () => Promise<void> | void;
};

const severityOptions: PublicIncident['severity'][] = ['low', 'medium', 'high', 'critical'];
const statusOptions: IncidentStatus[] = ['active', 'monitoring', 'resolved'];

const emptyDraft = {
  title: '',
  public_message: '',
  severity: 'medium' as PublicIncident['severity'],
  status: 'active' as PublicIncident['status'],
  latitude: 41.8268,
  longitude: -71.4025,
  radius_meters: 100,
  report_count: 1,
  confidence_percent: 70,
  expires_at: '',
};

const formatDateTime = (value: string | null): string => {
  if (!value) return 'No expiry';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const IncidentsScreen: React.FC<IncidentsScreenProps> = ({ token, incidents, onRefresh }) => {
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createAdminIncident(token, {
        source_report_id: null,
        title: draft.title.trim(),
        public_message: draft.public_message.trim(),
        severity: draft.severity,
        status: draft.status,
        latitude: Number(draft.latitude),
        longitude: Number(draft.longitude),
        radius_meters: Number(draft.radius_meters),
        report_count: Number(draft.report_count),
        confidence_percent: Number(draft.confidence_percent),
        expires_at: draft.expires_at ? new Date(draft.expires_at).toISOString() : null,
      });
      setDraft(emptyDraft);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create incident');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (incident: PublicIncident, status: IncidentStatus) => {
    setSaving(true);
    setError(null);

    try {
      await updateAdminIncident(token, incident.id, { status });
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update incident');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (incident: PublicIncident) => {
    if (!window.confirm(`Delete incident "${incident.title}"? This removes it from the public map.`)) return;

    setSaving(true);
    setError(null);

    try {
      await deleteAdminIncident(token, incident.id);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete incident');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
      <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">Create incident</h3>
        <p className="mt-1 text-sm text-slate-600">Manual incidents appear on the public student map when active or monitoring.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Title</span>
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="mt-1 w-full rounded-lg border-slate-300 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Public message</span>
            <textarea
              value={draft.public_message}
              onChange={(event) => setDraft({ ...draft, public_message: event.target.value })}
              className="mt-1 min-h-24 w-full rounded-lg border-slate-300 text-sm"
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Severity</span>
              <select
                value={draft.severity}
                onChange={(event) => setDraft({ ...draft, severity: event.target.value as PublicIncident['severity'] })}
                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
              >
                {severityOptions.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Status</span>
              <select
                value={draft.status}
                onChange={(event) => setDraft({ ...draft, status: event.target.value as PublicIncident['status'] })}
                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
              >
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
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
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Radius</span>
              <input
                type="number"
                min={0}
                value={draft.radius_meters}
                onChange={(event) => setDraft({ ...draft, radius_meters: Number(event.target.value) })}
                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Reports</span>
              <input
                type="number"
                min={0}
                value={draft.report_count}
                onChange={(event) => setDraft({ ...draft, report_count: Number(event.target.value) })}
                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Confidence</span>
              <input
                type="number"
                min={0}
                max={100}
                value={draft.confidence_percent}
                onChange={(event) => setDraft({ ...draft, confidence_percent: Number(event.target.value) })}
                className="mt-1 w-full rounded-lg border-slate-300 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Expires at</span>
            <input
              type="datetime-local"
              value={draft.expires_at}
              onChange={(event) => setDraft({ ...draft, expires_at: event.target.value })}
              className="mt-1 w-full rounded-lg border-slate-300 text-sm"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-[#002147] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Create Incident'}
        </button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-xl font-bold text-slate-950">Public incidents</h3>
          <p className="mt-1 text-sm text-slate-600">{incidents.length} incidents in the system</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Title', 'Severity', 'Status', 'Confidence', 'Expires', 'Actions'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-medium text-slate-500">No public incidents yet.</td>
                </tr>
              ) : incidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{incident.title}</p>
                    <p className="mt-1 max-w-xl truncate text-xs text-slate-500">{incident.public_message}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{incident.severity}</td>
                  <td className="px-4 py-3">
                    <select
                      value={incident.status}
                      onChange={(event) => handleStatusChange(incident, event.target.value as IncidentStatus)}
                      className="rounded-lg border-slate-300 text-xs font-semibold"
                    >
                      {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{incident.confidence_percent}%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDateTime(incident.expires_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(incident)}
                      className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700"
                    >
                      Delete
                    </button>
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

export default IncidentsScreen;
