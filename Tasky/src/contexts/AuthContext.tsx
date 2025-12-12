import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { setProfile, clearProfile, updateProfile as updateReduxProfile } from "../store/profileSlice";
import { supabase } from "../services/supabaseClient";
import { Alert } from "react-native";
import { errorMessageValidation } from "../utils/validations/apiResponseErrorValidation";

type User = {
  id: string;
  email?: string;
  token: string;
} | null;

type RegisterResponse = {
  success: boolean;
  user?: any;
  error?: any;
  message?: string;
};

type AuthContextType = {
  user: User | null;
  isAllowed: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<RegisterResponse>;
  logout: () => void;
  updateUserProfile: (updates: { firstName?: string; lastName?: string; avatar?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  // Aquí cargo el perfil del usuario desde Supabase después del login
  const loadUserProfile = async (userId: string, email: string) => {
    try {
      // Primero intento obtener el perfil de Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Si el perfil no existe en Supabase (error común cuando es usuario nuevo)
      if (profileError && profileError.code === 'PGRST116') {
        // Creo un perfil básico para el nuevo usuario
        const firstName = email.split("@")[0];
        const newProfile = {
          id: userId,
          email: email,
          first_name: firstName,
          last_name: "",
          avatar_url: null,
          language: 'es',
          theme: 'light',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Intento guardar el perfil en Supabase
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) {
          // Si falla Supabase, al menos guardo el perfil localmente en Redux
          const localProfile = {
            id: userId,
            email: email,
            firstName: firstName,
            lastName: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          dispatch(setProfile(localProfile));
          return localProfile;
        }

        // Si se creó en Supabase, también lo guardo en Redux
        const profileForRedux = {
          id: insertedProfile.id,
          email: insertedProfile.email,
          firstName: insertedProfile.first_name,
          lastName: insertedProfile.last_name || "",
          avatar: insertedProfile.avatar_url,
          createdAt: insertedProfile.created_at,
          updatedAt: insertedProfile.updated_at,
        };
        dispatch(setProfile(profileForRedux));
        return profileForRedux;
      } 
      else if (profileError) {
        // Si hay otro error, guardo un perfil local como respaldo
        const firstName = email.split("@")[0];
        const localProfile = {
          id: userId,
          email: email,
          firstName: firstName,
          lastName: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch(setProfile(localProfile));
        return localProfile;
      } 
      else {
        // Si el perfil existe en Supabase, lo cargo en Redux
        const profileForRedux = {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.first_name,
          lastName: profileData.last_name || "",
          avatar: profileData.avatar_url,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
        };
        dispatch(setProfile(profileForRedux));
        return profileForRedux;
      }
    } catch (error) {
      // Si todo falla, creo un perfil mínimo local
      const firstName = email.split("@")[0];
      const localProfile = {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(setProfile(localProfile));
      return localProfile;
    }
  };

  // Esta función establece la sesión del usuario y carga su perfil
  const setUserSession = async (data: any, email?: string) => {
    const session = data?.session;
    if (session && session.user) {
      const userData = {
        id: session.user.id,
        email: session.user.email || email,
        token: session.access_token,
      };
      setUser(userData);
      setIsAllowed(true);

      // Después de login, cargo el perfil desde Supabase
      await loadUserProfile(session.user.id, session.user.email || email || "");
    } else {
      setUser(null);
      setIsAllowed(false);
    }
  };

  // Esta función la uso para refrescar el perfil desde Supabase si necesito datos actualizados
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && profileData) {
        const profileForRedux = {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.first_name,
          lastName: profileData.last_name || "",
          avatar: profileData.avatar_url,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
        };
        dispatch(setProfile(profileForRedux));
      }
    } catch (error) {
      // Si falla, simplemente no hago nada
    }
  };

  // Cuando la app se inicia, intento restaurar la sesión si el usuario ya estaba logueado
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        errorMessageValidation(error, "Error al intentar cargar sesion: ");
        
        if (data?.session) {
          await setUserSession(data);
        } else {
          setUser(null);
          setIsAllowed(false);
        }
      } catch (err) {
        setUser(null);
        setIsAllowed(false);
      }
    };

    restoreSession();
  }, []);

  // Aquí manejo el registro de nuevos usuarios
  const register = async (email: string, password: string): Promise<RegisterResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
            first_name: email.split("@")[0],
            last_name: "",
          }
        }
      });

      if (error) {
        errorMessageValidation(error, "Error al registrar usuario: ");
        return {
          success: false,
          error,
          message: error.message,
        };
      }

      if (data?.user) {
        // Espero un momento para que el trigger de Supabase cree el perfil automáticamente
        setTimeout(async () => {
          if (data.session) {
            await setUserSession(data, email);
          }
        }, 1000);
        
        return {
          success: true,
          user: data.user,
          message: "Registro exitoso. Verifica tu email si es necesario.",
        };
      }

      return {
        success: false,
        error: new Error("No se pudo crear el usuario"),
        message: "Error desconocido en el registro",
      };
    } catch (error: any) {
      return {
        success: false,
        error,
        message: error?.message || "Error inesperado en el registro",
      };
    }
  };

  // Aquí manejo el login de usuarios existentes
  const login = async (email: string, password: string) => {
    const allowedEmail = email.includes("@") && email.includes(".");
    const allowedPassword = password.length >= 6;
    if (!allowedEmail || !allowedPassword) {
      Alert.alert("Error", "Credenciales inválidas");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Error al iniciar sesión", error.message);
        return;
      }

      if (data.session && data.user) {
        await setUserSession(data, email);
      }
    } catch (error: any) {
      Alert.alert("Error", "Error inesperado al iniciar sesión");
    }
  };

  // Esta función actualiza el perfil tanto en Supabase como en Redux
  const updateUserProfile = async (updates: { firstName?: string; lastName?: string; avatar?: string }) => {
    if (!user) return;

    try {
      // Primero actualizo en Supabase
      const supabaseUpdates: any = {};
      if (updates.firstName !== undefined) supabaseUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) supabaseUpdates.last_name = updates.lastName;
      if (updates.avatar !== undefined) supabaseUpdates.avatar_url = updates.avatar;
      supabaseUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        // Si falla Supabase, al menos mantengo Redux actualizado
        dispatch(updateReduxProfile(updates));
        Alert.alert("Error", "No se pudo actualizar el perfil en el servidor");
        return;
      }

      // Si se actualizó en Supabase, también actualizo Redux con los datos frescos
      const updatedProfile = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name || "",
        avatar: data.avatar_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      dispatch(setProfile(updatedProfile));
      
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error) {
      // Si todo falla, al menos mantengo Redux actualizado
      dispatch(updateReduxProfile(updates));
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAllowed(false);
      dispatch(clearProfile());
    } catch (error) {
      // Si falla el logout de Supabase, al menos limpio el estado local
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAllowed, 
      login, 
      logout, 
      register, 
      updateUserProfile,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};