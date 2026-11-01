import React, { useState } from 'react';
import { useNavigate, Link } from '../router';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, Eye, EyeOff, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid credentials.');
      }
    } catch {
      setError('Connection error. Using local profile.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'sre' | 'viewer') => {
    quickLogin(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#070A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0F172A] p-8 shadow-2xl shadow-cyan-500/5">
        {/* Logo and Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 mb-3">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-mono text-2xl font-extrabold tracking-wider text-white">
            CASCADE <span className="text-cyan-400">// AI</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
            SRE Command Center & RCA Engine
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-950/40 border border-red-500/40 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex.mercer@sre.corp"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 py-2 pl-9 pr-10 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* One-Click Demo Role Presets */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              One-Click Role Presets
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuickLogin('sre')}
              className="flex items-center justify-between p-2.5 rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-800 hover:border-cyan-500/50 transition text-left"
            >
              <div>
                <div className="text-xs font-bold text-white">Alex Mercer (Lead SRE Architect)</div>
                <div className="text-[10px] text-gray-400">Full SRE triage, recovery simulations, chaos tests</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-semibold">
                SRE
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-between p-2.5 rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-800 hover:border-purple-500/50 transition text-left"
            >
              <div>
                <div className="text-xs font-bold text-white">Sashika K N (Security Commander)</div>
                <div className="text-[10px] text-gray-400">Admin override, sabotage isolation, team access</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-semibold">
                Admin
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('viewer')}
              className="flex items-center justify-between p-2.5 rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-800 hover:border-amber-500/50 transition text-left"
            >
              <div>
                <div className="text-xs font-bold text-white">Vikashini S (DevOps Observer)</div>
                <div className="text-[10px] text-gray-400">Read-only observability, timeline replay, report export</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                Viewer
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          Need an account?{' '}
          <Link to="/register" className="text-cyan-400 font-medium hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
