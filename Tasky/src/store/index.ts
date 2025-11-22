import { configureStore } from "@reduxjs/toolkit";
import taskReducer from './taskSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;