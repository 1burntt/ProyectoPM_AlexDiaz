import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://rvgiajzkntczzcogeejj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2lhanprbnRjenpjb2dlZWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjIzMDksImV4cCI6MjA3OTU5ODMwOX0.1Os7olMFx4SQi2l22-YAVvR89w98w3_B_B0p29Oazk4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});