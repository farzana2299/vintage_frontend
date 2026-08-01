import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  incomes: [],
  filteredIncomes: [],
  summary: { daily: 0, monthly: 0, yearly: 0 },
  loading: false,
  error: null,
};

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setIncomes: (state, action) => {
      state.incomes = action.payload;
      state.filteredIncomes = action.payload;
      state.error = null;
    },

    addIncome: (state, action) => {
      state.incomes.unshift(action.payload);
      state.filteredIncomes.unshift(action.payload);
    },

    updateIncomeItem: (state, action) => {
      const index = state.incomes.findIndex((i) => i._id === action.payload._id);
      if (index !== -1) {
        state.incomes[index] = action.payload;
        state.filteredIncomes = [...state.incomes];
      }
    },

    deleteIncomeItem: (state, action) => {
      state.incomes = state.incomes.filter((i) => i._id !== action.payload);
      state.filteredIncomes = [...state.incomes];
    },

    setSummary: (state, action) => {
      state.summary = { ...state.summary, ...action.payload };
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    filterIncomes: (state, action) => {
      const { searchTerm, incomeType, date, source } = action.payload;
      let filtered = state.incomes;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((i) =>
          (i.student?.name || i.studentName || '').toLowerCase().includes(term)
        );
      }

      if (incomeType) {
        filtered = filtered.filter((i) => i.incomeType === incomeType);
      }

      if (date) {
        filtered = filtered.filter((i) => {
          if (!i.incomeDate) return false;
          return new Date(i.incomeDate).toISOString().split('T')[0] === date;
        });
      }

      if (source) {
        filtered = filtered.filter((i) => i.source === source);
      }

      state.filteredIncomes = filtered;
    },

    clearFilters: (state) => {
      state.filteredIncomes = [...state.incomes];
    },
  },
});

export const {
  setIncomes,
  addIncome,
  updateIncomeItem,
  deleteIncomeItem,
  setSummary,
  setLoading,
  setError,
  filterIncomes,
  clearFilters,
} = incomeSlice.actions;

export default incomeSlice.reducer;
