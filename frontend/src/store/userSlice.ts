import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserData } from './index';


interface UserState {
  token: string | null;
  userInfo?: UserData | null;
}

const initialState: UserState = {
  token: localStorage.getItem('token'),
  userInfo: (() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  })(),
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
      state.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    loginSuccess: (state, action: PayloadAction<UserData>) => {
      console.log('Redux loginSuccess triggered:', action.payload);
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
  },
});

export const { setToken, clearToken } = userSlice.actions;
export const { loginSuccess } = userSlice.actions;
export default userSlice.reducer;