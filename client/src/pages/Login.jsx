import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Starfield from '../components/common/Starfield';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter;
        if (retryAfter && typeof retryAfter === 'number') {
          const minutes = Math.ceil(retryAfter / 60);
          setError(`Too many attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`);
        } else {
          setError(err.response?.data?.message || 'Too many attempts. Please wait before trying again.');
        }
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden transition-colors duration-300"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 20% 20%, #0d1224 0%, #060813 100%)'
          : 'radial-gradient(circle at 20% 20%, #f1f5f9 0%, #e2e8f0 100%)',
      }}
    >
      <Starfield />

      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
        <ThemeToggle />
      </div>

      {/* Split Screen Card */}
      <div
        className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border animate-fadeIn"
        style={{
          background: isDark ? '#0b0f19' : '#ffffff',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Left: Form Panel */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="FutureEra Logo" className="h-9 w-auto" />
              <div>
                <h1
                  className="text-2xl font-extrabold tracking-tight flex items-center"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  Future<span style={{ color: '#8a5cff' }}>Era</span>
                </h1>
                <p
                  className="text-[11px] font-medium tracking-wide"
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                >
                  Your Career &bull; Our AI &bull; A Brighter Future
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mt-8 mb-6">
              <h2
                className="text-3xl font-extrabold tracking-tight mb-2"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                Welcome <span style={{ color: '#8a5cff' }}>Back!</span>
              </h2>
              <p
                className="text-sm font-medium"
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
              >
                Log in to continue your journey towards a better tomorrow.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="mb-4 p-3 rounded-xl text-sm font-medium"
                style={{
                  background: 'rgba(255, 92, 122, 0.1)',
                  border: '1px solid rgba(255, 92, 122, 0.25)',
                  color: 'var(--danger, #ff5c7a)',
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <div className="relative flex items-center">
                  <FiMail
                    className="absolute left-4 pointer-events-none"
                    size={18}
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium transition-all outline-none"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    id="login-email"
                    style={{
                      background: isDark ? '#111726' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative flex items-center">
                  <FiLock
                    className="absolute left-4 pointer-events-none"
                    size={18}
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-11 pr-11 py-3 rounded-xl text-sm font-medium transition-all outline-none"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    id="login-password"
                    style={{
                      background: isDark ? '#111726' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 focus:outline-none transition-colors cursor-pointer"
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <label
                  className="flex items-center gap-2 cursor-pointer select-none"
                  style={{ color: isDark ? '#cbd5e1' : '#475569' }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-[#8a5cff] w-4 h-4 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: '#8a5cff' }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:opacity-95 disabled:opacity-50 mt-2"
                style={{
                  background: 'linear-gradient(135deg, #8a5cff 0%, #6d28d9 100%)',
                  boxShadow: '0 4px 14px rgba(138, 92, 255, 0.35)',
                }}
                disabled={loading}
                id="login-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Logging in...
                  </span>
                ) : (
                  <>
                    <span>Login</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Link */}
            <p
              className="text-center text-sm mt-5"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold hover:underline"
                style={{ color: '#8a5cff' }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right: Illustration Side */}
        <div className="hidden lg:block lg:w-1/2 p-3 sm:p-4">
          <div className="w-full h-full relative rounded-2xl overflow-hidden min-h-[540px]">
            <img
              src={isDark ? '/images/auth-dark.png' : '/images/auth-light.png'}
              alt="FutureEra Career Roadmap Journey"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
