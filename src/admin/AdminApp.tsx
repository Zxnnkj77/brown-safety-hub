import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicAlert, PublicIncident, Report, SafeLocation } from '../api';
import {
  AdminProfile,
  clearAdminToken,
  fetchAdminAlerts,
  fetchAdminIncidents,
  fetchAdminProfile,
  fetchAdminReports,
  fetchAdminSafeLocations,
  getStoredAdminToken,
} from './adminApi';
import AdminLayout, { AdminMetrics } from './AdminLayout';
import AdminLogin from './AdminLogin';
import AlertsScreen from './screens/AlertsScreen';
import IncidentsScreen from './screens/IncidentsScreen';
import ReportsScreen from './screens/ReportsScreen';
import SafeLocationsScreen from './screens/SafeLocationsScreen';

const isAlertActive = (alert: PublicAlert): boolean => (
  !alert.expires_at || new Date(alert.expires_at).getTime() > Date.now()
);

const AdminApp: React.FC = () => {
  const [token, setToken] = useState<string | null>(() => getStoredAdminToken());
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [incidents, setIncidents] = useState<PublicIncident[]>([]);
  const [safeLocations, setSafeLocations] = useState<SafeLocation[]>([]);
  const [booting, setBooting] = useState(Boolean(token));
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = useCallback(() => {
    clearAdminToken();
    setToken(null);
    setProfile(null);
    setReports([]);
    setAlerts([]);
    setIncidents([]);
    setSafeLocations([]);
  }, []);

  const refreshData = useCallback(async (activeToken = token) => {
    if (!activeToken) return;

    setLoadingData(true);
    setError(null);

    try {
      const [nextReports, nextAlerts, nextIncidents, nextSafeLocations] = await Promise.all([
        fetchAdminReports(activeToken),
        fetchAdminAlerts(activeToken),
        fetchAdminIncidents(activeToken),
        fetchAdminSafeLocations(activeToken),
      ]);

      setReports(nextReports);
      setAlerts(nextAlerts);
      setIncidents(nextIncidents);
      setSafeLocations(nextSafeLocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }

    let cancelled = false;

    async function validate() {
      setBooting(true);
      setError(null);

      try {
        const nextProfile = await fetchAdminProfile(token);
        if (cancelled) return;
        setProfile(nextProfile);
        await refreshData(token);
      } catch (err) {
        if (cancelled) return;
        clearAdminToken();
        setToken(null);
        setProfile(null);
        setError(err instanceof Error ? err.message : 'Admin session expired');
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, [refreshData, token]);

  const metrics: AdminMetrics = useMemo(() => ({
    totalReports: reports.length,
    underReview: reports.filter((report) => report.status === 'under_review').length,
    verified: reports.filter((report) => report.status === 'verified').length,
    activeAlerts: alerts.filter(isAlertActive).length,
  }), [alerts, reports]);

  if (!token) {
    return (
      <>
        <AdminLogin onAuthenticated={setToken} />
        {error && (
          <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {error}
          </div>
        )}
      </>
    );
  }

  if (booting) {
    return (
      <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center text-slate-700">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#002147]" />
            <span className="text-sm font-semibold">Checking admin access...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout metrics={metrics} profile={profile} onSignOut={handleSignOut}>
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {loadingData && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
          Refreshing admin data...
        </div>
      )}
      <Routes>
        <Route index element={<Navigate to="reports" replace />} />
        <Route
          path="reports"
          element={<ReportsScreen token={token} reports={reports} onRefresh={() => refreshData(token)} />}
        />
        <Route
          path="alerts"
          element={<AlertsScreen token={token} alerts={alerts} incidents={incidents} onRefresh={() => refreshData(token)} />}
        />
        <Route
          path="incidents"
          element={<IncidentsScreen token={token} incidents={incidents} onRefresh={() => refreshData(token)} />}
        />
        <Route
          path="safe-locations"
          element={<SafeLocationsScreen token={token} safeLocations={safeLocations} onRefresh={() => refreshData(token)} />}
        />
        <Route path="*" element={<Navigate to="reports" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;
