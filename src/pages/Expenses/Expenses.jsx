import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setExpenses,
  addExpense,
  updateExpenseItem,
  deleteExpenseItem,
  setSummary,
  filterExpenses,
  clearFilters,
  setLoading,
  setError,
} from './Expense.slice';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from '../../services/expense.service';
import { getActiveTrainers } from '../../services/trainer.service';
import { toast } from 'react-toastify';
import ExpenseModal from './ExpenseModal';
import { HiPlus, HiMagnifyingGlass, HiPencil, HiTrash } from 'react-icons/hi2';
import Pagination from '../../componds/Pagination';
import { EXPENSE_TYPES } from '../../constants/constants';

const formatCurrency = (amount) =>
  amount !== undefined && amount !== null ? `₹${Number(amount).toLocaleString('en-IN')}` : '₹0';

const SUMMARY_TILES = [
  { key: 'daily', label: "Today's Expense", color: 'bg-blue-50 border-blue-200' },
  { key: 'monthly', label: "This Month's Expense", color: 'bg-amber-50 border-amber-200' },
  { key: 'yearly', label: "This Year's Expense", color: 'bg-rose-50 border-rose-200' },
];

export default function Expenses() {
  const dispatch = useAppDispatch();
  const { filteredExpenses, summary, loading } = useAppSelector((state) => state.expense);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTrainers, setActiveTrainers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchExpenses(page, limit);
  }, [page, limit]);

  useEffect(() => {
    fetchSummary();
    fetchFilterOptions();
  }, []);

  const fetchExpenses = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getExpenses({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        dispatch(setExpenses(response.data.expenses || []));
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
      toast.error(error?.response?.data?.message || 'Failed to fetch expense records');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchSummary = async () => {
    try {
      const [daily, monthly, yearly] = await Promise.all([
        getExpenseSummary({ period: 'daily' }),
        getExpenseSummary({ period: 'monthly' }),
        getExpenseSummary({ period: 'yearly' }),
      ]);

      dispatch(
        setSummary({
          daily: daily?.data?.overallTotal ?? 0,
          monthly: monthly?.data?.overallTotal ?? 0,
          yearly: yearly?.data?.overallTotal ?? 0,
        })
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load expense summary');
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await getActiveTrainers({ page: 1, limit: 1000 });
      setActiveTrainers(response?.data?.trainers || response?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load staff list');
    }
  };

  const handleAddClick = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      if (selectedExpense) {
        const response = await updateExpense(selectedExpense._id, formData);
        if (response?.data?.status) {
          dispatch(updateExpenseItem(response.data.data || formData));
          toast.success('Expense updated successfully');
        }
      } else {
        const response = await createExpense(formData);
        if (response?.data?.status) {
          dispatch(addExpense(response.data.data || formData));
          toast.success('Expense added successfully');
        }
      }
      handleModalClose();
      fetchSummary();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save expense');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteClick = (expense) => setDeleteConfirm(expense);

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await deleteExpense(deleteConfirm._id);
      if (response?.data?.status) {
        dispatch(deleteExpenseItem(deleteConfirm._id));
        toast.success('Expense deleted successfully');
        fetchSummary();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete expense');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(
      filterExpenses({
        searchTerm,
        expenseType: expenseTypeFilter,
        date: dateFilter,
        staffId: staffFilter,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setExpenseTypeFilter('');
    setStaffFilter('');
    setDateFilter('');
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
            Expense Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">Track and manage business expenses</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Add Expense
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
              placeholder="Search by staff/student name or expense type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            />
          </div>

          <select
            value={expenseTypeFilter}
            onChange={(e) => setExpenseTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Types</option>
            {EXPENSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Staff</option>
            {activeTrainers.map((trainer) => (
              <option key={trainer._id} value={trainer._id}>
                {trainer.trainerName}
              </option>
            ))}
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
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No expense records found</p>
            <p className="text-sm">Try adjusting your filters or add a new expense</p>
          </div>
        ) : (
          <>
            {/* Card list - mobile & tablet */}
            <div className="divide-y divide-gray-200 lg:hidden">
              {filteredExpenses.map((expense) => (
                <div key={expense._id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{expense.expenseType}</p>
                      {(expense.staff?.trainerName ||
                        expense.staffName ||
                        expense.student?.name ||
                        expense.studentName) && (
                        <p className="text-xs text-gray-500">
                          {expense.staff?.trainerName ||
                            expense.staffName ||
                            expense.student?.name ||
                            expense.studentName}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm text-gray-600">
                      {expense.expenseDate
                        ? new Date(expense.expenseDate).toLocaleDateString('en-IN')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Amount</p>
                    <p className="font-medium text-gray-700">{formatCurrency(expense.amount)}</p>
                  </div>
                  {expense.remarks && (
                    <p className="line-clamp-1 text-xs text-gray-500">{expense.remarks}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEditClick(expense)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-100 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                    >
                      <HiPencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(expense)}
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
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Date</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Type</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Staff / Student</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Amount</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Remarks</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        {expense.expenseDate
                          ? new Date(expense.expenseDate).toLocaleDateString('en-IN')
                          : '-'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{expense.expenseType}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">
                        {expense.staff?.trainerName ||
                          expense.staffName ||
                          expense.student?.name ||
                          expense.studentName ||
                          '-'}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        <span className="line-clamp-1">{expense.remarks || '-'}</span>
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(expense)}
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
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        expense={selectedExpense}
        isLoading={isModalLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Delete Expense</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete this <strong>{deleteConfirm.expenseType}</strong>{' '}
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
