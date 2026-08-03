import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setLogout } from '../pages/Login/Login.slice';
import {
  HiHome,
  HiClipboardDocumentList,
  HiUsers,
  HiAcademicCap,
  HiCreditCard,
  HiCalendar,
  HiPencilSquare,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiArrowRightOnRectangle,
  HiXMark,
  HiBars3,
} from 'react-icons/hi2';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: HiHome },
  { name: 'Enquiry', path: '/enquiry', icon: HiClipboardDocumentList },
  { name: 'Students', path: '/students', icon: HiUsers },
  { name: 'Trainers', path: '/trainers', icon: HiAcademicCap },
  { name: 'Payments', path: '/payments', icon: HiCreditCard },
  { name: 'Attendance', path: '/attendance', icon: HiCalendar },
  { name: 'Tests', path: '/tests', icon: HiPencilSquare },
  { name: 'Income', path: '/income', icon: HiArrowTrendingUp },
  { name: 'Expense', path: '/expense', icon: HiArrowTrendingDown },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(setLogout());
    navigate('/login');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-20 z-50 rounded-lg bg-[var(--color-forest)] p-2 text-[var(--color-cream)] shadow-lg transition hover:bg-[var(--color-forest-deep)] lg:hidden"
      >
        {isOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-64px)] w-[84vw] max-w-xs transform border-r border-[rgba(18,33,28,0.2)] bg-[var(--color-forest-deep)] transition-transform duration-300 lg:w-64 lg:max-w-none lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo section on sidebar */}
          <div className="px-6 py-4 border-b border-[rgba(247,241,227,0.1)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(247,241,227,0.68)]">
              Navigation
            </p>
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map(({ name, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  isActive(path)
                    ? 'bg-[var(--color-gold)] text-[var(--color-forest-deep)] shadow-[0_4px_16px_rgba(199,155,73,0.32)]'
                    : 'text-[rgba(247,241,227,0.72)] hover:bg-[rgba(247,241,227,0.1)]'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{name}</span>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="px-3 border-t border-[rgba(247,241,227,0.1)]" />

          {/* Logout button */}
          <div className="px-3 py-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-300 hover:bg-red-500/10 transition"
            >
              <HiArrowRightOnRectangle size={20} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
