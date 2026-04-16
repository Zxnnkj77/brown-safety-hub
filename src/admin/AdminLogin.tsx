import React, { FormEvent, useState } from 'react';
import { fetchAdminProfile, signInAdminWithPassword, storeAdminToken } from './adminApi';

type AdminLoginProps = {
  onAuthenticated: (token: string) => void;
};

const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'password' | 'token'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const accessToken = mode === 'password'
        ? await signInAdminWithPassword(email.trim(), password)
        : token.trim();

      if (!accessToken) {
        throw new Error('Admin access token is required');
      }

      await fetchAdminProfile(accessToken);
      storeAdminToken(accessToken);
      onAuthenticated(accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate admin access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#eef2f7] text-slate-950 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#002147] text-white flex items-center justify-center">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Brown Safety Hub</p>
              <h1 className="text-2xl font-bold text-slate-950">Admin Access</h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-6">
            Sign in with a Supabase admin account or paste a valid admin access token.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === 'password' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setMode('token')}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === 'token' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
          >
            Token
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'password' ? (
            <>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#002147] focus:ring-[#002147]"
                  placeholder="admin@brown.edu"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#002147] focus:ring-[#002147]"
                  required
                />
              </label>
            </>
          ) : (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Supabase access token</span>
              <textarea
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#002147] focus:ring-[#002147]"
                placeholder="Paste Bearer token value"
                required
              />
            </label>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#002147] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Checking access...' : 'Enter Admin Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
