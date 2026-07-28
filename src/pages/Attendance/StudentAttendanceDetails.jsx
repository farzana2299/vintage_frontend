import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getAttendanceByStudentId,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../../services/attendance.service';
import AttendanceModal from './AttendanceModal';
import { HiArrowLeft, HiPlus, HiPencil, HiTrash } from 'react-icons/hi2';

export default function StudentAttendanceDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const totalClasses = attendanceDetails.reduce(
    (sum, item) => sum + Number(item.classNumber || 0),
    0
  );

  const loadStudentAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await getAttendanceByStudentId(studentId);
      if (response?.data?.status) {
        setStudentDetails(response.data.studentDetails || null);
        setAttendanceDetails(response.data.attendanceDetails || []);
      } else {
        toast.error(response?.data?.message || 'Failed to load student attendance history');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load student attendance history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadStudentAttendance();
    }
  }, [studentId]);

  const normalizeForModal = (item) => ({
    _id: item.attendanceId || item._id,
    studentId,
    classNumber: item.classNumber,
    classDate: item.classDate,
    trainerId: item.trainer?._id || item.trainerId || '',
    remarks: item.remarks || '',
  });

  const normalizedExistingAttendances = attendanceDetails.map((item) => ({
    _id: item.attendanceId || item._id,
    studentId,
    classNumber: item.classNumber,
  }));

  const handleAddClick = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedAttendance(normalizeForModal(item));
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      const payload = {
        ...formData,
        studentId,
      };

      if (selectedAttendance?._id) {
        const response = await updateAttendance(selectedAttendance._id, payload);
        if (response?.data?.status) {
          toast.success('Attendance updated successfully');
          handleModalClose();
          loadStudentAttendance();
        } else {
          toast.error(response?.data?.message || 'Failed to update attendance');
        }
      } else {
        const response = await createAttendance(payload);
        if (response?.data?.status) {
          toast.success('Attendance recorded successfully');
          handleModalClose();
          loadStudentAttendance();
        } else {
          toast.error(response?.data?.message || 'Failed to record attendance');
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      const attendanceId = deleteConfirm.attendanceId || deleteConfirm._id;
      const response = await deleteAttendance(attendanceId);
      if (response?.data?.status) {
        toast.success('Attendance deleted successfully');
        setDeleteConfirm(null);
        loadStudentAttendance();
      } else {
        toast.error(response?.data?.message || 'Failed to delete attendance');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete attendance');
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/attendance')}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-forest)] hover:opacity-80"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to Attendance List
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">Student Attendance History</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage attendance details for selected student</p>
        </div>

        <button
          onClick={handleAddClick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Record Attendance
        </button>
      </div>

      {studentDetails && (
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Student Name</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{studentDetails.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Phone Number</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{studentDetails.phoneNumber || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Place</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{studentDetails.place || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Total Classes</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{totalClasses}</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]" />
          </div>
        ) : attendanceDetails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No attendance records found</p>
            <p className="text-sm">Use Record Attendance to add classes for this student</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Sl No</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Class Date</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Class</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Trainer</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Remarks</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceDetails.map((item, index) => (
                  <tr key={item.attendanceId || item._id} className="transition-colors hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{index + 1}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                      {item.classDate ? new Date(item.classDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">{item.classNumber}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{item.trainer?.trainerName || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                      <span className="line-clamp-1">{item.remarks || '-'}</span>
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
        )}
      </div>

      <AttendanceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        attendance={selectedAttendance}
        existingAttendances={normalizedExistingAttendances}
        isLoading={isModalLoading}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Delete Attendance</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete class <strong>#{deleteConfirm.classNumber}</strong>?
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
