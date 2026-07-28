import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	token: sessionStorage.getItem('token') || null,
};

const loginSlice = createSlice({
	name: 'login',
	initialState,
	reducers: {
		setLoginResponse: (state, action) => {
			state.token = action.payload.token;
			sessionStorage.setItem('token', action.payload.token);
		},

		setLogout: (state) => {
			state.token = null;
			sessionStorage.removeItem('token');
		},
	},
});

export const { setLoginResponse, setLogout } = loginSlice.actions;
export default loginSlice.reducer;
