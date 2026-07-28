import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setLoginResponse } from './Login.slice';
import { adminLogin } from '../../services/admin.service';
import { toast } from 'react-toastify';
import { HiEye, HiEyeOff, HiUser, HiLockClosed } from 'react-icons/hi';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    adminLogin({ username: form.username, password: form.password })
      .then((response) => {
        if (response?.data?.status) {
          dispatch(setLoginResponse(response.data));
          toast.success(response.data.message || 'Login successful!');
          navigate('/');
          return;
        }

        toast.error(response?.data?.message || 'Login failed. Please try again.');
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Login failed. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-10 sm:py-16">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-[var(--color-forest)] opacity-[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-[var(--color-gold)] opacity-[0.10] blur-3xl" />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="rounded-[2.25rem] border border-[rgba(18,33,28,0.09)] bg-[rgba(255,252,245,0.82)] p-6 shadow-[0_32px_80px_rgba(16,39,29,0.12)] backdrop-blur-xl sm:p-10">

          {/* Logo + heading */}
          <div className="mb-9 flex flex-col items-center gap-4 text-center">
            <img
              src="/Images/logo.png"
              alt="Vintage Driving School"
              className="h-16 w-16 rounded-2xl object-cover shadow-[0_8px_24px_rgba(199,155,73,0.32)]"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-gold)]">
                Welcome back
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">
                Vintage Driving School
              </h1>
              <p className="mt-1.5 text-sm text-[rgba(18,33,28,0.55)]">
                Sign in to continue to your account
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-[rgba(18,33,28,0.08)]" />
            <span className="text-xs font-medium uppercase tracking-widest text-[rgba(18,33,28,0.35)]">
              Sign In
            </span>
            <span className="h-px flex-1 bg-[rgba(18,33,28,0.08)]" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-sm font-semibold text-[var(--color-forest-deep)]"
              >
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-forest)]">
                  <HiUser className="h-[18px] w-[18px] opacity-60" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-[rgba(18,33,28,0.12)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--color-ink)] placeholder-[rgba(18,33,28,0.35)] outline-none ring-0 transition focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[rgba(29,77,58,0.15)] hover:border-[rgba(29,77,58,0.3)]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-[var(--color-forest-deep)]"
              >
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-forest)]">
                  <HiLockClosed className="h-[18px] w-[18px] opacity-60" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[rgba(18,33,28,0.12)] bg-white py-3 pl-11 pr-11 text-sm text-[var(--color-ink)] placeholder-[rgba(18,33,28,0.35)] outline-none ring-0 transition focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[rgba(29,77,58,0.15)] hover:border-[rgba(29,77,58,0.3)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center px-1 text-[rgba(18,33,28,0.4)] transition hover:text-[var(--color-forest)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiEyeOff className="h-[18px] w-[18px]" /> : <HiEye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[var(--color-forest)] underline-offset-2 hover:text-[var(--color-gold)] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full rounded-xl bg-[linear-gradient(135deg,var(--color-forest-deep),var(--color-forest))] py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-cream)] shadow-[0_12px_32px_rgba(16,39,29,0.28)] transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

        </div>

        {/* Footer note */}
        <p className="mt-7 text-center text-xs text-[rgba(18,33,28,0.4)]">
          © {new Date().getFullYear()} Vintage Driving School. All rights reserved.
        </p>

      </div>
    </div>
  );
}
