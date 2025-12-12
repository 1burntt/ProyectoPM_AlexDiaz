import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../utils/theme";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useAuth } from "../contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { i18n } from "../contexts/LanguageContext";
import { supabase } from "../services/supabaseClient";
import { setProfile } from "../store/profileSlice";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { height } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user, refreshProfile, logout } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  // Obtengo el perfil desde Redux (que ahora viene de Supabase)
  const { profile } = useAppSelector((state) => state.profile);

  const [isLoading, setIsLoading] = useState(!profile);
  const [refreshing, setRefreshing] = useState(false);

  // Estas son las tareas locales que todavía están en Redux
  const tasks = useAppSelector((state) => state.tasks.tasks || []);
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  // Cuando el componente se monta, cargo el perfil desde Supabase si no está en Redux
  useEffect(() => {
    const loadProfileFromSupabase = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      // Si ya tengo el perfil en Redux, no necesito cargarlo de nuevo
      if (profile && profile.id === user.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Intento obtener el perfil desde Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Si el perfil no existe en Supabase, creo uno básico
            const firstName = user.email?.split("@")[0] || "Usuario";
            const basicProfile = {
              id: user.id,
              email: user.email || "",
              first_name: firstName,
              last_name: "",
              avatar_url: null,
              language: 'es',
              theme: 'light',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Intento guardarlo en Supabase
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([basicProfile])
              .select()
              .single();

            if (insertError) {
              // Si falla Supabase, al menos lo guardo localmente
              const localProfile = {
                id: user.id,
                email: user.email || "",
                firstName: firstName,
                lastName: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              dispatch(setProfile(localProfile));
            } else if (newProfile) {
              // Si se creó en Supabase, lo guardo en Redux
              dispatch(setProfile({
                id: newProfile.id,
                email: newProfile.email,
                firstName: newProfile.first_name,
                lastName: newProfile.last_name || "",
                avatar: newProfile.avatar_url,
                createdAt: newProfile.created_at,
                updatedAt: newProfile.updated_at,
              }));
            }
          }
        } else if (data) {
          // Si encontré el perfil en Supabase, lo guardo en Redux
          dispatch(setProfile({
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name || "",
            avatar: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }));
        }
      } catch (error) {
        // Si hay error, simplemente termino el loading
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileFromSupabase();
  }, [user?.id, dispatch]);

  // Esta función la uso para forzar una actualización del perfil
  const handleRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      // Si falla, no muestro error
    } finally {
      setRefreshing(false);
    }
  };

  // Calculo las tareas completadas hoy
  const getTodayCompletedTasks = () => {
    const today = new Date();
    const todayString = today.toDateString();

    return completedTasks.filter(task => {
      const taskDate = new Date(task.createdAt).toDateString();
      return taskDate === todayString;
    }).length;
  };

  // Calculo las tareas completadas esta semana
  const getThisWeekCompletedTasks = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return completedTasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startOfWeek;
    }).length;
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              navigation.navigate("Login");
            } catch (error) {
              Alert.alert("Error", "No se pudo cerrar sesión");
            }
          }
        }
      ]
    );
  };

  const todayCompleted = getTodayCompletedTasks();
  const thisWeekCompleted = getThisWeekCompletedTasks();

  // Mientras carga, muestro un indicador
  if (isLoading) {
    return (
      <View style={[styles.container, {
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center'
      }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Botón para refrescar el perfil manualmente */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={refreshing}
      >
        <Ionicons
          name="refresh"
          size={20}
          color={colors.primary}
        />
        <Text style={[styles.refreshText, { color: colors.primary }]}>
          {refreshing ? "Actualizando..." : "Actualizar"}
        </Text>
      </TouchableOpacity>

      {/* Imagen de fondo del perfil */}
      <ImageBackground
        source={require("../../assets/ProfileScreenHeader.jpg")}
        style={[styles.imageSection, { height: height * 0.25 }]}
        resizeMode="cover"
      >
        {/* Información del usuario superpuesta en la imagen */}
        <View style={[styles.userInfo, { bottom: 20, left: 25 }]}>
          <Text style={styles.userLabel}>{i18n.t("user")}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {profile?.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : user?.email || i18n.t("signIn")}
          </Text>
          {profile?.email && (
            <Text style={styles.userPhone}>{profile.email}</Text>
          )}
        </View>
      </ImageBackground>

      {/* ScrollView para permitir desplazamiento */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Sección de estadísticas */}
        <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {i18n.t("completedTasks")}
            </Text>
            <Text style={[styles.statCount, { color: colors.primary }]}>
              {completedTasks.length}
            </Text>
            <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>
              {i18n.t("of")} {tasks.length} {i18n.t("totalTasks")}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {i18n.t("pendingTasks")}
            </Text>
            <Text style={[styles.statCount, { color: colors.text }]}>
              {pendingTasks.length}
            </Text>
            <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>
              {i18n.t("toComplete")}
            </Text>
          </View>

          {/* Estadísticas adicionales */}
          <View style={styles.additionalStats}>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>
                {i18n.t("today")}
              </Text>
              <Text style={[styles.miniStatCount, { color: colors.text }]}>
                {todayCompleted}
              </Text>
            </View>

            <View style={styles.miniStat}>
              <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>
                {i18n.t("thisWeek")}
              </Text>
              <Text style={[styles.miniStatCount, { color: colors.text }]}>
                {thisWeekCompleted}
              </Text>
            </View>

            <View style={styles.miniStat}>
              <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>
                {i18n.t("progress")}
              </Text>
              <Text style={[styles.miniStatCount, { color: colors.text }]}>
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
              </Text>
            </View>
          </View>

          {/* Información detallada del perfil */}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileInfoTitle, { color: colors.text }]}>
              Información del Perfil
            </Text>

            <View style={styles.profileDetail}>
              <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
                Email:
              </Text>
              <Text style={[styles.profileDetailValue, { color: colors.text }]}>
                {profile?.email || user?.email || "No disponible"}
              </Text>
            </View>

            <View style={styles.profileDetail}>
              <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
                Nombre:
              </Text>
              <Text style={[styles.profileDetailValue, { color: colors.text }]}>
                {profile?.firstName || "No especificado"}
              </Text>
            </View>

            <View style={styles.profileDetail}>
              <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
                Apellido:
              </Text>
              <Text style={[styles.profileDetailValue, { color: colors.text }]}>
                {profile?.lastName || "No especificado"}
              </Text>
            </View>

            <View style={styles.profileDetail}>
              <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
                Miembro desde:
              </Text>
              <Text style={[styles.profileDetailValue, { color: colors.text }]}>
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES') : 'N/A'}
              </Text>
            </View>

            <View style={styles.profileDetail}>
              <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
                Última actualización:
              </Text>
              <Text style={[styles.profileDetailValue, { color: colors.text }]}>
                {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('es-ES') : 'N/A'}
              </Text>
            </View>

            {/* BOTÓN DE LOGOUT - AL FINAL */}
            <View style={styles.logoutContainer}>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: '#EF4444' }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  refreshButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  refreshText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  imageSection: {
    width: '100%',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  userInfo: {
    position: 'absolute',
  },
  userLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  userEmail: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  statsSection: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingTop: 35,
    marginTop: -20,
    minHeight: 500,
  },
  statCard: {
    marginBottom: 30,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'left',
  },
  statCount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    textAlign: 'left',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  miniStatCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileInfo: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  profileInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileDetailValue: {
    fontSize: 14,
  },
  logoutContainer: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;