import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../utils/theme";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { i18n } from "../contexts/LanguageContext";

const { height } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  
  // Obtener datos del perfil desde Redux
  const { profile } = useAppSelector((state) => state.profile);
  const tasks = useAppSelector((state) => state.tasks.tasks || []);

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  // calcular tareas de hoy
  const getTodayCompletedTasks = () => {
    const today = new Date();
    const todayString = today.toDateString();
    
    return completedTasks.filter(task => {
      const taskDate = new Date(task.createdAt).toDateString();
      return taskDate === todayString;
    }).length;
  };

  // calcular tareas de esta semana
  const getThisWeekCompletedTasks = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    return completedTasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startOfWeek;
    }).length;
  };

  const todayCompleted = getTodayCompletedTasks();
  const thisWeekCompleted = getThisWeekCompletedTasks();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* imagen de fondo */}
      <ImageBackground
        source={require("../../assets/ProfileScreenHeader.jpg")}
        style={[styles.imageSection, { height: height * 0.25 }]}
        resizeMode="cover"
      >
        {/* info usuario abajo */}
        <View style={[styles.userInfo, { bottom: 20, left: 25 }]}>
          <Text style={styles.userLabel}>{i18n.t("user")}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user?.email || i18n.t("signIn")}
          </Text>
          <Text style={styles.userPhone}>
            {profile?.phone || user?.phone || ''}
          </Text>
        </View>
      </ImageBackground>

      {/* estadísticas */}
      <View style={[styles.statsSection, { backgroundColor: colors.card, flex: 1 }]}>

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

        {/* Información adicional del perfil */}
        <View style={styles.profileInfo}>
          <Text style={[styles.profileInfoTitle, { color: colors.text }]}>
            Información del Perfil
          </Text>
          <View style={styles.profileDetail}>
            <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
              Email:
            </Text>
            <Text style={[styles.profileDetailValue, { color: colors.text }]}>
              {profile?.email || user?.email}
            </Text>
          </View>
          <View style={styles.profileDetail}>
            <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
              Teléfono:
            </Text>
            <Text style={[styles.profileDetailValue, { color: colors.text }]}>
              {profile?.phone || user?.phone}
            </Text>
          </View>
          <View style={styles.profileDetail}>
            <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
              Miembro desde:
            </Text>
            <Text style={[styles.profileDetailValue, { color: colors.text }]}>
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default ProfileScreen;