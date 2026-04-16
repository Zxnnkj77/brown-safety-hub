import React, { FormEvent, useState } from 'react';
import { PublicAlert, PublicIncident } from '../../api';
import { createAdminAlert, deleteAdminAlert, updateAdminAlert } from '../adminApi';

type AlertsScreenProps = {
  token: string;
  alerts: PublicAlert[];
  incidents: PublicIncident[];
  onRefresh: () => Promise<void> | void;
};

const levelOptions = ['info', 'warning', 'critical'] as const;

const isActive = (alert: PublicAlert): boolean => (
  !alert.expires_at || new Date(alert.expires_at).getTime() > Date.now()
);

const formatDateTime = (value: string | null): string => {
  if (!value) return 'No expiry';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const AlertsScreen: React.FC<AlertsScreenProps> = ({ token, alerts, incidents, onRefresh }) => {
  const [draft, setDraft] = useState({
    title: '',
    message: '',
    level: 'info' as typeof levelOptions[number],
    expires_at: '',
    linked_incident_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createAdminAlert(token, {
        title: draft.title.trim(),
        message: draft.message.trim(),
        level: draft.level,
        verified: true,
        expires_at: draft.expires_at ? new Date(draft.expires_at).toISOString() : null,
        linked_incident_id: draft.linked_incident_id || null,
      });
      setDraft({ title: '', message: '', level: 'info', expires_at: '', linked_incident_id: '' });
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (alert: PublicAlert) => {
    if (!window.confirm(`Deactivate alert "${alert.title}"?`)) return;

    setSaving(true);
    setError(null);

    try {
      await updateAdminAlert(token, alert.id, { expires_at: new Date().toISOString() });
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate alert');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (alert: PublicAlert) => {
    if (!window.confirm(`Delete alert "${alert.title}"? This cannot be undone.`)) return;

    setSaving(true);
    setError(null);

    try {
      await deleteAdminAlert(token, alert.id);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
      <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">Create alert</h3>
        <p className="mt-1 text-sm text-slate-600">Alerts appear in the student hub until they expire.</p>

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
            <span className="text-sm font-semibold text-slate-700">Message</span>
            <textarea
              value={draft.message}
              onChange={(event) => setDraft({ ...draft, message: event.target.value })}
              className="mt-1 min-h-28 w-full rounded-lg border-slate-300 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Level</span>
            <select
              value={draft.level}
              onChange={(event) => setDraft({ ...draft, level: event.target.value as typeof levelOptions[number] })}
              className="mt-1 w-full rounded-lg border-slate-300 text-sm"
            >
              {levelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Linked incident</span>
            <select
              value={draft.linked_incident_id}
              onChange={(event) => setDraft({ ...draft, linked_incident_id: event.target.value })}
              className="mt-1 w-full rounded-lg border-slate-300 text-sm"
            >
              <option value="">None</option>
              {incidents.map((incident) => (
                <option key={incident.id} value={incident.id}>{incident.title}</option>
              ))}
            </select>
          </label>
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
          {saving ? 'Saving...' : 'Create Alert'}
        </button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-xl font-bold text-slate-950">Public alerts</h3>
          <p className="mt-1 text-sm text-slate-600">{alerts.length} alerts in the system</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Title', 'Level', 'State', 'Expires', 'Actions'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm font-medium text-slate-500">No alerts yet.</td>
                </tr>
              ) : alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{alert.title}</p>
                    <p className="mt-1 max-w-xl truncate text-xs text-slate-500">{alert.message}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{alert.level}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${isActive(alert) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {isActive(alert) ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDateTime(alert.expires_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {isActive(alert) && (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(alert)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700"
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(alert)}
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

export default AlertsScreen;
