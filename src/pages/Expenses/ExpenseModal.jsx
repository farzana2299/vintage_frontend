import { useEffect, useMemo, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { getActiveTrainers } from '../../services/trainer.service';
import { EXPENSE_TYPES } from '../../constants/constants';

const getTodayLocal = () => {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

export default function ExpenseModal({ isOpen, onClose, onSubmit, expense = null, isLoading = false }) {
  const [form, setForm] = useState({
    expenseDate: getTodayLocal(),
    expenseType: '',
    staffId: '',
    amount: '',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [trainers, setTrainers] = useState([]);

  const activeTrainers = useMemo(
    () => trainers.filter((t) => t.activeStatus === 'Active' || t.isActive === true),
    [trainers]
  );

  const staffRequired = form.expenseType === 'Staff Salary';

  useEffect(() => {
    if (expense) {
      setForm({
        expenseDate: expense.expenseDate
          ? new Date(expense.expenseDate).toISOString().split('T')[0]
          : getTodayLocal(),
        expenseType: expense.expenseType || '',
        staffId: expense.staff?._id || expense.staffId || '',
        amount: expense.amount ?? '',
        remarks: expense.remarks || '',
      });
    } else {
      setForm({
        expenseDate: getTodayLocal(),
        expenseType: '',
        staffId: '',
        amount: '',
        remarks: '',
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadActiveTrainers = async () => {
      try {
        const response = await getActiveTrainers({ page: 1, limit: 1000 });
        setTrainers(response?.data?.trainers || response?.data?.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load staff list');
      }
    };

    loadActiveTrainers();
  }, [isOpen]);

  const validate = () => {
    const e = {};

    if (!form.expenseDate) {
      e.expenseDate = 'Expense date is required';
    } else if (form.expenseDate > getTodayLocal()) {
      e.expenseDate = 'Expense date cannot be in the future';
    }

    if (!form.expenseType) e.expenseType = 'Expense type is required';

    if (staffRequired && !form.staffId) {
      e.staffId = 'Staff name is required for staff salary expenses';
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
      ...(name === 'expenseType' && value !== 'Staff Salary' ? { staffId: '' } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      amount: Number(form.amount),
      staffId: form.staffId || undefined,
      ...(expense && { _id: expense._id }),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Expense Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expenseDate"
                value={form.expenseDate}
                onChange={handleChange}
                max={getTodayLocal()}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.expenseDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              />
              {errors.expenseDate && (
                <p className="mt-1 text-sm text-red-500">{errors.expenseDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Expense Type <span className="text-red-500">*</span>
              </label>
              <select
                name="expenseType"
                value={form.expenseType}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.expenseType
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              >
                <option value="">Select expense type</option>
                {EXPENSE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.expenseType && (
                <p className="mt-1 text-sm text-red-500">{errors.expenseType}</p>
              )}
            </div>

            {staffRequired && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                  Staff Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="staffId"
                  value={form.staffId}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.staffId
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[var(--color-gold)]'
                  }`}
                >
                  <option value="">Select staff</option>
                  {activeTrainers.map((trainer) => (
                    <option key={trainer._id} value={trainer._id}>
                      {trainer.trainerName}
                    </option>
                  ))}
                </select>
                {errors.staffId && <p className="mt-1 text-sm text-red-500">{errors.staffId}</p>}
              </div>
            )}

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
              {isLoading ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
