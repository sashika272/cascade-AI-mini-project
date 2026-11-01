import React, { useState } from 'react';
import { useNavigate, Link } from '../router';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, User as UserIcon, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'SRE Engineer' | 'Viewer'>('SRE Engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculator
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const ok = await register(name, email, password, role);
      if (ok) {
        navigate('/');
      } else {
        setError('Registration failed.');
      }
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0F172A] p-8 shadow-2xl shadow-cyan-500/5">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 mb-3">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-mono text-2xl font-extrabold tracking-wider text-white">
            CASCADE <span className="text-cyan-400">// AI</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
            SRE Command Center Onboarding
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-950/40 border border-red-500/40 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Engineer Name"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@sre.corp"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Assigned SRE Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Admin', 'SRE Engineer', 'Viewer'] as const).map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    role === r
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>

            {/* Password Security Meter */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1 w-full bg-gray-800 rounded overflow-hidden">
                  <div className={`h-full flex-1 ${strength >= 1 ? 'bg-red-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 3 ? 'bg-blue-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 ${strength >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Strength: {strength <= 1 ? 'Weak' : strength <= 3 ? 'Good' : 'Strong Enterprise'}</span>
                  <span>Minimum 8 chars</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Registering Account...' : 'Create Account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
