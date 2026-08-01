import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setTests,
  addTest,
  updateTestItem,
  filterTests,
  clearFilters,
  setLoading,
  setError,
} from './Test.slice';
import { getTests, createTest, updateTest } from '../../services/test.service';
import { toast } from 'react-toastify';
import TestModal from './TestModal';
import TestHistoryModal from './TestHistoryModal';
import { HiPlus, HiMagnifyingGlass, HiPencil, HiClock } from 'react-icons/hi2';
import Pagination from '../../componds/Pagination';
import { TEST_STATUS_OPTIONS, TEST_NAME_OPTIONS, VEHICLE_CLASS_OPTIONS } from '../../constants/constants';

const statusBadgeClass = (status) => {
  if (status === 'Passed') return 'bg-green-100 text-green-800';
  if (status === 'Failed') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

export default function Tests() {
  const dispatch = useAppDispatch();
  const { filteredTests, loading } = useAppSelector((state) => state.test);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [historyTest, setHistoryTest] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleClassFilter, setVehicleClassFilter] = useState('');
  const [testNameFilter, setTestNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchTests(page, limit);
  }, [page, limit]);

  const fetchTests = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getTests({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        dispatch(setTests(response.data.tests || []));
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
      toast.error(error?.response?.data?.message || 'Failed to fetch test records');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddClick = () => {
    setSelectedTest(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      if (selectedTest) {
        const response = await updateTest(selectedTest._id, formData);
        if (response?.data?.status) {
          dispatch(updateTestItem(response.data.data || { ...selectedTest, ...formData }));
          toast.success('Test updated successfully');
          handleModalClose();
        }
      } else {
        const response = await createTest(formData);
        if (response?.data?.status) {
          dispatch(addTest(response.data.data || formData));
          toast.success('Test scheduled successfully');
          handleModalClose();
          fetchTests(page, limit);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save test');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(
      filterTests({
        searchTerm,
        vehicleClass: vehicleClassFilter,
        testName: testNameFilter,
        status: statusFilter,
        date: dateFilter,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setVehicleClassFilter('');
    setTestNameFilter('');
    setStatusFilter('');
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
            Driving Test Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Mandatory tests are auto-created on registration — schedule extra tests, record results and reschedule here
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Schedule Test
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
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
            value={vehicleClassFilter}
            onChange={(e) => setVehicleClassFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Vehicle Classes</option>
            {VEHICLE_CLASS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={testNameFilter}
            onChange={(e) => setTestNameFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Tests</option>
            {TEST_NAME_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Statuses</option>
            {TEST_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />

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

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]" />
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No test records found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Card list - mobile & tablet */}
            <div className="divide-y divide-gray-200 lg:hidden">
              {filteredTests.map((test) => (
                <div key={test._id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {test.student?.name || test.studentName || '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {test.testName} &middot; {test.vehicleClass}
                      </p>
                    </div>
                    <span
                      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                        test.testStatus
                      )}`}
                    >
                      {test.testStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Test Date</p>
                      <p className="text-gray-700">
                        {test.testDate ? new Date(test.testDate).toLocaleDateString('en-IN') : '-'}
                      </p>
                    </div>
                    {test.nextTestDate && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Next Test Date</p>
                        <p className="text-gray-700">
                          {new Date(test.nextTestDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                  {test.remarks && (
                    <p className="line-clamp-1 text-xs text-gray-500">{test.remarks}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEditClick(test)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-100 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                    >
                      <HiPencil className="h-4 w-4" />
                      Update
                    </button>
                    <button
                      onClick={() => setHistoryTest(test)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      <HiClock className="h-4 w-4" />
                      History
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table - desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[960px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Student</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Vehicle Class</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Test Name</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Test Date</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Status</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Next Test Date</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Remarks</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTests.map((test) => (
                    <tr key={test._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">
                        {test.student?.name || test.studentName || '-'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{test.vehicleClass}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{test.testName}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        {test.testDate ? new Date(test.testDate).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                            test.testStatus
                          )}`}
                        >
                          {test.testStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        {test.nextTestDate ? new Date(test.nextTestDate).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        <span className="line-clamp-1">{test.remarks || '-'}</span>
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(test)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setHistoryTest(test)}
                            className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            <HiClock className="h-4 w-4" />
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

      {/* Update Modal */}
      <TestModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        test={selectedTest}
        isLoading={isModalLoading}
      />

      {/* History Modal */}
      <TestHistoryModal
        isOpen={!!historyTest}
        onClose={() => setHistoryTest(null)}
        test={historyTest}
      />
    </div>
  );
}
