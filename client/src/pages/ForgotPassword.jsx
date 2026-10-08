import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Starfield from '../components/common/Starfield';
import ThemeToggle from '../components/common/ThemeToggle';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-starlight mb-1 tracking-tight">
            <span className="text-comet-violet">Future</span>Era
          </h1>
        </div>

        <h2 className="text-lg font-bold text-starlight mb-2">Reset your password</h2>
        <p className="text-sm font-semibold text-dust-gray mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="p-4 rounded-lg text-center border border-aurora-teal" style={{ background: 'var(--surface-secondary)' }}>
            <p className="text-sm font-bold text-aurora-teal mb-2">✓ Check your email</p>
            <p className="text-xs font-medium text-dust-gray">If an account exists for this email, a password reset link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-meteor-red" style={{ background: 'var(--surface-secondary)' }}>
                <p className="text-sm font-bold text-meteor-red">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-dust-gray mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="forgot-email"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-sm text-dust-gray text-center mt-6">
          <Link to="/login" className="text-comet-violet hover:underline font-semibold">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
