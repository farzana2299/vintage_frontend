import { useEffect, useMemo, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { getActiveStudents } from '../../services/student.service';
import { TEST_STATUS_OPTIONS, TEST_NAME_OPTIONS } from '../../constants/constants';

const getTodayLocal = () => {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

export default function TestModal({ isOpen, onClose, onSubmit, test = null, isLoading = false }) {
  const isNew = !test;

  const [form, setForm] = useState({
    studentId: '',
    testName: '',
    testDate: getTodayLocal(),
    testStatus: 'Pending',
    remarks: '',
    nextTestDate: '',
  });

  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);

  const activeStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          s.studentType === 'Driving Licence' &&
          (s.currentStatus === 'In Progress' || s.activeStatus === 'Active' || s.isActive === true)
      ),
    [students]
  );

  const selectedStudent = useMemo(
    () => activeStudents.find((s) => s._id === form.studentId),
    [activeStudents, form.studentId]
  );

  const isFailed = form.testStatus === 'Failed';

  useEffect(() => {
    if (test) {
      setForm({
        studentId: test.student?._id || test.studentId || '',
        testName: test.testName || '',
        testDate: test.testDate ? new Date(test.testDate).toISOString().split('T')[0] : getTodayLocal(),
        testStatus: test.testStatus || 'Pending',
        remarks: test.remarks || '',
        nextTestDate: test.nextTestDate ? new Date(test.nextTestDate).toISOString().split('T')[0] : '',
      });
    } else {
      setForm({
        studentId: '',
        testName: '',
        testDate: getTodayLocal(),
        testStatus: 'Pending',
        remarks: '',
        nextTestDate: '',
      });
    }
    setErrors({});
  }, [test, isOpen]);

  useEffect(() => {
    if (!isOpen || !isNew) {
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
  }, [isOpen, isNew]);

  const validate = () => {
    const e = {};

    if (isNew) {
      if (!form.studentId) e.studentId = 'Student is required';
      if (!form.testName) e.testName = 'Test name is required';
    }

    if (!form.testDate) {
      e.testDate = 'Test date is required';
    } else if ((isNew || form.testStatus === 'Pending') && form.testDate < getTodayLocal()) {
      e.testDate = 'Test date cannot be in the past while scheduling';
    }

    if (!form.testStatus) e.testStatus = 'Test status is required';

    if (isFailed) {
      if (!form.nextTestDate) {
        e.nextTestDate = 'Next test date is required when the test has failed';
      } else if (form.nextTestDate < getTodayLocal()) {
        e.nextTestDate = 'Next test date cannot be in the past';
      }
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
      ...(name === 'testStatus' && value !== 'Failed' ? { nextTestDate: '' } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isNew) {
      onSubmit({
        studentId: form.studentId,
        vehicleClass: selectedStudent?.classOfVehicle || '',
        testName: form.testName,
        testDate: form.testDate,
        remarks: form.remarks,
      });
      return;
    }

    onSubmit({
      testDate: form.testDate,
      testStatus: form.testStatus,
      remarks: form.remarks,
      nextTestDate: isFailed ? form.nextTestDate : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
            {isNew ? 'Schedule Test' : 'Update Test'}
          </h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {isNew ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                    Student <span className="text-red-500">*</span>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                    Vehicle Class
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
                    {selectedStudent?.classOfVehicle || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="testName"
                    value={form.testName}
                    onChange={handleChange}
                    className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                      errors.testName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[var(--color-gold)]'
                    }`}
                  >
                    <option value="">Select test</option>
                    {TEST_NAME_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.testName && (
                    <p className="mt-1 text-sm text-red-500">{errors.testName}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                    Student
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
                    {test.student?.name || test.studentName || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                    Vehicle Class
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
                    {test.vehicleClass || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                    Test Name
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
                    {test.testName || '-'}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Test Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="testDate"
                value={form.testDate}
                onChange={handleChange}
                min={isNew || form.testStatus === 'Pending' ? getTodayLocal() : undefined}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.testDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              />
              {errors.testDate && <p className="mt-1 text-sm text-red-500">{errors.testDate}</p>}
            </div>

            {!isNew && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                  Test Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="testStatus"
                  value={form.testStatus}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.testStatus
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[var(--color-gold)]'
                  }`}
                >
                  {TEST_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.testStatus && (
                  <p className="mt-1 text-sm text-red-500">{errors.testStatus}</p>
                )}
              </div>
            )}

            {!isNew && isFailed && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                  Next Test Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="nextTestDate"
                  value={form.nextTestDate}
                  onChange={handleChange}
                  min={getTodayLocal()}
                  className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.nextTestDate
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[var(--color-gold)]'
                  }`}
                />
                {errors.nextTestDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.nextTestDate}</p>
                )}
              </div>
            )}

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
              {isLoading ? 'Saving...' : isNew ? 'Schedule Test' : 'Update Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
