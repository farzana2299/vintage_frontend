import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  attendances: [],
  filteredAttendances: [],
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendances: (state, action) => {
      state.attendances = action.payload;
      state.filteredAttendances = action.payload;
      state.error = null;
    },

    addAttendance: (state, action) => {
      state.attendances.unshift(action.payload);
      state.filteredAttendances.unshift(action.payload);
    },

    updateAttendanceItem: (state, action) => {
      const index = state.attendances.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) {
        state.attendances[index] = action.payload;
        state.filteredAttendances = [...state.attendances];
      }
    },

    deleteAttendanceItem: (state, action) => {
      state.attendances = state.attendances.filter((a) => a._id !== action.payload);
      state.filteredAttendances = [...state.attendances];
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    filterAttendances: (state, action) => {
      const { searchTerm, studentId } = action.payload;
      let filtered = state.attendances;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.studentName?.toLowerCase().includes(term) ||
            String(a.lastClassNumber ?? '').includes(term) ||
            a.phoneNumber?.includes(term)
        );
      }

      if (studentId) {
        filtered = filtered.filter((a) => a.studentId === studentId);
      }

      state.filteredAttendances = filtered;
    },

    clearFilters: (state) => {
      state.filteredAttendances = [...state.attendances];
    },
  },
});

export const {
  setAttendances,
  addAttendance,
  updateAttendanceItem,
  deleteAttendanceItem,
  setLoading,
  setError,
  filterAttendances,
  clearFilters,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
