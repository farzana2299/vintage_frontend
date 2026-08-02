import { useState, useEffect, useRef } from 'react';
import { HiXMark, HiPhoto } from 'react-icons/hi2';
import {
  GENDER_OPTIONS,
  CLASS_OF_VEHICLE_OPTIONS,
  CURRENT_STATUS_OPTIONS,
} from '../../constants/constants';

// Canonical order used when combining multiple vehicle classes, e.g. "LMV & MCWG".
const buildClassOfVehicle = (selected) =>
  CLASS_OF_VEHICLE_OPTIONS.filter((option) => selected.includes(option)).join(' & ');

const INITIAL_FORM = {
  studentType: 'Driving Licence',
  name: '',
  gender: 'Male',
  mobileNumber: '',
  photo: null,
  applicationNumber: '',
  dateOfBirth: '',
  place: '',
  address: '',
  learnersLicenceExpiryDate: '',
  registrationPayment: '',
  amountPerClass: '',
  classOfVehicle: 'LMV',
  roadSafetyClassAttended: 'No',
  currentStatus: 'In Progress',
};

export default function DrivingLicenceModal({
  isOpen,
  onClose,
  onSubmit,
  student = null,
  isLoading = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (student) {
      setForm({
        studentType: student.studentType || 'Driving Licence',
        name: student.name || '',
        gender: student.gender || 'Male',
        mobileNumber: student.mobileNumber || '',
        photo: null,
        applicationNumber: student.applicationNumber || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        place: student.place || '',
        address: student.address || '',
        learnersLicenceExpiryDate: student.learnersLicenceExpiryDate
          ? student.learnersLicenceExpiryDate.split('T')[0]
          : '',
        registrationPayment: student.registrationPayment ?? '',
        amountPerClass: student.amountPerClass || '',
        classOfVehicle: student.classOfVehicle || 'LMV',
        roadSafetyClassAttended: student.roadSafetyClassAttended || 'No',
        currentStatus: student.currentStatus || 'In Progress',
      });
      setPhotoPreview(student.photoUrl || null);
    } else {
      setForm(INITIAL_FORM);
      setPhotoPreview(null);
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

    if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
    else if (form.dateOfBirth > todayStr) e.dateOfBirth = 'Cannot be a future date';

    if (!form.place.trim()) e.place = 'Place is required';
    else if (form.place.length > 100) e.place = 'Max 100 characters';

    if (form.address && form.address.length > 500) e.address = 'Max 500 characters';

    if (form.learnersLicenceExpiryDate && form.learnersLicenceExpiryDate <= todayStr)
      e.learnersLicenceExpiryDate = 'Must be a future date';

    if (form.registrationPayment !== '' && Number(form.registrationPayment) < 0)
      e.registrationPayment = 'Must be 0 or greater';

    if (form.amountPerClass !== '' && Number(form.amountPerClass) <= 0)
      e.amountPerClass = 'Must be greater than 0';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassOfVehicleToggle = (option) => {
    setForm((prev) => {
      const selected = prev.classOfVehicle ? prev.classOfVehicle.split(' & ') : [];
      const isSelected = selected.includes(option);

      if (isSelected && selected.length === 1) {
        // Keep at least one vehicle class selected at all times.
        return prev;
      }

      const nextSelected = isSelected
        ? selected.filter((item) => item !== option)
        : [...selected, option];

      return { ...prev, classOfVehicle: buildClassOfVehicle(nextSelected) };
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
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
        max={type === 'date' && (name === 'dateOfBirth') ? todayStr : undefined}
        min={type === 'date' && (name === 'learnersLicenceExpiryDate') ? todayStr : undefined}
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
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
              {student ? 'Edit' : 'Add'} Driving Licence Student
            </h2>
            <p className="text-xs text-gray-500">Fill in all required fields</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Photo Upload */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Photo (JPG, JPEG, PNG)
              </label>
              <div className="mt-1 flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[var(--color-gold)]"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <HiPhoto className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name */}
            {field('Name', 'name', 'text', true, { placeholder: 'Enter full name' })}

            {/* Gender */}
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
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile */}
            {field('Mobile Number', 'mobileNumber', 'tel', true, { placeholder: '10-digit number' })}

            {/* Application Number */}
            {field('Application Number', 'applicationNumber', 'text', false, { placeholder: 'Unique application number' })}

            {/* Date of Birth */}
            {field('Date of Birth', 'dateOfBirth', 'date', true)}

            {/* Place */}
            {field('Place', 'place', 'text', true, { placeholder: 'Enter place' })}

            {/* Learner's Licence Expiry */}
            {field("Learner's Licence Expiry Date", 'learnersLicenceExpiryDate', 'date', false)}

            {/* Registration Payment */}
            {field('Registration Payment (₹)', 'registrationPayment', 'number', false, { min: 0, placeholder: '0' })}

            {/* Amount Per Class */}
            {field('Amount Per Class (₹)', 'amountPerClass', 'number', false, { min: 1, placeholder: 'e.g. 500' })}

            {/* Class of Vehicle */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Class of Vehicle
              </label>
              <div className="mt-2 flex gap-6">
                {CLASS_OF_VEHICLE_OPTIONS.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.classOfVehicle.split(' & ').includes(option)}
                      onChange={() => handleClassOfVehicleToggle(option)}
                      className="accent-[var(--color-forest)]"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select both to register for LMV &amp; MCWG
              </p>
            </div>

            {/* Current Status */}
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
                {CURRENT_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Road Safety Class */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Road Safety Class Attended
              </label>
              <div className="mt-2 flex gap-6">
                {['Yes', 'No'].map((val) => (
                  <label key={val} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="roadSafetyClassAttended"
                      value={val}
                      checked={form.roadSafetyClassAttended === val}
                      onChange={handleChange}
                      className="accent-[var(--color-forest)]"
                    />
                    <span className="text-sm text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder="Enter full address"
                className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.address
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-gold)]'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">{form.address.length}/500</p>
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
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
            type="submit"
            form="dl-form"
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
