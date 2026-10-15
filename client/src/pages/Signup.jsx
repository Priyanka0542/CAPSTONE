import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Starfield from '../components/common/Starfield';

import ThemeToggle from '../components/common/ThemeToggle';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password validation rules
  const passwordRules = [
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'Contains an uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'Contains a lowercase letter', test: (pw) => /[a-z]/.test(pw) },
    { label: 'Contains a number', test: (pw) => /\d/.test(pw) },
    { label: 'Contains a special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
  ];

  const allRulesPassed = password.length > 0 && passwordRules.every((rule) => rule.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allRulesPassed) {
      setError('Please meet all password requirements');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Signup failed.');
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
          <img src="/logo.png" alt="FutureEra Logo" className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold text-starlight mb-1 tracking-tight">
            <span className="text-comet-violet">Future</span>Era
          </h1>
          <p className="text-sm font-semibold text-dust-gray">AI Career Path Simulator</p>
        </div>

        <h2 className="text-lg font-bold text-starlight mb-6">Create your account</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255, 92, 122, 0.1)', border: '1px solid rgba(255, 92, 122, 0.2)' }}>
            <p className="text-sm text-meteor-red">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dust-gray mb-1">Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              id="signup-name"
            />
          </div>
          <div>
            <label className="block text-sm text-dust-gray mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="signup-email"
            />
          </div>
          <div>
            <label className="block text-sm text-dust-gray mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Min 8 chars, uppercase + lowercase + number + special char"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="signup-password"
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

            {/* Real-time password requirements */}
            {password.length > 0 && (
              <ul className="password-requirements">
                {passwordRules.map((rule, i) => {
                  const passed = rule.test(password);
                  return (
                    <li key={i} className={`password-req-item ${passed ? 'valid' : 'invalid'}`}>
                      <span className="password-req-icon">{passed ? '✓' : '✕'}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading || (password.length > 0 && !allRulesPassed)} id="signup-submit">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Creating account...
              </span>
            ) : (
              'Sign up'
            )}
          </button>
        </form>

        <p className="text-sm text-dust-gray text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-comet-violet hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

