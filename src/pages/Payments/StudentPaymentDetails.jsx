import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getPaymentsByStudentId,
  createPayment,
  updatePayment,
  deletePayment,
} from '../../services/payment.service';
import PaymentModal from './PaymentModal';
import { HiArrowLeft, HiPlus, HiPencil, HiTrash } from 'react-icons/hi2';

const formatCurrency = (amount) =>
  amount !== undefined && amount !== null ? `₹${Number(amount).toLocaleString('en-IN')}` : '-';

export default function StudentPaymentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalPaid: 0,
    totalClassesAttended: 0,
    totalClassesPaid: 0,
    totalAmountPaidForClass: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredPaymentDetails = useMemo(() => {
    let filtered = paymentDetails;

    if (paymentTypeFilter) {
      filtered = filtered.filter((item) => item.paymentType === paymentTypeFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((item) => {
        if (!item.paymentDate) return false;
        return new Date(item.paymentDate).toISOString().split('T')[0] === dateFilter;
      });
    }

    return filtered;
  }, [paymentDetails, paymentTypeFilter, dateFilter]);

  const loadStudentPayments = async () => {
    setIsLoading(true);
    try {
      const response = await getPaymentsByStudentId(studentId);
      if (response?.data?.status) {
        setStudentDetails(response.data.studentDetails || null);
        setPaymentDetails(response.data.payments || []);
        setSummaryStats({
          totalPaid: response.data.totalPaid ?? 0,
          totalClassesAttended: response.data.totalClassesAttended ?? 0,
          totalClassesPaid: response.data.totalClassesPaid ?? 0,
          totalAmountPaidForClass: response.data.totalAmountPaidForClass ?? 0,
        });
      } else {
        toast.error(response?.data?.message || 'Failed to load student payment history');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load student payment history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadStudentPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleClearFilters = () => {
    setPaymentTypeFilter('');
    setDateFilter('');
  };

  const handleAddClick = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedPayment({
      _id: item.paymentId || item._id,
      studentId,
      paymentType: item.paymentType,
      classNumber: item.classNumber,
      amount: item.amount,
      paymentDate: item.paymentDate,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      const payload = { ...formData, studentId };

      if (selectedPayment?._id) {
        const response = await updatePayment(selectedPayment._id, payload);
        if (response?.data?.status) {
          toast.success('Payment updated successfully');
          handleModalClose();
          loadStudentPayments();
        } else {
          toast.error(response?.data?.message || 'Failed to update payment');
        }
      } else {
        const response = await createPayment(payload);
        if (response?.data?.status) {
          toast.success('Payment recorded successfully');
          handleModalClose();
          loadStudentPayments();
        } else {
          toast.error(response?.data?.message || 'Failed to record payment');
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save payment');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      const paymentId = deleteConfirm.paymentId || deleteConfirm._id;
      const response = await deletePayment(paymentId);
      if (response?.data?.status) {
        toast.success('Payment deleted successfully');
        setDeleteConfirm(null);
        loadStudentPayments();
      } else {
        toast.error(response?.data?.message || 'Failed to delete payment');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete payment');
    }
  };

  const lockedStudent = studentDetails ? { id: studentId, name: studentDetails.name } : null;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/payments')}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-forest)] hover:opacity-80"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to Payments List
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">Student Payment History</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage payment details for selected student</p>
        </div>

        <button
          onClick={handleAddClick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Record Payment
        </button>
      </div>

      {studentDetails && (
        <div className="space-y-4 rounded-lg bg-white p-4 shadow">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Student Name</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{studentDetails.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Phone Number</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {studentDetails.phoneNumber || studentDetails.mobileNumber || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Place</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{studentDetails.place || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Total Paid</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatCurrency(summaryStats.totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Classes Attended</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {summaryStats.totalClassesAttended}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Classes Paid</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {summaryStats.totalClassesPaid}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Class Payments (₹)</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatCurrency(summaryStats.totalAmountPaidForClass)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={paymentTypeFilter}
            onChange={(e) => setPaymentTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Types</option>
            <option value="Registration">Registration</option>
            <option value="Class">Class</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />

          <button
            onClick={handleClearFilters}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]" />
          </div>
        ) : filteredPaymentDetails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No payment records found</p>
            <p className="text-sm">Use Record Payment to add a payment for this student</p>
          </div>
        ) : (
          <>
            {/* Card list - mobile & tablet */}
            <div className="divide-y divide-gray-200 lg:hidden">
              {filteredPaymentDetails.map((item, index) => (
                <div key={item.paymentId || item._id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-gray-900">
                      #{index + 1}{' '}
                      <span
                        className={`ml-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          item.paymentType === 'Registration'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.paymentType}
                      </span>
                    </p>
                    <p className="shrink-0 text-sm text-gray-600">
                      {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('en-IN') : '-'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Class</p>
                      <p className="text-gray-700">{item.classNumber ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Amount</p>
                      <p className="font-medium text-gray-700">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-100 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                    >
                      <HiPencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-100 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200"
                    >
                      <HiTrash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table - desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[860px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Sl No</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Payment Date</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Type</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Class</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Amount</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPaymentDetails.map((item, index) => (
                    <tr key={item.paymentId || item._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{index + 1}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            item.paymentType === 'Registration'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {item.paymentType}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{item.classNumber ?? '-'}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item)}
                            className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        payment={selectedPayment}
        lockedStudent={lockedStudent}
        isLoading={isModalLoading}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Delete Payment</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete this <strong>{deleteConfirm.paymentType}</strong>{' '}
                payment of <strong>{formatCurrency(deleteConfirm.amount)}</strong>?
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 rounded-lg bg-red-600 py-2 font-medium text-white transition-colors hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
