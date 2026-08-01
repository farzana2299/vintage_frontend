import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setIncomes,
  addIncome,
  updateIncomeItem,
  deleteIncomeItem,
  setSummary,
  filterIncomes,
  clearFilters,
  setLoading,
  setError,
} from './Income.slice';
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
} from '../../services/income.service';
import { toast } from 'react-toastify';
import IncomeModal from './IncomeModal';
import { HiPlus, HiMagnifyingGlass, HiPencil, HiTrash } from 'react-icons/hi2';
import Pagination from '../../componds/Pagination';
import { INCOME_TYPES } from '../../constants/constants';

const formatCurrency = (amount) =>
  amount !== undefined && amount !== null ? `₹${Number(amount).toLocaleString('en-IN')}` : '₹0';

const SUMMARY_TILES = [
  { key: 'daily', label: "Today's Income", color: 'bg-blue-50 border-blue-200' },
  { key: 'monthly', label: "This Month's Income", color: 'bg-amber-50 border-amber-200' },
  { key: 'yearly', label: "This Year's Income", color: 'bg-emerald-50 border-emerald-200' },
];

export default function Income() {
  const dispatch = useAppDispatch();
  const { filteredIncomes, summary, loading } = useAppSelector((state) => state.income);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [incomeTypeFilter, setIncomeTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchIncomes(page, limit);
  }, [page, limit]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchIncomes = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getIncomes({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        dispatch(setIncomes(response.data.incomes || []));
        const responsePagination = response.data.pagination;
        setPagination(
          responsePagination
            ? {
                total: responsePagination.total ?? 0,
                page: responsePagination.page ?? currentPage,
                limit: responsePagination.limit ?? currentLimit,
                pages: responsePagination.totalPages ?? responsePagination.pages ?? 1,
              }
            : { total: 0, page: currentPage, limit: currentLimit, pages: 1 }
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch income records');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchSummary = async () => {
    try {
      const [daily, monthly, yearly] = await Promise.all([
        getIncomeSummary({ period: 'daily' }),
        getIncomeSummary({ period: 'monthly' }),
        getIncomeSummary({ period: 'yearly' }),
      ]);

      dispatch(
        setSummary({
          daily: daily?.data?.overallTotal ?? 0,
          monthly: monthly?.data?.overallTotal ?? 0,
          yearly: yearly?.data?.overallTotal ?? 0,
        })
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load income summary');
    }
  };

  const handleAddClick = () => {
    setSelectedIncome(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (income) => {
    setSelectedIncome(income);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedIncome(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      if (selectedIncome) {
        const response = await updateIncome(selectedIncome._id, formData);
        if (response?.data?.status) {
          dispatch(updateIncomeItem(response.data.data || formData));
          toast.success('Income updated successfully');
        }
      } else {
        const response = await createIncome(formData);
        if (response?.data?.status) {
          dispatch(addIncome(response.data.data || formData));
          toast.success('Income added successfully');
        }
      }
      handleModalClose();
      fetchSummary();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save income');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteClick = (income) => setDeleteConfirm(income);

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await deleteIncome(deleteConfirm._id);
      if (response?.data?.status) {
        dispatch(deleteIncomeItem(deleteConfirm._id));
        toast.success('Income deleted successfully');
        fetchSummary();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete income');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(
      filterIncomes({
        searchTerm,
        incomeType: incomeTypeFilter,
        date: dateFilter,
        source: sourceFilter,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setIncomeTypeFilter('');
    setDateFilter('');
    setSourceFilter('');
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
            Income Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Automatic income from student payments plus manually recorded income
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Add Income
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUMMARY_TILES.map((tile) => (
          <div key={tile.key} className={`rounded-2xl border p-4 shadow-sm ${tile.color}`}>
            <p className="mb-1 text-sm font-medium text-[rgba(18,33,28,0.6)]">{tile.label}</p>
            <p className="text-2xl font-bold text-[var(--color-forest-deep)]">
              {formatCurrency(summary[tile.key])}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <HiMagnifyingGlass className="pointer-events-none absolute inset-y-0 left-3 flex h-full items-center text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            />
          </div>

          <select
            value={incomeTypeFilter}
            onChange={(e) => setIncomeTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Types</option>
            {INCOME_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Sources</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />

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
        ) : filteredIncomes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No income records found</p>
            <p className="text-sm">Try adjusting your filters or add a manual income entry</p>
          </div>
        ) : (
          <>
            {/* Card list - mobile & tablet */}
            <div className="divide-y divide-gray-200 lg:hidden">
              {filteredIncomes.map((income) => (
                <div key={income._id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {income.student?.name || income.studentName || '-'}
                      </p>
                      <p className="text-xs text-gray-500">{income.incomeType}</p>
                    </div>
                    <span
                      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        income.source === 'Automatic'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {income.source}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Amount</p>
                      <p className="font-medium text-gray-700">{formatCurrency(income.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Date</p>
                      <p className="text-gray-700">
                        {income.incomeDate
                          ? new Date(income.incomeDate).toLocaleDateString('en-IN')
                          : '-'}
                      </p>
                    </div>
                  </div>
                  {income.remarks && (
                    <p className="line-clamp-1 text-xs text-gray-500">{income.remarks}</p>
                  )}
                  {income.source === 'Manual' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleEditClick(income)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-100 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                      >
                        <HiPencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(income)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-100 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200"
                      >
                        <HiTrash className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Table - desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Date</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Type</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Student</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Amount</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Source</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Remarks</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIncomes.map((income) => (
                    <tr key={income._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        {income.incomeDate
                          ? new Date(income.incomeDate).toLocaleDateString('en-IN')
                          : '-'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{income.incomeType}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">
                        {income.student?.name || income.studentName || '-'}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">
                        {formatCurrency(income.amount)}
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            income.source === 'Automatic'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {income.source}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        <span className="line-clamp-1">{income.remarks || '-'}</span>
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        {income.source === 'Manual' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(income)}
                              className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                            >
                              <HiPencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(income)}
                              className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
                            >
                              <HiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">System generated</span>
                        )}
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
      <IncomeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        income={selectedIncome}
        isLoading={isModalLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Delete Income</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete this <strong>{deleteConfirm.incomeType}</strong>{' '}
                entry of <strong>{formatCurrency(deleteConfirm.amount)}</strong>? This action
                cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
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
