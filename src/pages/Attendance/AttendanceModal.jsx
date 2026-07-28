import { useEffect, useMemo, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { getActiveStudents } from '../../services/student.service';
import { getActiveTrainers } from '../../services/trainer.service';

const getTodayLocal = () => {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

export default function AttendanceModal({
  isOpen,
  onClose,
  onSubmit,
  attendance = null,
  existingAttendances = [],
  isLoading = false,
}) {
  const [form, setForm] = useState({
    studentId: '',
    classNumber: '',
    classDate: getTodayLocal(),
    trainerId: '',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);

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

  const activeTrainers = useMemo(
    () => trainers.filter((t) => t.activeStatus === 'Active' || t.isActive === true),
    [trainers]
  );

  useEffect(() => {
    if (attendance) {
      setForm({
        studentId: attendance.studentId?._id || attendance.studentId || '',
        classNumber: attendance.classNumber || '',
        classDate: attendance.classDate
          ? new Date(attendance.classDate).toISOString().split('T')[0]
          : getTodayLocal(),
        trainerId: attendance.trainerId?._id || attendance.trainerId || '',
        remarks: attendance.remarks || '',
      });
    } else {
      setForm({
        studentId: '',
        classNumber: '',
        classDate: getTodayLocal(),
        trainerId: '',
        remarks: '',
      });
    }
    setErrors({});
  }, [attendance, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadActiveOptions = async () => {
      try {
        const [studentsResponse, trainersResponse] = await Promise.all([
          getActiveStudents({ page: 1, limit: 1000 }),
          getActiveTrainers({ page: 1, limit: 1000 }),
        ]);

        setStudents(studentsResponse?.data?.students || studentsResponse?.data?.data || []);
        setTrainers(trainersResponse?.data?.trainers || trainersResponse?.data?.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load active students and trainers');
      }
    };

    loadActiveOptions();
  }, [isOpen]);

  const validate = () => {
    const e = {};

    if (!form.studentId) e.studentId = 'Student is required';

    if (!form.classNumber && form.classNumber !== 0) {
      e.classNumber = 'Class number is required';
    } else if (Number(form.classNumber) <= 0) {
      e.classNumber = 'Class number must be greater than 0';
    }

    if (!form.classDate) {
      e.classDate = 'Class date is required';
    } else if (form.classDate > getTodayLocal()) {
      e.classDate = 'Class date cannot be in the future';
    }

    if (!form.trainerId) e.trainerId = 'Trainer is required';

    const duplicateClassForStudent = existingAttendances.some((item) => {
      const itemStudentId = item.studentId?._id || item.studentId;
      const currentStudentId = form.studentId;
      const sameStudent = itemStudentId === currentStudentId;
      const sameClassNumber = Number(item.classNumber) === Number(form.classNumber);
      const isSameRecord = attendance && item._id === attendance._id;
      return sameStudent && sameClassNumber && !isSameRecord;
    });

    if (!e.classNumber && !e.studentId && duplicateClassForStudent) {
      e.classNumber = 'Class number must be unique for the selected student';
    }

    if (form.remarks && form.remarks.length > 500) {
      e.remarks = 'Remarks cannot exceed 500 characters';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      classNumber: Number(form.classNumber),
      ...(attendance && { _id: attendance._id }),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
            {attendance ? 'Edit Attendance' : 'Record Attendance'}
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
              {errors.studentId && <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Class Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="classDate"
                value={form.classDate}
                onChange={handleChange}
                max={getTodayLocal()}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.classDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              />
              {errors.classDate && <p className="mt-1 text-sm text-red-500">{errors.classDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Trainer <span className="text-red-500">*</span>
              </label>
              <select
                name="trainerId"
                value={form.trainerId}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.trainerId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              >
                <option value="">Select active trainer</option>
                {activeTrainers.map((trainer) => (
                  <option key={trainer._id} value={trainer._id}>
                    {trainer.trainerName}
                  </option>
                ))}
              </select>
              {errors.trainerId && <p className="mt-1 text-sm text-red-500">{errors.trainerId}</p>}
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
              {isLoading ? 'Saving...' : attendance ? 'Update' : 'Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
