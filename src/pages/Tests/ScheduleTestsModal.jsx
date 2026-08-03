import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';

const getTodayLocal = () => {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

export default function ScheduleTestsModal({ isOpen, onClose, onSubmit, pendingTests = [], isLoading = false }) {
  const [testDate, setTestDate] = useState(getTodayLocal());
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTestDate(getTodayLocal());
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!testDate) {
      setError('Test date is required');
      return;
    }
    if (testDate < getTodayLocal()) {
      setError('Test date cannot be in the past');
      return;
    }

    onSubmit({ testDate });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">Schedule Tests</h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <p className="text-sm text-gray-600">
            This date will be applied to all {pendingTests.length} pending test
            {pendingTests.length === 1 ? '' : 's'} without a date yet:
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingTests.map((t) => (
              <span
                key={t.testId || t._id || t.testName}
                className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
              >
                {t.testName}
              </span>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Test Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              min={getTodayLocal()}
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-[var(--color-gold)] py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
