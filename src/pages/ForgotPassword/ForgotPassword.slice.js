import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	token: sessionStorage.getItem('token') || null,
};

const forgotPasswordSlice = createSlice({
	name: 'forgotPassword',
	initialState,
	reducers: {
		setChangePasswordResponse: (state, action) => {
			state.token = action.payload.token;
		},

		setLogout: (state) => {
			state.token = null;
			sessionStorage.removeItem('token');
		},
	},
});

export const { setChangePasswordResponse, setLogout } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;