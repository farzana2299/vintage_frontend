import { useEffect, useMemo, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { getActiveStudents } from '../../services/student.service';
import { PAYMENT_TYPES } from '../../constants/constants';

const getTodayLocal = () => {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

export default function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  payment = null,
  lockedStudent = null,
  isLoading = false,
}) {
  const [form, setForm] = useState({
    studentId: '',
    paymentType: '',
    classNumber: '',
    amount: '',
    paymentDate: getTodayLocal(),
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

  useEffect(() => {
    if (payment) {
      setForm({
        studentId: payment.studentId?._id || payment.studentId || lockedStudent?.id || '',
        paymentType: payment.paymentType || '',
        classNumber: payment.classNumber ?? '',
        amount: payment.amount ?? '',
        paymentDate: payment.paymentDate
          ? new Date(payment.paymentDate).toISOString().split('T')[0]
          : getTodayLocal(),
      });
    } else {
      setForm({
        studentId: lockedStudent?.id || '',
        paymentType: '',
        classNumber: '',
        amount: '',
        paymentDate: getTodayLocal(),
      });
    }
    setErrors({});
  }, [payment, isOpen, lockedStudent]);

  useEffect(() => {
    if (!isOpen || lockedStudent) {
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
  }, [isOpen, lockedStudent]);

  const validate = () => {
    const e = {};

    if (!form.studentId) e.studentId = 'Student is required';

    if (!form.paymentType) e.paymentType = 'Payment type is required';

    if (form.paymentType === 'Class') {
      if (!form.classNumber && form.classNumber !== 0) {
        e.classNumber = 'Class number is required for class payments';
      } else if (Number(form.classNumber) <= 0) {
        e.classNumber = 'Class number must be greater than 0';
      }
    }

    if (!form.amount && form.amount !== 0) {
      e.amount = 'Amount is required';
    } else if (Number(form.amount) <= 0) {
      e.amount = 'Amount must be greater than 0';
    }

    if (!form.paymentDate) {
      e.paymentDate = 'Payment date is required';
    } else if (form.paymentDate > getTodayLocal()) {
      e.paymentDate = 'Payment date cannot be in the future';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'paymentType' && value !== 'Class' ? { classNumber: '' } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      amount: Number(form.amount),
      classNumber: form.paymentType === 'Class' ? Number(form.classNumber) : undefined,
      ...(payment && { _id: payment._id }),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
            {payment ? 'Edit Payment' : 'Record Payment'}
          </h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Student <span className="text-red-500">*</span>
              </label>
              {lockedStudent ? (
                <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
                  {lockedStudent.name}
                </div>
              ) : (
                <>
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
                    <option value="">Select active student</option>
                    {activeStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.paymentType
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              >
                <option value="">Select payment type</option>
                {PAYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.paymentType && (
                <p className="mt-1 text-sm text-red-500">{errors.paymentType}</p>
              )}
            </div>

            {form.paymentType === 'Class' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                  Class Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="classNumber"
                  value={form.classNumber}
                  onChange={handleChange}
                  min="1"
                  className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.classNumber
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[var(--color-gold)]'
                  }`}
                  placeholder="Enter class number"
                />
                {errors.classNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.classNumber}</p>
                )}
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

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                max={getTodayLocal()}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.paymentDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              />
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-500">{errors.paymentDate}</p>
              )}
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
              {isLoading ? 'Saving...' : payment ? 'Update' : 'Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
