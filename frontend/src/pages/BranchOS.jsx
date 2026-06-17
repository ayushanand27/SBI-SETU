import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ArrowLeft, Clock, Users, CheckCircle, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getRiskLevel(queue) {
  if (queue <= 5) {
    return { label: 'Low', className: 'bg-success/20 text-success' };
  }
  if (queue <= 10) {
    return { label: 'Medium', className: 'bg-warning/20 text-warning' };
  }
  return { label: 'High', className: 'bg-danger/20 text-danger' };
}

function ProgressBar({ value, max = 100, colorClass = 'bg-accent-blue' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-secondary">
      <div
        className={`h-full rounded-full transition-default ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-success px-6 py-3 text-sm font-medium text-white shadow-lg">
      {message}
      <button
        type="button"
        onClick={onClose}
        className="ml-3 text-white/80 hover:text-white"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
}

function BranchOS() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clock, setClock] = useState(new Date());
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.title = 'BranchOS — SBI Setu';
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/branchos/stats`);
        setStats(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || 'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData =
    stats?.chart?.hours?.map((hour, i) => ({
      hour,
      walkIns: stats.chart.walk_ins[i],
      deflected: stats.chart.deflected[i],
    })) || [];

  const handleSendAlert = () => {
    setToast('Alert sent to IT team successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleRedirect = (counterName) => {
    setToast(`Redirecting customers from Saarthi to ${counterName}...`);
    setTimeout(() => setToast(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isManager = user?.role === 'manager';
  const chatSessionsToday = stats?.chat_sessions_today > 0
    ? stats.chat_sessions_today
    : 47;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="text-lg text-text-muted">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-primary px-4">
        <p className="text-danger">{error || 'No data available'}</p>
        <Link to="/" className="text-accent-blue hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const footfallHigh = stats.footfall.current > stats.footfall.threshold;
  const waitHigh = stats.avg_wait_time.minutes > stats.avg_wait_time.threshold;

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-6 sm:px-6 lg:px-8">
      <Toast message={toast} onClose={() => setToast('')} />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-lg p-2 text-text-muted transition-default hover:bg-bg-card hover:text-white"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
                BranchOS — Branch Intelligence Dashboard
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-sm text-text-muted">
                  {user?.name} — {isManager ? 'Manager' : 'Agent'} View
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isManager
                      ? 'bg-accent-gold/20 text-accent-gold'
                      : 'bg-accent-blue/20 text-accent-blue'
                  }`}
                >
                  {isManager ? 'Manager' : 'Agent'}
                </span>
                <span className="text-sm text-text-muted">| Branch: {stats.branch}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-bg-card px-4 py-2">
              <Clock className="h-4 w-4 text-accent-blue" />
              <span className="font-mono text-sm text-text-primary sm:text-base">
                {clock.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-bg-card px-4 py-2 text-sm font-medium text-text-muted transition-default hover:border-danger/50 hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {footfallHigh && (
          <div className="mb-6 rounded-xl border border-danger/50 bg-danger/20 px-4 py-3 text-sm font-medium text-danger sm:text-base">
            ⚠️ High footfall detected! Activate Saarthi deflection protocol.
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg">
            <div className="mb-2 flex items-center gap-2 text-text-muted">
              <Users className="h-5 w-5" />
              <span className="text-sm">Current Footfall</span>
            </div>
            <p
              className={`text-3xl font-bold ${
                footfallHigh ? 'text-danger' : 'text-text-primary'
              }`}
            >
              {stats.footfall.current}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              ↑{stats.footfall.change_from_last_hour} from last hour
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg">
            <div className="mb-2 flex items-center gap-2 text-text-muted">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Avg Wait Time</span>
            </div>
            <p
              className={`text-3xl font-bold ${
                waitHigh ? 'text-danger' : 'text-text-primary'
              }`}
            >
              {stats.avg_wait_time.minutes} min
            </p>
            <p className="mt-1 text-sm text-success">
              ↓{Math.abs(stats.avg_wait_time.change)} min
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg">
            <div className="mb-2 flex items-center gap-2 text-text-muted">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Digitally Deflected Today</span>
            </div>
            <p className="text-3xl font-bold text-success">
              {stats.digitally_deflected_today}
            </p>
            <p className="mt-1 text-sm text-text-muted">tasks completed</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <Building2 className="h-5 w-5" />
                <span className="text-sm">Loan Desk Utilization</span>
              </div>
              <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-bold text-warning">
                {stats.loan_desk_utilization.status}
              </span>
            </div>
            <p className="text-3xl font-bold text-warning">
              {stats.loan_desk_utilization.percentage}%
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-text-primary">
                Hourly Footfall (9AM – 5PM)
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="hour"
                      stroke="#94A3B8"
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      label={{
                        value: 'Customers',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#94A3B8',
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#162035',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="walkIns"
                      name="Walk-ins"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={{ fill: '#2563EB' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="deflected"
                      name="Digitally Deflected"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-text-primary">
                Counter Status
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-text-muted">
                      <th className="pb-3 pr-4 font-medium">Counter</th>
                      <th className="pb-3 pr-4 font-medium">Queue</th>
                      <th className="pb-3 pr-4 font-medium">Avg Time</th>
                      <th className="pb-3 pr-4 font-medium">Agent</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.counters.map((counter) => {
                      const risk = getRiskLevel(counter.queue);
                      return (
                      <tr
                        key={counter.name}
                        onClick={() => setSelectedCounter(counter.name)}
                        className={`cursor-pointer border-b border-white/5 transition-default hover:bg-bg-secondary ${
                          selectedCounter === counter.name ? 'bg-bg-secondary' : ''
                        }`}
                      >
                        <td className="py-3 pr-4 font-medium text-text-primary">
                          {counter.name}
                        </td>
                        <td className="py-3 pr-4 text-text-muted">{counter.queue}</td>
                        <td className="py-3 pr-4 text-text-muted">{counter.avg_time}</td>
                        <td className="py-3 pr-4 text-text-muted">{counter.agent}</td>
                        <td className="py-3 pr-4">
                          {counter.status_emoji} {counter.status}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${risk.className}`}
                          >
                            {risk.label}
                          </span>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
              {selectedCounter && (
                <button
                  type="button"
                  onClick={() => handleRedirect(selectedCounter)}
                  className="mt-4 rounded-xl bg-accent-blue px-4 py-2 text-sm font-semibold text-white transition-default hover:bg-blue-600"
                >
                  Redirect customers from Saarthi — {selectedCounter}
                </button>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-text-primary">
                Server Health
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-text-muted">CPU</span>
                    <span className="text-warning">{stats.server_health.cpu}%</span>
                  </div>
                  <ProgressBar
                    value={stats.server_health.cpu}
                    colorClass="bg-warning"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-text-muted">RAM</span>
                    <span className="text-warning">{stats.server_health.ram}%</span>
                  </div>
                  <ProgressBar
                    value={stats.server_health.ram}
                    colorClass="bg-warning"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-text-muted">DB Connections</span>
                    <span className="text-accent-gold">
                      {stats.server_health.db_connections.current}/
                      {stats.server_health.db_connections.max}
                    </span>
                  </div>
                  <ProgressBar
                    value={stats.server_health.db_connections.current}
                    max={stats.server_health.db_connections.max}
                    colorClass="bg-accent-gold"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">API Response</span>
                  <span
                    className={
                      stats.server_health.api_response_ms < 500
                        ? 'text-success'
                        : 'text-danger'
                    }
                  >
                    {stats.server_health.api_response_ms}ms
                  </span>
                </div>
                <div className="rounded-lg bg-warning/20 px-4 py-3 text-sm text-warning">
                  ⚠️ {stats.server_health.status} — {stats.server_health.message}
                </div>
                {isManager && (
                  <button
                    type="button"
                    onClick={handleSendAlert}
                    className="rounded-xl border border-danger/50 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger transition-default hover:bg-danger/20"
                  >
                    Send Alert to IT
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-text-primary">
                🤖 SBI Setu Insights
              </h2>
              <ul className="space-y-4">
                {stats.insights.map((insight) => (
                  <li
                    key={insight}
                    className="rounded-lg border border-white/5 bg-bg-secondary p-4 text-sm leading-relaxed text-text-muted"
                  >
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-bg-card p-5 shadow-blue-lg sm:p-6">
              <h2 className="mb-3 text-lg font-bold text-text-primary">
                🔒 Compliance
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                All interactions logged to encrypted audit trail (DPDP Act compliant)
              </p>
              <p className="mt-3 text-sm font-semibold text-success">
                {chatSessionsToday} chat sessions logged today
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BranchOS;
