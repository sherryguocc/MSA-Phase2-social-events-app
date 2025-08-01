import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  devTools: true, 
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
export interface UserData {
  id: number;
  username: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}