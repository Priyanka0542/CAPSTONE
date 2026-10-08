import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import Starfield from '../components/common/Starfield';
import ThemeToggle from '../components/common/ThemeToggle';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Same password validation rules as Signup
  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    firstUpper: /^[A-Z]/.test(password),
  };
  const allValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!allValid) {
      setError('Please meet all password requirements.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
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

        <h2 className="text-lg font-bold text-starlight mb-2">Create new password</h2>
        <p className="text-sm font-semibold text-dust-gray mb-6">
          Enter your new password below.
        </p>

        {success ? (
          <div className="text-center">
            <div className="p-4 rounded-lg border border-aurora-teal mb-6" style={{ background: 'var(--surface-secondary)' }}>
              <p className="text-sm font-bold text-aurora-teal">✓ Password reset successfully!</p>
            </div>
            <Link to="/login" className="btn-primary w-full inline-block text-center">
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-meteor-red" style={{ background: 'var(--surface-secondary)' }}>
                <p className="text-sm font-bold text-meteor-red">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-dust-gray mb-1">New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
              <p className="text-xs font-bold text-starlight mb-2">Password must contain:</p>
              <ul className="text-xs space-y-1">
                <li className={`password-req-item ${validations.length ? 'valid' : ''}`}>At least 8 characters</li>
                <li className={`password-req-item ${validations.upper ? 'valid' : ''}`}>One uppercase letter</li>
                <li className={`password-req-item ${validations.lower ? 'valid' : ''}`}>One lowercase letter</li>
                <li className={`password-req-item ${validations.digit ? 'valid' : ''}`}>One number</li>
                <li className={`password-req-item ${validations.special ? 'valid' : ''}`}>One special character</li>
                <li className={`password-req-item ${validations.firstUpper ? 'valid' : ''}`}>Start with uppercase</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dust-gray mb-1">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading || !allValid}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
