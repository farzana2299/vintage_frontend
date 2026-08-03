import { useEffect, useMemo, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { getActiveStudents } from '../../services/student.service';
import { INCOME_TYPES } from '../../constants/constants';

const getTodayLocal = () => {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

export default function IncomeModal({ isOpen, onClose, onSubmit, income = null, isLoading = false }) {
  const [form, setForm] = useState({
    incomeDate: getTodayLocal(),
    incomeType: '',
    studentId: '',
    amount: '',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);

  const activeStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          s.currentStatus === 'In Progress' ||
          s.activeStatus === 'Active' ||
          s.status === 'Active' ||
          s.isActive === true
      ),
    [students]
  );

  const studentRequired = form.incomeType && form.incomeType !== 'Others';

  useEffect(() => {
    if (income) {
      setForm({
        incomeDate: income.incomeDate
          ? new Date(income.incomeDate).toISOString().split('T')[0]
          : getTodayLocal(),
        incomeType: income.incomeType || '',
        studentId: income.studentId?._id || income.studentId || '',
        amount: income.amount ?? '',
        remarks: income.remarks || '',
      });
    } else {
      setForm({
        incomeDate: getTodayLocal(),
        incomeType: '',
        studentId: '',
        amount: '',
        remarks: '',
      });
    }
    setErrors({});
  }, [income, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadActiveStudents = async () => {
      try {
        const response = await getActiveStudents({ page: 1, limit: 1000 });
        setStudents(response?.data?.students || response?.data?.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load active students');
      }
    };

    loadActiveStudents();
  }, [isOpen]);

  const validate = () => {
    const e = {};

    if (!form.incomeDate) {
      e.incomeDate = 'Income date is required';
    } else if (form.incomeDate > getTodayLocal()) {
      e.incomeDate = 'Income date cannot be in the future';
    }

    if (!form.incomeType) e.incomeType = 'Income type is required';

    if (studentRequired && !form.studentId) {
      e.studentId = 'Student is required for this income type';
    }

    if (!form.amount && form.amount !== 0) {
      e.amount = 'Amount is required';
    } else if (Number(form.amount) <= 0) {
      e.amount = 'Amount must be greater than 0';
    }

    if (form.remarks && form.remarks.length > 500) {
      e.remarks = 'Remarks cannot exceed 500 characters';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'incomeType' && value === 'Others' ? { studentId: '' } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      amount: Number(form.amount),
      studentId: form.studentId || undefined,
      ...(income && { _id: income._id }),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
            {income ? 'Edit Income' : 'Add Income'}
          </h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Income Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="incomeDate"
                value={form.incomeDate}
                onChange={handleChange}
                max={getTodayLocal()}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.incomeDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              />
              {errors.incomeDate && (
                <p className="mt-1 text-sm text-red-500">{errors.incomeDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Income Type <span className="text-red-500">*</span>
              </label>
              <select
                name="incomeType"
                value={form.incomeType}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.incomeType
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              >
                <option value="">Select income type</option>
                {INCOME_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.incomeType && (
                <p className="mt-1 text-sm text-red-500">{errors.incomeType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Student Name {studentRequired && <span className="text-red-500">*</span>}
                {!studentRequired && form.incomeType === 'Others' && (
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                )}
              </label>
              <select
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.studentId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              >
                <option value="">Select student</option>
                {activeStudents.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
              {errors.studentId && <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="1"
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
                placeholder="Enter amount"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
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
          </div>

          <div className="flex gap-3 pt-4">
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
              {isLoading ? 'Saving...' : income ? 'Update' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
