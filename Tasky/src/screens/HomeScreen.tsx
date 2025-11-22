import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { i18n } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../utils/theme";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { toggleTask, deleteTask, Priority } from "../store/taskSlice";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import TaskItem from "../components/TaskItem";

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  
  const tasks = useAppSelector((state) => state.tasks.tasks || []);
  
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleToggleTask = (taskId: string) => {
    dispatch(toggleTask(taskId));
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      i18n.t("deleteTask"),
      i18n.t("deleteTaskConfirmation"),
      [
        { text: i18n.t("cancel"), style: "cancel" },
        { 
          text: i18n.t("delete"), 
          style: "destructive",
          onPress: () => {
            dispatch(deleteTask(taskId));
            setMenuVisible(false);
          }
        }
      ]
    );
  };

  const openMenu = (taskId: string) => {
    setSelectedTask(taskId);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedTask(null);
  };

  // ordenar por prioridad
  const sortedPendingTasks = [...pendingTasks].sort((a, b) => {
    const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'medium-low': 3, 'low': 4 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const sortedCompletedTasks = [...completedTasks].sort((a, b) => {
    const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'medium-low': 3, 'low': 4 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const hasNoTasks = tasks.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <Header
        title="Tasky"
        showUserButton={true}
        showSettingsButton={true}
        onUserPress={() => navigation.navigate("Tabs", { screen: "Profile" })}
        onSettingsPress={() => navigation.navigate("Tabs", { screen: "Settings" })}
      />

      {/* contenido principal */}
      {hasNoTasks ? (
        <View style={styles.emptyState}>
          <Ionicons 
            name="checkmark-done-circle-outline" 
            size={120} 
            color={colors.textSecondary}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            {i18n.t("noTasks")}
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            {i18n.t("addFirstTask")}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* tareas pendientes */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {i18n.t("pending")} ({pendingTasks.length})
            </Text>
            {pendingTasks.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {i18n.t("pendingTasksEmpty")}
              </Text>
            ) : (
              sortedPendingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onMenuPress={openMenu}
                />
              ))
            )}
          </View>

          {/* tareas completadas */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {i18n.t("completed")} ({completedTasks.length})
            </Text>
            {completedTasks.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {i18n.t("completedTasksEmpty")}
              </Text>
            ) : (
              sortedCompletedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onMenuPress={openMenu}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* modal de menu */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
        <TouchableOpacity style={styles.modalOverlay} onPress={closeMenu} activeOpacity={1}>
          <View style={[styles.menu, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => selectedTask && handleDeleteTask(selectedTask)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.menuText, { color: '#EF4444' }]}>{i18n.t("delete")}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* boton agregar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("AddTasks")}
        >
          <Text style={styles.addIcon}>+</Text>
          <Text style={[styles.addText, { color: '#FFFFFF' }]}>
            {i18n.t("addTask")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    borderRadius: 12,
    padding: 8,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;