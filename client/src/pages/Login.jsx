import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Starfield from '../components/common/Starfield';

import ThemeToggle from '../components/common/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Starfield />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="card w-full max-w-md animate-fadeIn relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-starlight mb-1 tracking-tight">
            <span className="text-comet-violet">Future</span>Era
          </h1>
          <p className="text-sm font-semibold text-dust-gray">AI Career Path Simulator</p>
        </div>

        <h2 className="text-lg font-bold text-starlight mb-6">Log in to your account</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255, 92, 122, 0.1)', border: '1px solid rgba(255, 92, 122, 0.2)' }}>
            <p className="text-sm text-meteor-red">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dust-gray mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>
          <div>
            <label className="block text-sm text-dust-gray mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dust-gray hover:text-starlight focus:outline-none transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-comet-violet hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading} id="login-submit">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Logging in...
              </span>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <p className="text-sm text-dust-gray text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-comet-violet hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
