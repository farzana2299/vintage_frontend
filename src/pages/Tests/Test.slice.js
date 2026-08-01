import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tests: [],
  filteredTests: [],
  loading: false,
  error: null,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setTests: (state, action) => {
      state.tests = action.payload;
      state.filteredTests = action.payload;
      state.error = null;
    },

    addTest: (state, action) => {
      state.tests.unshift(action.payload);
      state.filteredTests.unshift(action.payload);
    },

    updateTestItem: (state, action) => {
      const index = state.tests.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tests[index] = action.payload;
        state.filteredTests = [...state.tests];
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    filterTests: (state, action) => {
      const { searchTerm, vehicleClass, testName, status, date } = action.payload;
      let filtered = state.tests;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((t) =>
          (t.student?.name || t.studentName || '').toLowerCase().includes(term)
        );
      }

      if (vehicleClass) {
        filtered = filtered.filter((t) => t.vehicleClass === vehicleClass);
      }

      if (testName) {
        filtered = filtered.filter((t) => t.testName === testName);
      }

      if (status) {
        filtered = filtered.filter((t) => t.testStatus === status);
      }

      if (date) {
        filtered = filtered.filter((t) => {
          if (!t.testDate) return false;
          return new Date(t.testDate).toISOString().split('T')[0] === date;
        });
      }

      state.filteredTests = filtered;
    },

    clearFilters: (state) => {
      state.filteredTests = [...state.tests];
    },
  },
});

export const {
  setTests,
  addTest,
  updateTestItem,
  setLoading,
  setError,
  filterTests,
  clearFilters,
} = testSlice.actions;

export default testSlice.reducer;
