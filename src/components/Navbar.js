import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    
    <header className="sticky top-0 z-50 border-b border-[rgba(18,33,28,0.08)] bg-[rgba(16,39,29,0.92)] backdrop-blur-xl shadow-[0_14px_40px_rgba(16,39,29,0.18)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-inherit no-underline">
          <img
            src="/Images/logo.png"
            alt="Vintage Frontend logo"
            className="h-11 w-11 rounded-2xl object-cover shadow-[0_10px_24px_rgba(199,155,73,0.35)]"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-[0.95rem] font-semibold uppercase tracking-[0.32em] text-[rgba(247,241,227,0.68)]">
              Vintage
            </span>
            <span className="text-xl font-semibold text-[var(--color-cream)] sm:text-2xl">
              Driving School
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-gold)] shadow-[0_0_0_6px_rgba(199,155,73,0.16)]" />
          <span className="text-sm font-medium tracking-[0.24em] text-[rgba(247,241,227,0.72)] uppercase">
            Crafted for calm navigation
          </span>
        </div>
      </div>
    </header>
  );
}