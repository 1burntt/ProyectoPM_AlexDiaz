import { supabase } from "./supabaseClient";

export const profileService = {
  // Obtengo el perfil de un usuario desde Supabase
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizo el perfil en Supabase
  async updateProfile(userId, updates) {
    try {
      // Siempre actualizo la fecha de modificación
      updates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Creo un nuevo perfil en Supabase
  async createProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Verifico si un perfil ya existe en Supabase
  async profileExists(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        return false;
      }
      
      return !!data;
    } catch (error) {
      return false;
    }
  }
};