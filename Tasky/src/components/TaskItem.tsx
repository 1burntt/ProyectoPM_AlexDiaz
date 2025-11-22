import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Priority } from '../store/taskSlice';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
    priority: Priority;
    notes?: string;
  };
  onToggle: (id: string) => void;
  onMenuPress: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onMenuPress }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  // aqui defino los colores de prioridad
  const getPriorityColor = (priority: Priority) => {
    const priorityColors = {
      'low': '#10B981',
      'medium-low': '#06B6D4', 
      'medium': '#3B82F6',
      'high': '#F59E0B',
      'urgent': '#EF4444',
    };
    return priorityColors[priority];
  };

  // iconos para cada prioridad
  const getPriorityIcon = (priority: Priority) => {
    const priorityIcons = {
      'low': 'leaf',
      'medium-low': 'water',
      'medium': 'speedometer',
      'high': 'alert-circle',
      'urgent': 'flash',
    };
    return priorityIcons[priority];
  };

  // texto de prioridad
  const getPriorityText = (priority: Priority) => {
    const priorityTexts = {
      'low': 'Baja',
      'medium-low': 'Poco Baja',
      'medium': 'Moderada', 
      'high': 'Alta',
      'urgent': 'Urgente',
    };
    return priorityTexts[priority];
  };

  return (
    <TouchableOpacity 
      style={[styles.taskItem, { 
        backgroundColor: colors.card,
        opacity: task.completed ? 0.7 : 1 
      }]}
      onPress={() => onToggle(task.id)}
    >
      <View style={styles.taskContent}>
        
        {/* titulo y checkbox */}
        <View style={styles.taskHeader}>
          <Text style={[
            styles.taskText, 
            { color: colors.text },
            task.completed && styles.completedText
          ]}>
            {task.title}
          </Text>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => onToggle(task.id)}
          >
            <View style={[
              styles.checkboxCircle, 
              { 
                borderColor: colors.primary,
                backgroundColor: task.completed ? colors.primary : 'transparent'
              }
            ]} />
          </TouchableOpacity>
        </View>
        
        {/* prioridad */}
        <View style={styles.taskDetails}>
          <View style={[
            styles.priorityBadge, 
            { backgroundColor: getPriorityColor(task.priority) }
          ]}>
            <Ionicons 
              name={getPriorityIcon(task.priority) as any} 
              size={12} 
              color="white" 
            />
            <Text style={styles.priorityText}>
              {getPriorityText(task.priority)}
            </Text>
          </View>
        </View>

        {/* notas si existen */}
        {task.notes ? (
          <Text style={[styles.taskNotes, { color: colors.textSecondary }]}>
            {task.notes}
          </Text>
        ) : null}

        {/* boton menu en esquina */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => onMenuPress(task.id)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
    position: 'relative',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
  },
  completedText: {
    textDecorationLine: 'line-through'
  },
  checkbox: {
    padding: 4,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  taskNotes: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  menuButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
  },
});

export default TaskItem;