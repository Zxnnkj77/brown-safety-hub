import React, { FormEvent, useMemo, useState } from 'react';
import { Report } from '../../api';
import {
  createAdminIncident,
  ReportStatus,
  updateAdminReportStatus,
} from '../adminApi';

type ReportsScreenProps = {
  token: string;
  reports: Report[];
  onRefresh: () => Promise<void> | void;
};

const statuses: Array<ReportStatus | 'all'> = ['all', 'submitted', 'under_review', 'verified', 'dismissed', 'resolved'];

const statusLabels: Record<string, string> = {
  all: 'All',
  submitted: 'Submitted',
  under_review: 'Under review',
  verified: 'Verified',
  dismissed: 'Dismissed',
  resolved: 'Resolved',
};

const severityOptions = ['low', 'medium', 'high', 'critical'] as const;

const formatDateTime = (value: string): string => (
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
);

const shortId = (id: string): string => id.slice(0, 8);

const ReportsScreen: React.FC<ReportsScreenProps> = ({ token, reports, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [incidentDraft, setIncidentDraft] = useState({
    title: '',
    public_message: '',
    severity: 'medium' as typeof severityOptions[number],
    radius_meters: 100,
    expires_at: '',
  });

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') return reports;
    return reports.filter((report) => report.status === statusFilter);
  }, [reports, statusFilter]);

  const openReport = (report: Report) => {
    setSelectedReport(report);
    setActionError(null);
    setIncidentDraft({
      title: `${report.incident_type} near ${report.location_text}`,
      public_message: report.description,
      severity: report.urgency ? 'high' : 'medium',
      radius_meters: 100,
      expires_at: '',
    });
  };

  const handleStatusChange = async (status: ReportStatus) => {
    if (!selectedReport) return;

    setSaving(true);
    setActionError(null);

    try {
      const updated = await updateAdminReportStatus(token, selectedReport.id, status);
      setSelectedReport(updated);
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update report status');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishIncident = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedReport) return;

    if (selectedReport.latitude === null || selectedReport.longitude === null) {
      setActionError('This report has no coordinates, so it cannot be published to the public map.');
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      await createAdminIncident(token, {
        source_report_id: selectedReport.id,
        title: incidentDraft.title.trim(),
        public_message: incidentDraft.public_message.trim(),
        severity: incidentDraft.severity,
        status: 'active',
        latitude: selectedReport.latitude,
        longitude: selectedReport.longitude,
        radius_meters: Number(incidentDraft.radius_meters),
        report_count: 1,
        confidence_percent: Math.min(100, selectedReport.confidence_level * 10),
        expires_at: incidentDraft.expires_at ? new Date(incidentDraft.expires_at).toISOString() : null,
      });

      const updated = await updateAdminReportStatus(token, selectedReport.id, 'verified');
      setSelectedReport(updated);
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to publish incident');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-950">Reports review</h3>
          <p className="mt-1 text-sm text-slate-600">Raw student reports stay private until an admin publishes a public incident.</p>
        </div>
        <label className="w-full md:w-56">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Status filter</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ReportStatus | 'all')}
            className="mt-1 w-full rounded-lg border-slate-300 text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Report ID', 'Created', 'Type', 'Location', 'Urgency', 'Confidence', 'Status'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm font-medium text-slate-500">
                    No reports match this filter.
                  </td>
                </tr>
              ) : filteredReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => openReport(report)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{shortId(report.id)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDateTime(report.created_at)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-950">{report.incident_type}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600">{report.location_text}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${report.urgency ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {report.urgency ? 'Urgent' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{report.confidence_level}/10</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold capitalize text-slate-700">
                      {statusLabels[report.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/30">
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">{selectedReport.id}</p>
                <h4 className="text-xl font-bold text-slate-950">{selectedReport.incident_type}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 p-6">
              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {actionError}
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <Detail label="Created" value={formatDateTime(selectedReport.created_at)} />
                <Detail label="Status" value={statusLabels[selectedReport.status]} />
                <Detail label="Location" value={selectedReport.location_text} />
                <Detail label="Coordinates" value={selectedReport.latitude === null ? 'Not provided' : `${selectedReport.latitude}, ${selectedReport.longitude}`} />
                <Detail label="Urgency" value={selectedReport.urgency ? 'Urgent' : 'Normal'} />
                <Detail label="Confidence" value={`${selectedReport.confidence_level}/10`} />
              </div>

              <div>
                <h5 className="text-sm font-bold uppercase tracking-wide text-slate-500">Private report description</h5>
                <p className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
                  {selectedReport.description}
                </p>
              </div>

              <div>
                <h5 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Review status</h5>
                <div className="flex flex-wrap gap-2">
                  {statuses.filter((status) => status !== 'all').map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={saving || selectedReport.status === status}
                      onClick={() => handleStatusChange(status as ReportStatus)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                        selectedReport.status === status
                          ? 'border-[#002147] bg-[#002147] text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handlePublishIncident} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-4">
                  <h5 className="text-sm font-bold uppercase tracking-wide text-slate-500">Publish public incident</h5>
                  <p className="mt-1 text-sm text-slate-600">Creates a verified map incident linked to this private report.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">Public title</span>
                    <input
                      value={incidentDraft.title}
                      onChange={(event) => setIncidentDraft({ ...incidentDraft, title: event.target.value })}
                      className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                      required
                    />
                  </label>
                  <label className="md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">Public message</span>
                    <textarea
                      value={incidentDraft.public_message}
                      onChange={(event) => setIncidentDraft({ ...incidentDraft, public_message: event.target.value })}
                      className="mt-1 min-h-24 w-full rounded-lg border-slate-300 text-sm"
                      required
                    />
                  </label>
                  <label>
                    <span className="text-sm font-semibold text-slate-700">Severity</span>
                    <select
                      value={incidentDraft.severity}
                      onChange={(event) => setIncidentDraft({ ...incidentDraft, severity: event.target.value as typeof severityOptions[number] })}
                      className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                    >
                      {severityOptions.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="text-sm font-semibold text-slate-700">Radius meters</span>
                    <input
                      type="number"
                      min={0}
                      value={incidentDraft.radius_meters}
                      onChange={(event) => setIncidentDraft({ ...incidentDraft, radius_meters: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                    />
                  </label>
                  <label className="md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">Expires at</span>
                    <input
                      type="datetime-local"
                      value={incidentDraft.expires_at}
                      onChange={(event) => setIncidentDraft({ ...incidentDraft, expires_at: event.target.value })}
                      className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving || selectedReport.latitude === null || selectedReport.longitude === null}
                  className="mt-4 rounded-lg bg-[#be0909] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Publish Incident'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export default ReportsScreen;
