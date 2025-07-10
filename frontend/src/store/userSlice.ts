import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserData } from './index';


interface UserState {
  token: string | null;
  userInfo?: UserData | null;
}

const initialState: UserState = {
  token: localStorage.getItem('token'),
  userInfo: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem('token');
    },
    loginSuccess: (state, action: PayloadAction<UserData>) => {
      console.log('Redux loginSuccess triggered:', action.payload);
      state.userInfo = action.payload;
    },
  },
});

export const { setToken, clearToken } = userSlice.actions;
export const { loginSuccess } = userSlice.actions;
export default userSlice.reducer;