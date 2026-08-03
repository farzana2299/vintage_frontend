import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  paymentSummaries: [],
  filteredPaymentSummaries: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentSummaries: (state, action) => {
      state.paymentSummaries = action.payload;
      state.filteredPaymentSummaries = action.payload;
      state.error = null;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    filterPaymentSummaries: (state, action) => {
      const { searchTerm, studentId } = action.payload;
      let filtered = state.paymentSummaries;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.studentName?.toLowerCase().includes(term) ||
            p.place?.toLowerCase().includes(term) ||
            p.mobileNumber?.includes(term)
        );
      }

      if (studentId) {
        filtered = filtered.filter((p) => p.studentId === studentId);
      }

      state.filteredPaymentSummaries = filtered;
    },

    clearFilters: (state) => {
      state.filteredPaymentSummaries = [...state.paymentSummaries];
    },
  },
});

export const {
  setPaymentSummaries,
  setLoading,
  setError,
  filterPaymentSummaries,
  clearFilters,
} = paymentSlice.actions;

export default paymentSlice.reducer;
