import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setEnquiries,
  addEnquiry,
  updateEnquiryItem,
  deleteEnquiryItem,
  filterEnquiries,
  clearFilters,
  setLoading,
  setError,
} from './Enquiry.slice';
import {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
} from '../../services/enquiry.service';
import { toast } from 'react-toastify';
import EnquiryModal from './EnquiryModal';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiPencil,
  HiTrash,
  HiFunnel,
} from 'react-icons/hi2';
import Pagination from '../../componds/Pagination';

export default function Enquiry() {
  const dispatch = useAppDispatch();
  const { filteredEnquiries, loading } = useAppSelector((state) => state.enquiry);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  // Load enquiries on mount
  useEffect(() => {
    fetchEnquiries(page, limit);
  }, [page, limit]);

  const fetchEnquiries = async (currentPage = 1, currentLimit = 10) => {
    dispatch(setLoading(true));
    try {
      const response = await getEnquiries({ page: currentPage, limit: currentLimit });
      if (response?.data?.status) {
        dispatch(setEnquiries(response.data.enquiries || []));
        setPagination(
          response.data.pagination || {
            total: 0,
            page: currentPage,
            limit: currentLimit,
            pages: 1,
          }
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch enquiries');
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddClick = () => {
    setSelectedEnquiry(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEnquiry(null);
  };

  const handleModalSubmit = async (formData) => {
    setIsModalLoading(true);
    try {
      if (selectedEnquiry) {
        // Update
        const response = await updateEnquiry(selectedEnquiry._id, formData);
        if (response?.data?.status) {
          dispatch(updateEnquiryItem(response.data.data || formData));
          toast.success('Enquiry updated successfully');
        }
      } else {
        // Create
        const response = await createEnquiry(formData);
        if (response?.data?.status) {
          dispatch(addEnquiry(response.data.data || formData));
          toast.success('Enquiry added successfully');
        }
      }
      handleModalClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save enquiry');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteClick = (enquiry) => {
    setDeleteConfirm(enquiry);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await deleteEnquiry(deleteConfirm._id);
      if (response?.data?.status) {
        dispatch(deleteEnquiryItem(deleteConfirm._id));
        toast.success('Enquiry deleted successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete enquiry');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    dispatch(
      filterEnquiries({
        searchTerm,
        enquiryType: enquiryTypeFilter,
        startDate,
        endDate,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setEnquiryTypeFilter('');
    setStartDate('');
    setEndDate('');
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
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">
            Enquiry Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">Manage customer enquiries</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:bg-[var(--color-gold-dark)] sm:w-auto"
        >
          <HiPlus className="h-5 w-5" />
          Add Enquiry
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4 rounded-lg bg-white p-4 shadow">
        {/* <div className="flex items-center gap-2">
          <HiFunnel className="h-5 w-5 text-[var(--color-forest)]" />
          <h3 className="font-semibold text-[var(--color-forest-deep)]">Filters</h3>
        </div> */}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
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

          {/* Enquiry Type Filter */}
          <select
            value={enquiryTypeFilter}
            onChange={(e) => setEnquiryTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          >
            <option value="">All Types</option>
            <option value="Licence">Licence</option>
            <option value="Practice">Practice</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full rounded-lg bg-[var(--color-forest)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-forest-deep)]"
          >
            Search
          </button>
        </div>

        {/* Clear Filters */}
        {/* <button
          onClick={handleClearFilters}
          className="text-sm text-[var(--color-gold)] hover:text-[var(--color-gold-dark)]"
        >
          Clear all filters
        </button> */}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]"></div>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No enquiries found</p>
            <p className="text-sm">Try adjusting your filters or add a new enquiry</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">
                    Phone
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">
                    Place
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">
                    Type
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="transition-colors hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900 sm:px-6">
                      <p className="font-medium">{enquiry.name}</p>
                      {enquiry.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {enquiry.description}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{enquiry.phoneNumber}</td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">{enquiry.place}</td>
                    <td className="px-3 py-2 text-sm sm:px-6">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          enquiry.enquiryType === 'Licence'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {enquiry.enquiryType}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600 sm:px-6">
                      {new Date(enquiry.enquiryDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-sm sm:px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(enquiry)}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(enquiry)}
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
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        enquiry={selectedEnquiry}
        isLoading={isModalLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--color-forest-deep)]">
                Delete Enquiry
              </h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete the enquiry for <strong>{deleteConfirm.name}</strong>?
                This action cannot be undone.
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
