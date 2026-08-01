import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setPaymentSummaries,
  filterPaymentSummaries,
  clearFilters,
  setLoading,
  setError,
} from './Payment.slice';
import { getPaymentStudentsSummary, createPayment } from '../../services/payment.service';
import { getActiveStudents } from '../../services/student.service';
import { toast } from 'react-toastify';
import PaymentModal from './PaymentModal';
import Pagination from '../../componds/Pagination';
import { HiPlus, HiMagnifyingGlass, HiEye } from 'react-icons/hi2';

const formatCurrency = (amount) =>
  amount !== undefined && amount !== null ? `₹${Number(amount).toLocaleString('en-IN')}` : '-';

export default function Payments() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { filteredPaymentSummaries, loading } = useAppSelector((state) => state.payment);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [activeStudents, setActiveStudents] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilter, setStudentFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchPaymentSummaries(page, limit);
  }, [page, limit]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchPaymentSummaries = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getPaymentStudentsSummary({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        dispatch(setPaymentSummaries(response.data.summary || []));
        setPagination(
          response.data.pagination || { total: 0, page: currentPage, limit: currentLimit, pages: 1 }
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch payment summary');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await getActiveStudents({ page: 1, limit: 1000 });
      setActiveStudents(response?.data?.students || response?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load active students');
    }
  };

  const handleAddClick = () => setIsModalOpen(true);

  const handleViewMoreClick = (summary) => {
    if (!summary?.studentId) {
      toast.error('Student ID not available for this row');
      return;
    }
    navigate(`/payments/student/${summary.studentId}`);
  };

  const handleModalClose = () => setIsModalOpen(false);

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      const response = await createPayment(formData);
      if (response?.data?.status) {
        toast.success('Payment recorded successfully');
        handleModalClose();
        fetchPaymentSummaries(page, limit);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save payment');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(filterPaymentSummaries({ searchTerm, studentId: studentFilter }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStudentFilter('');
    setPage(1);
    dispatch(clearFilters());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages || newPage === page) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">
            Payment Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">Track registration and class payments per student</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Record Payment
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <HiMagnifyingGlass className="pointer-events-none absolute inset-y-0 left-3 flex h-full items-center text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, place, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            />
          </div>

          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Students</option>
            {activeStudents.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSearch}
              className="w-full rounded-lg bg-[var(--color-forest)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-forest-deep)]"
            >
              Search
            </button>

            <button
              onClick={handleClearFilters}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]" />
          </div>
        ) : filteredPaymentSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No payment records found</p>
            <p className="text-sm">Try adjusting filters or record a new payment</p>
          </div>
        ) : (
          <>
            {/* Card list - mobile & tablet */}
            <div className="divide-y divide-gray-200 lg:hidden">
              {filteredPaymentSummaries.map((summary) => (
                <div key={summary.studentId} className="space-y-3 p-4">
                  <p className="font-medium text-gray-900">{summary.studentName}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Place</p>
                      <p className="text-gray-700">{summary.place || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Phone</p>
                      <p className="text-gray-700">{summary.mobileNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Total Paid</p>
                      <p className="font-medium text-gray-700">{formatCurrency(summary.totalPaymentDone)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Classes Attended</p>
                      <p className="text-gray-700">{summary.totalClassAttended ?? 0}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewMoreClick(summary)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-100 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200"
                  >
                    <HiEye className="h-4 w-4" />
                    View More
                  </button>
                </div>
              ))}
            </div>

            {/* Table - desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[860px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Student</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Place</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Phone Number</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Total Payment</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Classes Attended</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPaymentSummaries.map((summary) => (
                    <tr key={summary.studentId} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">{summary.studentName}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{summary.place || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{summary.mobileNumber || '-'}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">
                        {formatCurrency(summary.totalPaymentDone)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{summary.totalClassAttended ?? 0}</td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewMoreClick(summary)}
                            className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200"
                          >
                            <HiEye className="mr-1 inline-block h-4 w-4" />
                            View More
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

        {!loading && (
          <Pagination
            currentPage={pagination.page || page}
            totalPages={pagination.pages || 1}
            totalItems={pagination.total || 0}
            pageSize={pagination.limit || limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        payment={null}
        isLoading={isModalLoading}
      />
    </div>
  );
}
