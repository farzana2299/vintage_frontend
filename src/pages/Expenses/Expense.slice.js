import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  expenses: [],
  filteredExpenses: [],
  summary: { daily: 0, monthly: 0, yearly: 0 },
  loading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setExpenses: (state, action) => {
      state.expenses = action.payload;
      state.filteredExpenses = action.payload;
      state.error = null;
    },

    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
      state.filteredExpenses.unshift(action.payload);
    },

    updateExpenseItem: (state, action) => {
      const index = state.expenses.findIndex((e) => e._id === action.payload._id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
        state.filteredExpenses = [...state.expenses];
      }
    },

    deleteExpenseItem: (state, action) => {
      state.expenses = state.expenses.filter((e) => e._id !== action.payload);
      state.filteredExpenses = [...state.expenses];
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

    filterExpenses: (state, action) => {
      const { searchTerm, expenseType, date, staffId } = action.payload;
      let filtered = state.expenses;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            (e.staff?.trainerName || e.staffName || '').toLowerCase().includes(term) ||
            (e.student?.name || e.studentName || '').toLowerCase().includes(term) ||
            e.expenseType?.toLowerCase().includes(term)
        );
      }

      if (expenseType) {
        filtered = filtered.filter((e) => e.expenseType === expenseType);
      }

      if (date) {
        filtered = filtered.filter((e) => {
          if (!e.expenseDate) return false;
          return new Date(e.expenseDate).toISOString().split('T')[0] === date;
        });
      }

      if (staffId) {
        filtered = filtered.filter((e) => (e.staff?._id || e.staffId) === staffId);
      }

      state.filteredExpenses = filtered;
    },

    clearFilters: (state) => {
      state.filteredExpenses = [...state.expenses];
    },
  },
});

export const {
  setExpenses,
  addExpense,
  updateExpenseItem,
  deleteExpenseItem,
  setSummary,
  setLoading,
  setError,
  filterExpenses,
  clearFilters,
} = expenseSlice.actions;

export default expenseSlice.reducer;
