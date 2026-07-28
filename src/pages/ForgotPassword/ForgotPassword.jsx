
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setChangePasswordResponse } from './ForgotPassword.slice';
import { adminChangePassword } from '../../services/admin.service';
import { toast } from 'react-toastify';
import { HiEye, HiEyeOff, HiUser, HiLockClosed, HiKey, HiCheckCircle } from 'react-icons/hi';

export default function ForgotPassword() {
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ username: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.newPassword || !form.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    adminChangePassword({
      username: form.username,
      newPassword: form.newPassword,
    })
      .then((response) => {
        if (response?.data?.status) {
          dispatch(setChangePasswordResponse(response.data));
          toast.success(response.data.message || 'Password changed successfully');
          navigate('/login');
          return;
        }

        toast.error(response?.data?.message || 'Password change failed. Please try again.');
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Password change failed. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-16">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-[var(--color-gold)] opacity-[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[var(--color-forest)] opacity-[0.07] blur-3xl" />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="rounded-[2.25rem] border border-[rgba(18,33,28,0.09)] bg-[rgba(255,252,245,0.84)] p-10 shadow-[0_32px_80px_rgba(16,39,29,0.12)] backdrop-blur-xl">

          {/* Header */}
          <div className="mb-9 flex flex-col items-center gap-4 text-center">
            {/* Key icon badge */}
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-forest-deep),var(--color-forest))] shadow-[0_10px_28px_rgba(16,39,29,0.28)]">
              <HiKey className="h-8 w-8 text-[var(--color-gold)]" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-gold)]">
                Account Recovery
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">
                Reset Your Password
              </h1>
              <p className="mt-1.5 text-sm text-[rgba(18,33,28,0.55)]">
                Enter your username and choose a new password
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-[var(--color-forest-deep)]">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-forest)] opacity-60">
                  <HiUser className="h-[18px] w-[18px]" />
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
                  className="w-full rounded-xl border border-[rgba(18,33,28,0.12)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--color-ink)] placeholder-[rgba(18,33,28,0.35)] outline-none transition focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[rgba(29,77,58,0.15)] hover:border-[rgba(29,77,58,0.3)]"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[rgba(18,33,28,0.07)]" />
              <span className="text-xs font-medium uppercase tracking-widest text-[rgba(18,33,28,0.3)]">New credentials</span>
              <span className="h-px flex-1 bg-[rgba(18,33,28,0.07)]" />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-sm font-semibold text-[var(--color-forest-deep)]">
                New Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-forest)] opacity-60">
                  <HiLockClosed className="h-[18px] w-[18px]" />
                </span>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full rounded-xl border border-[rgba(18,33,28,0.12)] bg-white py-3 pl-11 pr-11 text-sm text-[var(--color-ink)] placeholder-[rgba(18,33,28,0.35)] outline-none transition focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[rgba(29,77,58,0.15)] hover:border-[rgba(29,77,58,0.3)]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  className="absolute inset-y-0 right-3 flex items-center px-1 text-[rgba(18,33,28,0.4)] transition hover:text-[var(--color-forest)]"
                >
                  {showNew ? <HiEyeOff className="h-[18px] w-[18px]" /> : <HiEye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-[var(--color-forest-deep)]">
                Confirm Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-forest)] opacity-60">
                  <HiCheckCircle className="h-[18px] w-[18px]" />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your new password"
                  className={`w-full rounded-xl border py-3 pl-11 pr-11 text-sm text-[var(--color-ink)] placeholder-[rgba(18,33,28,0.35)] outline-none transition hover:border-[rgba(29,77,58,0.3)] focus:ring-2 bg-white ${
                    form.confirmPassword && form.confirmPassword !== form.newPassword
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : form.confirmPassword && form.confirmPassword === form.newPassword
                      ? 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-100'
                      : 'border-[rgba(18,33,28,0.12)] focus:border-[var(--color-forest)] focus:ring-[rgba(29,77,58,0.15)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute inset-y-0 right-3 flex items-center px-1 text-[rgba(18,33,28,0.4)] transition hover:text-[var(--color-forest)]"
                >
                  {showConfirm ? <HiEyeOff className="h-[18px] w-[18px]" /> : <HiEye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                <p className="mt-0.5 text-xs font-medium text-red-500">Passwords do not match</p>
              )}
              {form.confirmPassword && form.confirmPassword === form.newPassword && (
                <p className="mt-0.5 text-xs font-medium text-emerald-600">Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-[linear-gradient(135deg,var(--color-forest-deep),var(--color-forest))] py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-cream)] shadow-[0_12px_32px_rgba(16,39,29,0.28)] transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

          </form>

          {/* Back to login */}
          <p className="mt-7 text-center text-sm text-[rgba(18,33,28,0.5)]">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-forest)] underline-offset-2 hover:text-[var(--color-gold)] hover:underline transition-colors"
            >
              Back to Sign In
            </Link>
          </p>

        </div>

        {/* Footer note */}
        <p className="mt-7 text-center text-xs text-[rgba(18,33,28,0.4)]">
          © {new Date().getFullYear()} Vintage Driving School. All rights reserved.
        </p>

      </div>
    </div>
  );
}
