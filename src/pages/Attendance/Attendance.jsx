import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setAttendances,
  addAttendance,
  updateAttendanceItem,
  deleteAttendanceItem,
  filterAttendances,
  clearFilters,
  setLoading,
  setError,
} from './Attendance.slice';
import {
  getAttendanceStudentsSummary,
  createAttendance,
  updateAttendance,
} from '../../services/attendance.service';
import { getActiveStudents } from '../../services/student.service';
import { toast } from 'react-toastify';
import AttendanceModal from './AttendanceModal';
import Pagination from '../../componds/Pagination';
import { HiPlus, HiMagnifyingGlass, HiEye } from 'react-icons/hi2';

export default function Attendance() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { filteredAttendances, attendances, loading } = useAppSelector((state) => state.attendance);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [activeStudents, setActiveStudents] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchAttendanceSummaries(page, limit);
  }, [page, limit]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchAttendanceSummaries = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getAttendanceStudentsSummary({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        dispatch(setAttendances(response.data.summary || []));
        setPagination(
          response.data.pagination || { total: 0, page: currentPage, limit: currentLimit, pages: 1 }
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch attendance student summary');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const studentsResponse = await getActiveStudents({ page: 1, limit: 1000 });

      setActiveStudents(studentsResponse?.data?.students || studentsResponse?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load active students');
    }
  };

  const handleAddClick = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  };

  const handleViewMoreClick = (summary) => {
    if (!summary?.studentId) {
      toast.error('Student ID not available for this row');
      return;
    }
    navigate(`/attendance/student/${summary.studentId}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      if (selectedAttendance) {
        const response = await updateAttendance(selectedAttendance._id, formData);
        if (response?.data?.status) {
          dispatch(updateAttendanceItem(response.data.data || formData));
          toast.success('Attendance updated successfully');
        }
      } else {
        const response = await createAttendance(formData);
        if (response?.data?.status) {
          dispatch(addAttendance(response.data.data || formData));
          toast.success('Attendance recorded successfully');
        }
      }
      handleModalClose();
      fetchAttendanceSummaries(page, limit);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(
      filterAttendances({
        searchTerm,
        studentId: studentFilter,
        classDate: dateFilter,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStudentFilter('');
    setDateFilter('');
    setPage(1);
    dispatch(clearFilters());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages || newPage === page) {
      return;
    }
    setPage(newPage);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">Attendance Management</h1>
          <p className="mt-1 text-sm text-gray-600">Track and manage student driving class attendance</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Record Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <HiMagnifyingGlass className="pointer-events-none absolute inset-y-0 left-3 flex h-full items-center text-gray-400" />
            <input
              type="text"
              placeholder="Search by student, class no, trainer..."
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
        ) : filteredAttendances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No attendance records found</p>
            <p className="text-sm">Try adjusting filters or record a new class attendance</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Student</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Place</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Phone Number</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Total Classes</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Last Class #</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendances.map((summary) => (
                  <tr key={summary.studentId} className="transition-colors hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">{summary.studentName}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{summary.studentPlace || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{summary.phoneNumber || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{summary.totalClassesTaken ?? 0}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{summary.lastClassNumber ?? '-'}</td>
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
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        attendance={selectedAttendance}
        existingAttendances={[]}
        isLoading={isModalLoading}
      />
    </div>
  );
}
