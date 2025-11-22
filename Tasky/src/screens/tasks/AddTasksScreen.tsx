import React, { useState } from "react";
import {View, Text, StyleSheet, TextInput, Alert, ScrollView,} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeColors } from "../../utils/theme";
import CustomButton from "../../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch } from "../../store/hooks";
import { addTask, Priority } from "../../store/taskSlice";
import { i18n } from "../../contexts/LanguageContext";
import Header from "../../components/Header";
import PrioritySelector from "../../components/PrioritySelector";

const AddTasksScreen = () => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const navigation = useNavigation<any>();

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');

  const handleSave = () => {
    if (!taskTitle.trim()) {
      Alert.alert(
        i18n.t("incompleteData"),
        i18n.t("pleaseEnterTaskTitle")
      );
      return;
    }

    dispatch(
      addTask({
        title: taskTitle,
        notes: taskDescription + (taskNotes ? `\n${i18n.t("notes")}: ${taskNotes}` : ''),
        completed: false,
        priority: selectedPriority
      })
    );

    // limpiar formulario
    setTaskTitle('');
    setTaskDescription('');
    setTaskNotes('');
    setSelectedPriority('medium');

    Alert.alert(
      i18n.t("taskSaved"),
      i18n.t("taskSavedMessage"),
      [
        { 
          text: i18n.t("viewTasks"), 
          onPress: () => navigation.navigate('Home') 
        },
        { 
          text: i18n.t("continueAdding"), 
          style: "cancel" 
        }
      ]
    );
  };

  const handleCancel = () => {
    if (taskTitle || taskDescription || taskNotes) {
      Alert.alert(
        i18n.t("cancel"),
        i18n.t("cancelConfirmation"),
        [
          { 
            text: i18n.t("yesCancel"), 
            onPress: () => navigation.goBack(),
            style: "destructive"
          },
          { 
            text: i18n.t("continueEditing"), 
            style: "cancel" 
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <Header
        title="Tasky"
        showBackButton={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {i18n.t("createNewTask")}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {i18n.t("createTaskDescription")}
          </Text>

          {/* titulo de tarea */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {i18n.t("taskTitle")} *
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder={i18n.t("taskTitlePlaceholder")}
            placeholderTextColor={colors.textSecondary}
          />

          {/* selector de prioridad */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {i18n.t("priority")}
          </Text>
          <PrioritySelector
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
          />

          {/* descripcion */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {i18n.t("description")}
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholder={i18n.t("descriptionPlaceholder")}
            placeholderTextColor={colors.textSecondary}
          />

          {/* notas */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {i18n.t("additionalNotes")}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.text, borderColor: colors.border },
            ]}
            value={taskNotes}
            onChangeText={setTaskNotes}
            placeholder={i18n.t("notesPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <CustomButton
            title={i18n.t("saveTask")}
            onPress={handleSave}
            variant="primary"
          />

          <CustomButton
            title={i18n.t("cancel")}
            onPress={handleCancel}
            variant="secondary"
          />

          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            {i18n.t("requiredFields")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default AddTasksScreen;