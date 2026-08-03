import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { TEST_RESULT_OPTIONS } from '../../constants/constants';

export default function TestResultModal({ isOpen, onClose, onSubmit, test, isLoading = false }) {
  const [form, setForm] = useState({ testStatus: 'Passed', remarks: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        testStatus: test?.testStatus === 'Failed' || test?.testStatus === 'Passed' ? test.testStatus : 'Passed',
        remarks: test?.remarks || '',
      });
      setErrors({});
    }
  }, [isOpen, test]);

  const validate = () => {
    const e = {};
    if (!form.testStatus) e.testStatus = 'Test status is required';
    if (form.remarks && form.remarks.length > 500) e.remarks = 'Remarks cannot exceed 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ testStatus: form.testStatus, remarks: form.remarks });
  };

  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">Record Result</h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <p className="text-sm text-gray-600">
            {test.testName}
            {test.testDate && (
              <span className="text-gray-400">
                {' '}
                &middot; {new Date(test.testDate).toLocaleDateString('en-IN')}
              </span>
            )}
          </p>

          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Test Status <span className="text-red-500">*</span>
            </label>
            <select
              value={form.testStatus}
              onChange={(e) => setForm((prev) => ({ ...prev, testStatus: e.target.value }))}
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.testStatus
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
            >
              {TEST_RESULT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.testStatus && <p className="mt-1 text-sm text-red-500">{errors.testStatus}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
              rows="3"
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.remarks
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
              placeholder="Add remarks (optional)"
            />
            <p className="mt-1 text-xs text-gray-500">{form.remarks.length}/500</p>
            {errors.remarks && <p className="mt-1 text-sm text-red-500">{errors.remarks}</p>}
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
              {isLoading ? 'Saving...' : 'Save Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
