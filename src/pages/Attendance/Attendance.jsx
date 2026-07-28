import { useEffect, useState } from 'react';
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
  getAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../../services/attendance.service';
import { getActiveStudents } from '../../services/student.service';
import { getActiveTrainers } from '../../services/trainer.service';
import { toast } from 'react-toastify';
import AttendanceModal from './AttendanceModal';
import Pagination from '../../componds/Pagination';
import { HiPlus, HiMagnifyingGlass, HiPencil, HiTrash } from 'react-icons/hi2';

export default function Attendance() {
  const dispatch = useAppDispatch();
  const { filteredAttendances, loading } = useAppSelector((state) => state.attendance);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeStudents, setActiveStudents] = useState([]);
  const [activeTrainers, setActiveTrainers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchAttendances(page, limit);
  }, [page, limit]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const normalizeAttendance = (attendance) => {
    const student = attendance.studentId || attendance.student || {};
    const trainer = attendance.trainerId || attendance.trainer || {};

    return {
      ...attendance,
      studentId: student,
      trainerId: trainer,
      studentName: attendance.studentName || student.name || 'Unknown Student',
      trainerName: attendance.trainerName || trainer.trainerName || 'Unknown Trainer',
    };
  };

  const fetchAttendances = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getAttendances({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        const attendances = (response.data.attendances || response.data.data || []).map(
          normalizeAttendance
        );
        dispatch(setAttendances(attendances));
        setPagination(
          response.data.pagination || { total: 0, page: currentPage, limit: currentLimit, pages: 1 }
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch attendance records');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [studentsResponse, trainersResponse] = await Promise.all([
        getActiveStudents({ page: 1, limit: 1000 }),
        getActiveTrainers({ page: 1, limit: 1000 }),
      ]);

      setActiveStudents(studentsResponse?.data?.students || studentsResponse?.data?.data || []);
      setActiveTrainers(trainersResponse?.data?.trainers || trainersResponse?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load active students and trainers');
    }
  };

  const handleAddClick = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (attendance) => {
    setSelectedAttendance(attendance);
    setIsModalOpen(true);
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
          dispatch(updateAttendanceItem(normalizeAttendance(response.data.data || formData)));
          toast.success('Attendance updated successfully');
        }
      } else {
        const response = await createAttendance(formData);
        if (response?.data?.status) {
          dispatch(addAttendance(normalizeAttendance(response.data.data || formData)));
          toast.success('Attendance recorded successfully');
        }
      }
      handleModalClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteClick = (attendance) => {
    setDeleteConfirm(attendance);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await deleteAttendance(deleteConfirm._id);
      if (response?.data?.status) {
        dispatch(deleteAttendanceItem(deleteConfirm._id));
        toast.success('Attendance deleted successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete attendance');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(
      filterAttendances({
        searchTerm,
        studentId: studentFilter,
        trainerId: trainerFilter,
        classDate: dateFilter,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStudentFilter('');
    setTrainerFilter('');
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
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-forest-deep)]">Attendance Management</h1>
          <p className="mt-1 text-sm text-gray-600">Track and manage student driving class attendance</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90"
        >
          <HiPlus className="h-5 w-5" />
          Record Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

          <select
            value={trainerFilter}
            onChange={(e) => setTrainerFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Trainers</option>
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

          <button
            onClick={handleSearch}
            className="rounded-lg bg-[var(--color-forest)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-forest-deep)]"
          >
            Search
          </button>
        </div>

        <button
          onClick={handleClearFilters}
          className="mt-3 text-sm text-[var(--color-gold)] transition-colors hover:opacity-80"
        >
          Clear all filters
        </button>
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
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trainer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Remarks</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendances.map((attendance) => (
                  <tr key={attendance._id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-2 text-sm font-medium text-gray-900">{attendance.studentName}</td>
                    <td className="px-6 py-2 text-sm text-gray-600">{attendance.classNumber}</td>
                    <td className="px-6 py-2 text-sm text-gray-600">
                      {attendance.classDate
                        ? new Date(attendance.classDate).toLocaleDateString('en-IN')
                        : '-'}
                    </td>
                    <td className="px-6 py-2 text-sm text-gray-600">{attendance.trainerName}</td>
                    <td className="px-6 py-2 text-sm text-gray-600">
                      <span className="line-clamp-1">{attendance.remarks || '-'}</span>
                    </td>
                    <td className="px-6 py-2 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(attendance)}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(attendance)}
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
        existingAttendances={filteredAttendances}
        isLoading={isModalLoading}
      />

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Delete Attendance</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete class <strong>#{deleteConfirm.classNumber}</strong> for{' '}
                <strong>{deleteConfirm.studentName}</strong>?
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
