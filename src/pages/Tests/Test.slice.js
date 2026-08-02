import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tests: [],
  loading: false,
  error: null,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    // Filtering/search happen server-side via query params on getTestsSummary.
    setTests: (state, action) => {
      state.tests = action.payload;
      state.error = null;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setTests, setLoading, setError } = testSlice.actions;

export default testSlice.reducer;
