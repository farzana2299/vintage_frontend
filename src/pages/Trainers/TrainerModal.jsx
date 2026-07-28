import { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';

export default function TrainerModal({ isOpen, onClose, onSubmit, trainer = null, isLoading = false }) {
  const [form, setForm] = useState({
    trainerName: '',
    phoneNumber: '',
    place: '',
    activeStatus: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (trainer) {
      setForm({
        trainerName: trainer.trainerName || '',
        phoneNumber: trainer.phoneNumber || '',
        place: trainer.place || '',
        activeStatus: trainer.activeStatus || 'Active',
      });
    } else {
      setForm({ trainerName: '', phoneNumber: '', place: '', activeStatus: 'Active' });
    }
    setErrors({});
  }, [trainer, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.trainerName.trim()) {
      newErrors.trainerName = 'Trainer name is required';
    } else if (form.trainerName.length > 100) {
      newErrors.trainerName = 'Trainer name must be less than 100 characters';
    }

    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!form.place.trim()) {
      newErrors.place = 'Place is required';
    } else if (form.place.length > 100) {
      newErrors.place = 'Place must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({ ...form, ...(trainer && { _id: trainer._id }) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">
            {trainer ? 'Edit Trainer' : 'Add New Trainer'}
          </h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Trainer Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Trainer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="trainerName"
              value={form.trainerName}
              onChange={handleChange}
              placeholder="Enter trainer name"
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.trainerName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
            />
            {errors.trainerName && <p className="mt-1 text-sm text-red-500">{errors.trainerName}</p>}
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
              placeholder="10-digit mobile number"
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.phoneNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
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
              placeholder="Enter place"
              className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.place
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[var(--color-gold)]'
              }`}
            />
            {errors.place && <p className="mt-1 text-sm text-red-500">{errors.place}</p>}
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-forest-deep)]">
              Active Status <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="activeStatus"
                  value="Active"
                  checked={form.activeStatus === 'Active'}
                  onChange={() => setForm((prev) => ({ ...prev, activeStatus: 'Active' }))}
                  className="accent-[var(--color-forest)]"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="activeStatus"
                  value="Inactive"
                  checked={form.activeStatus === 'Inactive'}
                  onChange={() => setForm((prev) => ({ ...prev, activeStatus: 'Inactive' }))}
                  className="accent-[var(--color-forest)]"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
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
              className="flex-1 rounded-lg bg-[var(--color-gold)] py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : trainer ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
