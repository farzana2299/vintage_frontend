import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTests, setLoading, setError } from './Test.slice';
import { getTestsSummary } from '../../services/test.service';
import { toast } from 'react-toastify';
import { HiMagnifyingGlass, HiEye } from 'react-icons/hi2';
import Pagination from '../../componds/Pagination';
import { VEHICLE_CLASS_OPTIONS, CURRENT_STATUS_OPTIONS } from '../../constants/constants';

const statusBadgeClass = (status) =>
  status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

export default function Tests() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tests, loading } = useAppSelector((state) => state.test);

  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleClassFilter, setVehicleClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchTests(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Filtering/search are sent to the backend as query params on the summary endpoint.
  const fetchTests = async (
    currentPage = 1,
    currentLimit = 10,
    filters = { searchTerm, vehicleClassFilter, statusFilter, dateFilter }
  ) => {
    dispatch(setLoading(true));
    try {
      const params = { page: currentPage, limit: currentLimit };
      if (filters.searchTerm) params.search = filters.searchTerm;
      if (filters.vehicleClassFilter) params.vehicleClass = filters.vehicleClassFilter;
      if (filters.statusFilter) params.currentStatus = filters.statusFilter;
      if (filters.dateFilter) params.date = filters.dateFilter;

      const response = await getTestsSummary(params);
      if (response?.data?.status) {
        dispatch(setTests(response.data.summary || []));
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

  const handleViewMoreClick = (summary) => {
    if (!summary?.studentId) {
      toast.error('Student ID not available for this row');
      return;
    }
    navigate(`/tests/student/${summary.studentId}`);
  };

  const handleSearch = () => {
    setPage(1);
    fetchTests(1, limit, { searchTerm, vehicleClassFilter, statusFilter, dateFilter });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setVehicleClassFilter('');
    setStatusFilter('');
    setDateFilter('');
    setPage(1);
    fetchTests(1, limit, {
      searchTerm: '',
      vehicleClassFilter: '',
      statusFilter: '',
      dateFilter: '',
    });
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
            Mandatory tests are auto-created when a student's vehicle class is set — open a student to schedule, record results and reschedule
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Statuses</option>
            {CURRENT_STATUS_OPTIONS.map((option) => (
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
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No test records found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Card list - mobile & tablet */}
            <div className="divide-y divide-gray-200 lg:hidden">
              {tests.map((summary) => (
                <div key={summary.studentId} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-medium text-gray-900">{summary.studentName}</p>
                    <span
                      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                        summary.currentStatus
                      )}`}
                    >
                      {summary.currentStatus || 'In Progress'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Vehicle Class</p>
                      <p className="text-gray-700">{summary.vehicleClass || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Upcoming Test Date</p>
                      <p className="text-gray-700">
                        {summary.upcomingTestDate
                          ? new Date(summary.upcomingTestDate).toLocaleDateString('en-IN')
                          : '-'}
                      </p>
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
              <table className="w-full min-w-[820px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Student</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Vehicle Class</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Upcoming Test Date</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Current Status</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tests.map((summary) => (
                    <tr key={summary.studentId} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">{summary.studentName}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{summary.vehicleClass || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                        {summary.upcomingTestDate
                          ? new Date(summary.upcomingTestDate).toLocaleDateString('en-IN')
                          : '-'}
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                            summary.currentStatus
                          )}`}
                        >
                          {summary.currentStatus || 'In Progress'}
                        </span>
                      </td>
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
    </div>
  );
}
