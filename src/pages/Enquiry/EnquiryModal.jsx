import { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';

// Keep date input limits aligned with the user's local calendar day.
const getTodayLocal = () => {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

export default function EnquiryModal({ isOpen, onClose, onSubmit, enquiry = null, isLoading = false }) {
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    place: '',
    enquiryType: 'Licence',
    description: '',
    enquiryDate: getTodayLocal(),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (enquiry) {
      setForm({
        name: enquiry.name || '',
        phoneNumber: enquiry.phoneNumber || '',
        place: enquiry.place || '',
        enquiryType: enquiry.enquiryType || 'Licence',
        description: enquiry.description || '',
        enquiryDate: enquiry.enquiryDate ? enquiry.enquiryDate.split('T')[0] : getTodayLocal(),
      });
    } else {
      setForm({
        name: '',
        phoneNumber: '',
        place: '',
        enquiryType: 'Licence',
        description: '',
        enquiryDate: getTodayLocal(),
      });
    }
    setErrors({});
  }, [enquiry, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!form.place.trim()) {
      newErrors.place = 'Place is required';
    }

    if (!form.enquiryType) {
      newErrors.enquiryType = 'Enquiry type is required';
    }

    if (form.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (form.enquiryDate > getTodayLocal()) {
      newErrors.enquiryDate = 'Future dates are not allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      ...form,
      ...(enquiry && { _id: enquiry._id }),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
            {enquiry ? 'Edit Enquiry' : 'Add New Enquiry'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 transition-colors hover:text-gray-700"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
              placeholder="Enter name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.phoneNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
              placeholder="10-digit mobile number"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Place */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Place <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="place"
              value={form.place}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.place
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
              placeholder="Enter place"
            />
            {errors.place && <p className="mt-1 text-sm text-red-500">{errors.place}</p>}
          </div>

          {/* Enquiry Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Enquiry Type <span className="text-red-500">*</span>
            </label>
            <select
              name="enquiryType"
              value={form.enquiryType}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.enquiryType
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
            >
              <option value="Licence">Licence</option>
              <option value="Practice">Practice</option>
            </select>
            {errors.enquiryType && (
              <p className="mt-1 text-sm text-red-500">{errors.enquiryType}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
              placeholder="Enter description (max 500 characters)"
            />
            <p className="mt-1 text-xs text-gray-500">
              {form.description.length}/500 characters
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Enquiry Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Enquiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="enquiryDate"
              value={form.enquiryDate}
              onChange={handleChange}
              max={getTodayLocal()}
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.enquiryDate
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
            />
            {errors.enquiryDate && (
              <p className="mt-1 text-sm text-red-500">{errors.enquiryDate}</p>
            )}
          </div>

          {/* Buttons */}
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
              className="flex-1 rounded-lg bg-[var(--color-gold)] py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:bg-[var(--color-gold-dark)] disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : enquiry ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
