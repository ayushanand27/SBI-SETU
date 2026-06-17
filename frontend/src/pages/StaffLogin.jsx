import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_CREDENTIALS = [
  {
    employeeId: 'MGR001',
    password: 'demo123',
    role: 'manager',
    name: 'Kavya Sharma',
    label: 'Manager',
  },
  {
    employeeId: 'AGT001',
    password: 'demo123',
    role: 'agent',
    name: 'Rajesh Mehta',
    label: 'Agent',
  },
];

function StaffLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Staff Login — SBI Setu';
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const match = DEMO_CREDENTIALS.find(
      (cred) =>
        cred.employeeId === employeeId.trim().toUpperCase() &&
        cred.password === password
    );

    if (!match) {
      setError('Invalid credentials');
      return;
    }

    login(match.employeeId, match.role, match.name);
    navigate('/branchos');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-accent-blue/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent-gold/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-text-muted transition-default hover:text-text-primary"
          >
            <Building2 className="h-6 w-6 text-accent-blue" />
            <span className="text-lg font-bold text-text-primary">SBI Setu</span>
          </Link>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-bg-card shadow-blue-lg">
            <Shield className="h-7 w-7 text-accent-gold" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">BranchOS Staff Login</h1>
          <p className="mt-2 text-sm text-text-muted">
            Authorized branch staff only
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-white/10 bg-bg-card p-6 shadow-blue-lg sm:p-8"
        >
          <div className="mb-4">
            <label htmlFor="employeeId" className="mb-2 block text-sm font-medium text-text-muted">
              Employee ID
            </label>
            <input
              id="employeeId"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white placeholder:text-text-muted focus:border-accent-blue focus:outline-none"
              placeholder="MGR001"
              autoComplete="username"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white placeholder:text-text-muted focus:border-accent-blue focus:outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-danger/20 px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-blue px-6 py-3 text-base font-semibold text-white shadow-blue-lg transition-default hover:bg-blue-600"
          >
            <LogIn className="h-5 w-5" />
            Sign In to BranchOS
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-accent-gold/30 bg-bg-secondary p-4">
          <p className="mb-3 text-sm font-semibold text-accent-gold">Demo Credentials</p>
          <div className="space-y-2 text-sm text-text-muted">
            <p>
              <span className="font-medium text-text-primary">Manager:</span>{' '}
              MGR001 / demo123
            </p>
            <p>
              <span className="font-medium text-text-primary">Agent:</span>{' '}
              AGT001 / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
