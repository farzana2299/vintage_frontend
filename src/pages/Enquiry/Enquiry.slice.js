import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  enquiries: [],
  filteredEnquiries: [],
  selectedEnquiry: null,
  loading: false,
  error: null,
};

const enquirySlice = createSlice({
  name: 'enquiry',
  initialState,
  reducers: {
    setEnquiries: (state, action) => {
      state.enquiries = action.payload;
      state.filteredEnquiries = action.payload;
      state.error = null;
    },

    addEnquiry: (state, action) => {
      state.enquiries.unshift(action.payload);
      state.filteredEnquiries.unshift(action.payload);
    },

    updateEnquiryItem: (state, action) => {
      const index = state.enquiries.findIndex((e) => e._id === action.payload._id);
      if (index !== -1) {
        state.enquiries[index] = action.payload;
        state.filteredEnquiries = state.enquiries;
      }
    },

    deleteEnquiryItem: (state, action) => {
      state.enquiries = state.enquiries.filter((e) => e._id !== action.payload);
      state.filteredEnquiries = state.enquiries;
    },

    setSelectedEnquiry: (state, action) => {
      state.selectedEnquiry = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    filterEnquiries: (state, action) => {
      const { searchTerm, enquiryType, startDate, endDate } = action.payload;
      let filtered = state.enquiries;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(term) ||
            e.phoneNumber.includes(term) ||
            e.place.toLowerCase().includes(term)
        );
      }

      if (enquiryType) {
        filtered = filtered.filter((e) => e.enquiryType === enquiryType);
      }

      if (startDate && endDate) {
        filtered = filtered.filter((e) => {
          const enquiryDate = new Date(e.enquiryDate);
          return enquiryDate >= new Date(startDate) && enquiryDate <= new Date(endDate);
        });
      }

      state.filteredEnquiries = filtered.sort(
        (a, b) => new Date(b.enquiryDate) - new Date(a.enquiryDate)
      );
    },

    clearFilters: (state) => {
      state.filteredEnquiries = state.enquiries.sort(
        (a, b) => new Date(b.enquiryDate) - new Date(a.enquiryDate)
      );
    },
  },
});

export const {
  setEnquiries,
  addEnquiry,
  updateEnquiryItem,
  deleteEnquiryItem,
  setSelectedEnquiry,
  setLoading,
  setError,
  filterEnquiries,
  clearFilters,
} = enquirySlice.actions;

export default enquirySlice.reducer;
