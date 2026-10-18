'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

function DiamondMark() {
  return (
    <svg className="login-diamond" viewBox="0 0 72 62" fill="none" aria-hidden="true">
      <path d="M15 5 36 1l21 4 13 18-34 37L2 23 15 5Z" fill="currentColor" />
      <path d="m15 5 8 18 13 37 13-37 8-18M2 23h68M23 23 15 5m34 18 8-18" stroke="#fff9ef" strokeWidth="2.5" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      setUser(data.user as any);
      document.cookie = `userRole=${data.user.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-showcase" aria-label="Shree Jewellers">
      </section>
      <svg className="showcase-curve" viewBox="0 0 1000 800" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M 500 0 C 580 160, 560 300, 500 400 C 440 500, 420 640, 500 800 L 1000 800 L 1000 0 Z"
          fill="#fbf6ed"
          stroke="none"
        />
        <path
          d="M 500 -2 C 580 160, 560 300, 500 400 C 440 500, 420 640, 500 802"
          fill="none"
          stroke="#c69a4a"
          strokeWidth="10"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <section className="login-panel">
        <div className="login-brand">
          <DiamondMark />
          <h1>Shree Jewellers</h1>
          <div className="brand-tagline"><span />Tradition meets trust<span /></div>
        </div>

        <div className="login-card">
          <header className="login-card-heading">
            <h2>Welcome Back</h2>
            <p>Sign in to manage your jewellery business</p>
          </header>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error" role="alert">{error}</div>}
            <label className="login-input-wrap" htmlFor="email">
              <UserRound size={23} strokeWidth={1.8} aria-hidden="true" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" placeholder="Username or Email" />
            </label>
            <label className="login-input-wrap" htmlFor="password">
              <LockKeyhole size={23} strokeWidth={1.8} aria-hidden="true" />
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Password" />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </label>
            <div className="login-options">
              <label className="remember-option"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /><span>Remember me</span></label>
              <a href="mailto:admin@jewellery-erp.local?subject=Password%20reset" className="forgot-link">Forgot Password?</a>
            </div>
            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : <>Sign In <ArrowRight size={22} strokeWidth={1.8} /></>}
            </button>
          </form>
          <div className="login-divider"><span />or<span /></div>
        </div>
        <p className="login-footer">A legacy of elegance, managed with care.</p>
      </section>
    </main>
  );
}

