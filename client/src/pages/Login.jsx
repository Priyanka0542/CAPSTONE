import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Starfield from '../components/common/Starfield';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="card w-full max-w-md animate-fadeIn relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-starlight mb-1">
            <span className="text-comet-violet">Future</span>Era
          </h1>
          <p className="text-sm text-dust-gray">AI Career Path Simulator</p>
        </div>

        <h2 className="text-lg font-semibold text-starlight mb-6">Log in to your account</h2>

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
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />
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
