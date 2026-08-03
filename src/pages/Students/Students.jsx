import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setStudents,
  addStudent,
  updateStudentItem,
  deleteStudentItem,
  filterStudents,
  clearFilters,
  setLoading,
  setError,
} from './Student.slice';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../services/student.service';
import { toast } from 'react-toastify';
import DrivingLicenceModal from './DrivingLicenceModal';
import PracticeModal from './PracticeModal';
import Pagination from '../../componds/Pagination';
import { HiPlus, HiMagnifyingGlass, HiPencil, HiTrash, HiEye } from 'react-icons/hi2';
import { CURRENT_STATUS_OPTIONS } from '../../constants/constants';

export default function Students() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { filteredStudents, loading } = useAppSelector((state) => state.student);

  // Modal state
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [dlModalOpen, setDlModalOpen] = useState(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [studentTypeFilter, setStudentTypeFilter] = useState(searchParams.get('studentType') || '');
  const [currentStatusFilter, setCurrentStatusFilter] = useState('');
  const [licenceExpiryFromFilter, setLicenceExpiryFromFilter] = useState(
    searchParams.get('licenceExpiryFrom') || ''
  );
  const [licenceExpiryToFilter, setLicenceExpiryToFilter] = useState(
    searchParams.get('licenceExpiryTo') || ''
  );
  const [roadSafetyFilter, setRoadSafetyFilter] = useState(searchParams.get('roadSafetyStatus') || '');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchStudents(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const getStudentPhotoUrl = (student) => {
    const rawPhoto =
      student?.photoUrl ||
      student?.photo ||
      student?.profilePhoto ||
      student?.image ||
      student?.studentPhoto;

    if (!rawPhoto || typeof rawPhoto !== 'string') {
      return '';
    }

    if (
      rawPhoto.startsWith('http://') ||
      rawPhoto.startsWith('https://') ||
      rawPhoto.startsWith('data:')
    ) {
      return rawPhoto;
    }

    const baseUrl = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
    const normalizedPath = rawPhoto.startsWith('/') ? rawPhoto : `/${rawPhoto}`;

    return baseUrl ? `${baseUrl}${normalizedPath}` : rawPhoto;
  };

  const fetchStudents = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getStudents({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        dispatch(setStudents(response.data.students || []));
        setPagination(
          response.data.pagination || { total: 0, page: currentPage, limit: currentLimit, pages: 1 }
        );
        // Deep-linked from Dashboard (e.g. "Learner's Licence Expiring", "Road Safety Pending") — apply it once data is in.
        if (licenceExpiryFromFilter || licenceExpiryToFilter || roadSafetyFilter || studentTypeFilter) {
          dispatch(
            filterStudents({
              searchTerm,
              studentType: studentTypeFilter,
              currentStatus: currentStatusFilter,
              licenceExpiryFrom: licenceExpiryFromFilter,
              licenceExpiryTo: licenceExpiryToFilter,
              roadSafetyStatus: roadSafetyFilter,
            })
          );
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch students');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Open type picker for new student
  const handleAddClick = () => setTypePickerOpen(true);

  // After type is selected from picker
  const handleTypeSelect = (type) => {
    setTypePickerOpen(false);
    setSelectedStudent(null);
    if (type === 'Driving Licence') setDlModalOpen(true);
    else setPracticeModalOpen(true);
  };

  // Open correct edit modal based on student type
  const handleEditClick = (student) => {
    setSelectedStudent(student);
    if (student.studentType === 'Driving Licence') setDlModalOpen(true);
    else setPracticeModalOpen(true);
  };

  const closeAllModals = () => {
    setDlModalOpen(false);
    setPracticeModalOpen(false);
    setSelectedStudent(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      if (selectedStudent) {
        const response = await updateStudent(selectedStudent._id, formData);
        if (response?.data?.status) {
          dispatch(updateStudentItem(response.data.data || formData));
          toast.success('Student updated successfully');
        }
      } else {
        const response = await createStudent(formData);
        if (response?.data?.status) {
          dispatch(addStudent(response.data.data || formData));
          toast.success('Student registered successfully');
        }
      }
      closeAllModals();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save student');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteClick = (student) => setDeleteConfirm(student);

  const handleViewClick = async (studentId) => {
    setIsViewLoading(true);
    try {
      const response = await getStudentById(studentId);
      if (response?.data?.status) {
        setViewStudent(response.data.student || response.data.data || null);
        return;
      }

      toast.error(response?.data?.message || 'Failed to fetch student details');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch student details');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const response = await deleteStudent(deleteConfirm._id);
      if (response?.data?.status) {
        dispatch(deleteStudentItem(deleteConfirm._id));
        toast.success('Student deleted successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(
      filterStudents({
        searchTerm,
        studentType: studentTypeFilter,
        currentStatus: currentStatusFilter,
        licenceExpiryFrom: licenceExpiryFromFilter,
        licenceExpiryTo: licenceExpiryToFilter,
        roadSafetyStatus: roadSafetyFilter,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStudentTypeFilter('');
    setCurrentStatusFilter('');
    setLicenceExpiryFromFilter('');
    setLicenceExpiryToFilter('');
    setRoadSafetyFilter('');
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
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">Student Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage registered students</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <HiMagnifyingGlass className="pointer-events-none absolute inset-y-0 left-3 flex h-full items-center text-gray-400" />
            <input
              type="text"
              placeholder="Search name, mobile, application no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            />
          </div>

          <select
            value={studentTypeFilter}
            onChange={(e) => setStudentTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Types</option>
            <option value="Driving Licence">Driving Licence</option>
            <option value="Practice">Practice</option>
          </select>

          <select
            value={currentStatusFilter}
            onChange={(e) => setCurrentStatusFilter(e.target.value)}
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
            value={licenceExpiryFromFilter}
            onChange={(e) => setLicenceExpiryFromFilter(e.target.value)}
            max={licenceExpiryToFilter || undefined}
            title="Learner's licence expiry from"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />

          <input
            type="date"
            value={licenceExpiryToFilter}
            onChange={(e) => setLicenceExpiryToFilter(e.target.value)}
            min={licenceExpiryFromFilter || undefined}
            title="Learner's licence expiry to"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />

          <select
            value={roadSafetyFilter}
            onChange={(e) => setRoadSafetyFilter(e.target.value)}
            title="Road safety class status"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Road Safety</option>
            <option value="No">Pending</option>
            <option value="Yes">Completed</option>
          </select>

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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No students found</p>
            <p className="text-sm">Try adjusting your filters or register a new student</p>
          </div>
        ) : (
          <>
            {/* Card list - mobile & tablet */}
            <div className="divide-y divide-gray-200 lg:hidden">
              {filteredStudents.map((student) => (
                <div key={student._id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {student.photoUrl ? (
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{student.name}</p>
                        {student.applicationNumber && (
                          <p className="truncate text-xs text-gray-500">App: {student.applicationNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        student.studentType === 'Driving Licence'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {student.studentType}
                    </span>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        student.currentStatus === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {student.currentStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Mobile</p>
                      <p className="text-gray-700">{student.mobileNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Place</p>
                      <p className="text-gray-700">{student.place || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleViewClick(student._id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-100 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200"
                    >
                      <HiEye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditClick(student)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-100 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                    >
                      <HiPencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(student)}
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
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Name</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Mobile</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Place</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Type</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Status</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <div className="flex items-center gap-3">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                              {student.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            {student.applicationNumber && (
                              <p className="text-xs text-gray-500">App: {student.applicationNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{student.mobileNumber}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{student.place}</td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            student.studentType === 'Driving Licence'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {student.studentType}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            student.currentStatus === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {student.currentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm sm:px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewClick(student._id)}
                            className="rounded-lg bg-emerald-100 p-2 text-emerald-700 transition-colors hover:bg-emerald-200"
                          >
                            <HiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(student)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
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

      {/* Student Type Picker Modal */}
      {typePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Select Student Type</h3>
              <p className="mt-1 text-sm text-gray-500">Choose the type to continue registration</p>
            </div>
            <div className="flex flex-col gap-3 p-6">
              <button
                onClick={() => handleTypeSelect('Driving Licence')}
                className="rounded-xl border-2 border-[var(--color-forest)] px-6 py-4 text-left transition-colors hover:bg-[var(--color-forest)] hover:text-white"
              >
                <p className="font-semibold">Driving Licence</p>
                <p className="mt-0.5 text-sm opacity-70">Full licence training programme</p>
              </button>
              <button
                onClick={() => handleTypeSelect('Practice')}
                className="rounded-xl border-2 border-[var(--color-gold)] px-6 py-4 text-left transition-colors hover:bg-[var(--color-gold)]"
              >
                <p className="font-semibold">Practice</p>
                <p className="mt-0.5 text-sm opacity-70">Practice sessions for existing licence holders</p>
              </button>
            </div>
            <div className="border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setTypePickerOpen(false)}
                className="w-full rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DL Modal */}
      <DrivingLicenceModal
        isOpen={dlModalOpen}
        onClose={closeAllModals}
        onSubmit={handleModalSubmit}
        student={selectedStudent}
        isLoading={isModalLoading}
      />

      {/* Practice Modal */}
      <PracticeModal
        isOpen={practiceModalOpen}
        onClose={closeAllModals}
        onSubmit={handleModalSubmit}
        student={selectedStudent}
        isLoading={isModalLoading}
      />

      {/* View Student Modal */}
      {(isViewLoading || viewStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Student Details</h3>
                <p className="mt-1 text-sm text-gray-500">Detailed student information</p>
              </div>
              <button
                onClick={() => {
                  setViewStudent(null);
                  setIsViewLoading(false);
                }}
                className="rounded-lg px-3 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-5 sm:px-6">
              {isViewLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    {getStudentPhotoUrl(viewStudent) ? (
                      <img
                        src={getStudentPhotoUrl(viewStudent)}
                        alt={viewStudent.name}
                        className="h-20 w-20 rounded-2xl object-cover shadow"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-200 text-2xl font-bold text-gray-600 shadow">
                        {viewStudent?.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                    )}

                    <div>
                      <h4 className="text-2xl font-bold text-[var(--color-forest-deep)]">{viewStudent?.name}</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {viewStudent?.studentType || '-'}
                        </span>
                        <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                          {viewStudent?.currentStatus || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Mobile Number</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{viewStudent?.mobileNumber || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Gender</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{viewStudent?.gender || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Place</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{viewStudent?.place || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Date of Birth</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {viewStudent?.dateOfBirth
                          ? new Date(viewStudent.dateOfBirth).toLocaleDateString('en-IN')
                          : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Application Number</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{viewStudent?.applicationNumber || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Driving Licence Number</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{viewStudent?.drivingLicenceNumber || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Learner's Licence Expiry</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {viewStudent?.learnersLicenceExpiryDate
                          ? new Date(viewStudent.learnersLicenceExpiryDate).toLocaleDateString('en-IN')
                          : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Class / Vehicle</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {viewStudent?.classOfVehicle || viewStudent?.practiceVehicleType || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Registration Payment</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {viewStudent?.registrationPayment !== undefined && viewStudent?.registrationPayment !== null
                          ? `Rs. ${viewStudent.registrationPayment}`
                          : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Amount Per Class</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {viewStudent?.amountPerClass !== undefined && viewStudent?.amountPerClass !== null
                          ? `Rs. ${viewStudent.amountPerClass}`
                          : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Road Safety Class Attended</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{viewStudent?.roadSafetyClassAttended || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Address</p>
                      <p className="mt-1 text-sm font-medium text-gray-900 whitespace-pre-wrap">{viewStudent?.address || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Delete Student</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action
                cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-red-600 py-2 font-medium text-white hover:bg-red-700"
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
