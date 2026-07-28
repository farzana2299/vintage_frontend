import { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';

const INITIAL_FORM = {
  studentType: 'Practice',
  name: '',
  mobileNumber: '',
  gender: 'Male',
  place: '',
  drivingLicenceNumber: '',
  practiceVehicleType: 'LMV',
  amountPerClass: '',
  currentStatus: 'In Progress',
};

export default function PracticeModal({
  isOpen,
  onClose,
  onSubmit,
  student = null,
  isLoading = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setForm({
        studentType: 'Practice',
        name: student.name || '',
        mobileNumber: student.mobileNumber || '',
        gender: student.gender || 'Male',
        place: student.place || '',
        drivingLicenceNumber: student.drivingLicenceNumber || '',
        practiceVehicleType: student.practiceVehicleType || 'LMV',
        amountPerClass: student.amountPerClass || '',
        currentStatus: student.currentStatus || 'In Progress',
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [student, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.length > 100) e.name = 'Max 100 characters';

    if (!form.mobileNumber.trim()) e.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobileNumber.replace(/\D/g, '')))
      e.mobileNumber = 'Must be a valid 10-digit number';

    if (!form.place.trim()) e.place = 'Place is required';
    else if (form.place.length > 100) e.place = 'Max 100 characters';

    if (!form.drivingLicenceNumber.trim())
      e.drivingLicenceNumber = 'Driving licence number is required';

    if (form.amountPerClass !== '' && Number(form.amountPerClass) <= 0)
      e.amountPerClass = 'Must be greater than 0';

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
    onSubmit({ ...form, ...(student && { _id: student._id }) });
  };

  if (!isOpen) return null;

  const field = (label, name, type = 'text', required = true, extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
          errors[name]
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-[var(--color-gold)]'
        }`}
        {...extra}
      />
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
              {student ? 'Edit' : 'Add'} Practice Student
            </h2>
            <p className="text-xs text-gray-500">Fill in all required fields</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {field('Name', 'name', 'text', true, { placeholder: 'Enter full name' })}

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {field('Mobile Number', 'mobileNumber', 'tel', true, { placeholder: '10-digit number' })}

            {field('Place', 'place', 'text', true, { placeholder: 'Enter place' })}

            {field('Driving Licence Number', 'drivingLicenceNumber', 'text', true, {
              placeholder: 'Enter licence number',
            })}

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Practice Vehicle Type
              </label>
              <select
                name="practiceVehicleType"
                value={form.practiceVehicleType}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
              >
                <option value="LMV">LMV</option>
                <option value="MCWG">MCWG</option>
              </select>
            </div>

            {field('Amount Per Class (₹)', 'amountPerClass', 'number', false, {
              min: 1,
              placeholder: 'e.g. 300',
            })}

            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Current Status
              </label>
              <select
                name="currentStatus"
                value={form.currentStatus}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-[var(--color-gold)] py-2 font-medium text-[var(--color-forest-deep)] hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : student ? 'Update' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
