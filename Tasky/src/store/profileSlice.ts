import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Profile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.profile) {
        state.profile = {
          ...state.profile,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setProfile, updateProfile, clearProfile, setLoading } = profileSlice.actions;
export default profileSlice.reducer;