import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setTrainers,
  addTrainer,
  updateTrainerItem,
  deleteTrainerItem,
  filterTrainers,
  clearFilters,
  setLoading,
  setError,
} from './Trainer.slice';
import {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from '../../services/trainer.service';
import { toast } from 'react-toastify';
import TrainerModal from './TrainerModal';
import { HiPlus, HiMagnifyingGlass, HiPencil, HiTrash } from 'react-icons/hi2';
import Pagination from '../../componds/Pagination';

export default function Trainers() {
  const dispatch = useAppDispatch();
  const { filteredTrainers, loading } = useAppSelector((state) => state.trainer);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchTrainers(page, limit);
  }, [page, limit]);

  const fetchTrainers = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getTrainers({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        dispatch(setTrainers(response.data.trainers || []));
        setPagination(
          response.data.pagination || { total: 0, page: currentPage, limit: currentLimit, pages: 1 }
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch trainers');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddClick = () => {
    setSelectedTrainer(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (trainer) => {
    setSelectedTrainer(trainer);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTrainer(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      if (selectedTrainer) {
        const response = await updateTrainer(selectedTrainer._id, formData);
        if (response?.data?.status) {
          dispatch(updateTrainerItem(response.data.data || formData));
          toast.success('Trainer updated successfully');
        }
      } else {
        const response = await createTrainer(formData);
        if (response?.data?.status) {
          dispatch(addTrainer(response.data.data || formData));
          toast.success('Trainer added successfully');
        }
      }
      handleModalClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save trainer');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteClick = (trainer) => setDeleteConfirm(trainer);

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const response = await deleteTrainer(deleteConfirm._id);
      if (response?.data?.status) {
        dispatch(deleteTrainerItem(deleteConfirm._id));
        toast.success('Trainer deleted successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete trainer');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(filterTrainers({ searchTerm, activeStatus: activeStatusFilter }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveStatusFilter('');
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
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">Trainer Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage trainer records</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Add Trainer
        </button>
      </div>

      {/* Search and Filter */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <HiMagnifyingGlass className="pointer-events-none absolute inset-y-0 left-3 flex h-full items-center text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            />
          </div>

          <select
            value={activeStatusFilter}
            onChange={(e) => setActiveStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]"></div>
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No trainers found</p>
            <p className="text-sm">Try adjusting your filters or add a new trainer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Name</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Phone</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Place</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Status</th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrainers.map((trainer) => (
                  <tr key={trainer._id} className="transition-colors hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-6">{trainer.trainerName}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{trainer.phoneNumber}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{trainer.place}</td>
                    <td className="px-3 py-2 text-sm sm:px-6">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          trainer.activeStatus === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {trainer.activeStatus || 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm sm:px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(trainer)}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(trainer)}
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

      {/* Add / Edit Modal */}
      <TrainerModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        trainer={selectedTrainer}
        isLoading={isModalLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">Delete Trainer</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete <strong>{deleteConfirm.trainerName}</strong>? This
                action cannot be undone.
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
