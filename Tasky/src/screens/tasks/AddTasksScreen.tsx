import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeColors } from "../../utils/theme";
import CustomButton from "../../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch } from "../../store/hooks";
import { i18n } from "../../contexts/LanguageContext";
import Header from "../../components/Header";
import PrioritySelector from "../../components/PrioritySelector";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../../contexts/AuthContext"; 
import { addTask, Priority } from "../../store/taskSlice";

const AddTasksScreen = () => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');

  // Estados para fecha y hora
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);

  // Estado para sonido
  const [selectedSound, setSelectedSound] = useState<{uri: string, name: string} | null>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const currentDate = startDate || new Date();
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes()
      );
      setStartDate(newDate);
    }
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(false);
    if (selectedDate) {
      const currentDate = dueDate || new Date();
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes()
      );
      setDueDate(newDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime && startDate) {
      const newDate = new Date(startDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setStartDate(newDate);
    } else if (selectedTime) {
      const today = new Date();
      today.setHours(selectedTime.getHours());
      today.setMinutes(selectedTime.getMinutes());
      setStartDate(today);
    }
  };

  const handleDueTimeChange = (event: any, selectedTime?: Date) => {
    setShowDueTimePicker(false);
    if (selectedTime && dueDate) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDueDate(newDate);
    } else if (selectedTime) {
      const today = new Date();
      today.setHours(selectedTime.getHours());
      today.setMinutes(selectedTime.getMinutes());
      setDueDate(today);
    }
  };

  const pickSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: false // Asegurar que solo se seleccione un archivo
      });
      console.log('DocumentPicker result:', result); // Para debugging

      // La estructura correcta en versiones recientes de expo-document-picker
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const soundFile = result.assets[0];
        setSelectedSound({
          uri: soundFile.uri,
          name: soundFile.name || 'Custom Sound'
        });
        console.log('Sound selected:', soundFile.name, soundFile.uri);
      } else {
        console.log('Sound selection canceled');
      }
    } catch (error) {
      console.error('Error picking sound:', error);
      Alert.alert(
        i18n.t("error"),
        i18n.t("soundPickError")
      );
    }
  };

  const handleSave = async () => {
    if (!taskTitle.trim()) {
      Alert.alert(
        i18n.t("incompleteData"),
        i18n.t("pleaseEnterTaskTitle")
      );
      return;
    }

    // Validar que la fecha de vencimiento sea posterior a la de inicio
    if (startDate && dueDate && dueDate <= startDate) {
      Alert.alert(
        i18n.t("invalidDate"),
        i18n.t("dueDateMustBeAfterStartDate")
      );
      return;
    }

    // Verificar que tenemos usuario
    if (!user?.id) {
      Alert.alert("Error", "No se pudo identificar al usuario");
      return;
    }

    try {
      // Preparamos los datos de la tarea
      const taskData = {
        title: taskTitle,
        description: taskDescription,
        notes: taskNotes,
        completed: false,
        priority: selectedPriority,
        startDate: startDate ? startDate.toISOString() : undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        soundUri: selectedSound?.uri,
        soundName: selectedSound?.name
      };

      // Guardamos usando el thunk async
      await dispatch(addTask({ userId: user.id, taskData })).unwrap();
      
      console.log("Tarea guardada exitosamente en Supabase");
      
      // limpiar formulario
      setTaskTitle('');
      setTaskDescription('');
      setTaskNotes('');
      setSelectedPriority('medium');
      setStartDate(null);
      setDueDate(null);
      setSelectedSound(null);

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
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      Alert.alert("Error", "No se pudo guardar la tarea");
    }
  };

  const handleCancel = () => {
    if (taskTitle || taskDescription || taskNotes || startDate || dueDate || selectedSound) {
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

      <ScrollView style={styles.content}
        contentContainerStyle={styles.scrollContent}>
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

          {/* Fecha y hora de inicio */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {i18n.t("startDateTime")}
          </Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={[styles.dateTimeButton, { borderColor: colors.border }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>
                {startDate ? formatDate(startDate) : i18n.t("selectDate")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeButton, { borderColor: colors.border }]}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>
                {startDate ? formatTime(startDate) : i18n.t("selectTime")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fecha y hora de vencimiento */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {i18n.t("dueDateTime")}
          </Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={[styles.dateTimeButton, { borderColor: colors.border }]}
              onPress={() => setShowDueDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>
                {dueDate ? formatDate(dueDate) : i18n.t("selectDate")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeButton, { borderColor: colors.border }]}
              onPress={() => setShowDueTimePicker(true)}
            >
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>
                {dueDate ? formatTime(dueDate) : i18n.t("selectTime")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selectores de fecha/hora */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
            />
          )}
          {showStartTimePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartTimeChange}
            />
          )}
          {showDueDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDueDateChange}
            />
          )}
          {showDueTimePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDueTimeChange}
            />
          )}

          {/* Selector de sonido */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {i18n.t("customSound")}
          </Text>
          <TouchableOpacity
            style={[styles.soundButton, { borderColor: colors.border }]}
            onPress={pickSound}
          >
            <Ionicons name="musical-notes-outline" size={20} color={colors.text} />
            <Text style={[styles.soundButtonText, { color: colors.text }]}>
              {selectedSound ? selectedSound.name : i18n.t("chooseCustomSound")}
            </Text>
          </TouchableOpacity>
          {selectedSound && (
            <TouchableOpacity
              style={styles.removeSoundButton}
              onPress={() => setSelectedSound(null)}
            >
              <Text style={[styles.removeSoundText, { color: '#EF4444' }]}>
                {i18n.t("removeSound")}
              </Text>
            </TouchableOpacity>
          )}

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
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  dateTimeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  soundButtonText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  removeSoundButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  removeSoundText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AddTasksScreen;