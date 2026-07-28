import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trainers: [],
  filteredTrainers: [],
  selectedTrainer: null,
  loading: false,
  error: null,
};

const trainerSlice = createSlice({
  name: 'trainer',
  initialState,
  reducers: {
    setTrainers: (state, action) => {
      state.trainers = action.payload;
      state.filteredTrainers = action.payload;
      state.error = null;
    },

    addTrainer: (state, action) => {
      state.trainers.unshift(action.payload);
      state.filteredTrainers.unshift(action.payload);
    },

    updateTrainerItem: (state, action) => {
      const index = state.trainers.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.trainers[index] = action.payload;
        state.filteredTrainers = [...state.trainers];
      }
    },

    deleteTrainerItem: (state, action) => {
      state.trainers = state.trainers.filter((t) => t._id !== action.payload);
      state.filteredTrainers = [...state.trainers];
    },

    setSelectedTrainer: (state, action) => {
      state.selectedTrainer = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    filterTrainers: (state, action) => {
      const { searchTerm, activeStatus } = action.payload;
      let filtered = state.trainers;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.trainerName.toLowerCase().includes(term) ||
            t.phoneNumber.includes(term) ||
            t.place.toLowerCase().includes(term)
        );
      }

      if (activeStatus !== '') {
        filtered = filtered.filter((t) => t.activeStatus === activeStatus);
      }

      state.filteredTrainers = filtered;
    },

    clearFilters: (state) => {
      state.filteredTrainers = [...state.trainers];
    },
  },
});

export const {
  setTrainers,
  addTrainer,
  updateTrainerItem,
  deleteTrainerItem,
  setSelectedTrainer,
  setLoading,
  setError,
  filterTrainers,
  clearFilters,
} = trainerSlice.actions;

export default trainerSlice.reducer;
