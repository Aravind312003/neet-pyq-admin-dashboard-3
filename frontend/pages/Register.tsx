import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, AlertCircle, Eye, EyeOff, GraduationCap, Clock } from 'lucide-react';
import Turnstile from '../components/Turnstile';

const API_BASE_URL = 'https://neet-pyq-admin-dashboard-3.onrender.com';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full name (at least 2 characters).');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the Turnstile security challenge to verify you are a human applicant.');
      return;
    }

    setLoading(true);

    const endpointsToTry = [
      `${API_BASE_URL}/api/staff/register`,
      `${API_BASE_URL}/api/admin/register`,
      '/api/staff/register'
    ];

    let response: Response | null = null;

    try {
      for (const endpoint of endpointsToTry) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: fullName.trim(),
              email: email.trim(),
              password,
              confirmPassword,
              role: 'teacher',
              turnstileToken
            })
          });

          if (res.status !== 404) {
            response = res;
            break;
          }
        } catch (fetchErr) {
          console.warn(`Attempt failed for ${endpoint}:`, fetchErr);
        }
      }

      if (!response) {
        setError('Staff registration endpoint not reachable. Please check your backend service.');
        setLoading(false);
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setError('Received invalid JSON response from server.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.message || 'Staff registration request failed.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Registration request failed:', err);
      setError('Network or connection error. Please verify backend server is running and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">NEET PYQ PLATFORM</h1>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mt-1">
            Staff Account Registration
          </p>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-2xl" />

          {error && (
            <div className="mb-6 rounded-lg border border-red-950 bg-red-950/40 p-4 text-sm text-red-400 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold leading-none">Registration Error</p>
                <p className="mt-1 text-xs leading-normal opacity-90">{error}</p>
              </div>
            </div>
          )}

          {success ? (
            <div className="space-y-6 text-center py-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">Registration Submitted</h2>
                <p className="mt-3 text-xs text-neutral-300 leading-relaxed bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
                  Registration successful. Your account is pending administrator approval. You will be able to access the Staff Dashboard after your account is approved.
                </p>
              </div>

              <Link
                to="/admin/login"
                className="w-full flex justify-center items-center py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/30 transition-all"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    placeholder="Dr. Aarav Sharma"
                    className="block w-full pl-11 pr-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="teacher@neetplatform.com"
                    className="block w-full pl-11 pr-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-11 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-11 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Requested Role
                </label>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Teacher
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase">Default</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Note: Administrator privileges must be approved by an existing administrator.
                </p>
              </div>

              <Turnstile onVerify={(token) => setTurnstileToken(token)} />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/30 transition-all focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Submitting Registration...' : 'Register Staff Account'}
              </button>

              <div className="mt-6 pt-4 border-t border-neutral-900 text-center text-xs text-neutral-400">
                Already registered as staff?{' '}
                <Link to="/admin/login" className="text-emerald-400 font-bold hover:underline">
                  Sign In Here
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}