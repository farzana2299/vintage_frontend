import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  students: [],
  filteredStudents: [],
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudents: (state, action) => {
      state.students = action.payload;
      state.filteredStudents = action.payload;
      state.error = null;
    },

    addStudent: (state, action) => {
      state.students.unshift(action.payload);
      state.filteredStudents.unshift(action.payload);
    },

    updateStudentItem: (state, action) => {
      const index = state.students.findIndex((s) => s._id === action.payload._id);
      if (index !== -1) {
        state.students[index] = action.payload;
        state.filteredStudents = [...state.students];
      }
    },

    deleteStudentItem: (state, action) => {
      state.students = state.students.filter((s) => s._id !== action.payload);
      state.filteredStudents = [...state.students];
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    filterStudents: (state, action) => {
      const { searchTerm, studentType, currentStatus } = action.payload;
      let filtered = state.students;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name?.toLowerCase().includes(term) ||
            s.mobileNumber?.includes(term) ||
            s.applicationNumber?.toLowerCase().includes(term) ||
            s.drivingLicenceNumber?.toLowerCase().includes(term)
        );
      }

      if (studentType) {
        filtered = filtered.filter((s) => s.studentType === studentType);
      }

      if (currentStatus) {
        filtered = filtered.filter((s) => s.currentStatus === currentStatus);
      }

      state.filteredStudents = filtered;
    },

    clearFilters: (state) => {
      state.filteredStudents = [...state.students];
    },
  },
});

export const {
  setStudents,
  addStudent,
  updateStudentItem,
  deleteStudentItem,
  setLoading,
  setError,
  filterStudents,
  clearFilters,
} = studentSlice.actions;

export default studentSlice.reducer;
