import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Priority } from '../store/taskSlice';

interface PrioritySelectorProps {
  selectedPriority: Priority;
  onPriorityChange: (priority: Priority) => void;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selectedPriority,
  onPriorityChange,
}) => {
  // opciones de prioridad
  const priorityOptions: { value: Priority; label: string; color: string; icon: string }[] = [
    { value: 'low', label: 'Baja', color: '#10B981', icon: 'leaf' },
    { value: 'medium-low', label: 'Poco Baja', color: '#06B6D4', icon: 'water' },
    { value: 'medium', label: 'Moderada', color: '#3B82F6', icon: 'speedometer' },
    { value: 'high', label: 'Alta', color: '#F59E0B', icon: 'alert-circle' },
    { value: 'urgent', label: 'Urgente', color: '#EF4444', icon: 'flash' },
  ];

  return (
    <View style={styles.priorityContainer}>
      {priorityOptions.map((priority) => (
        <TouchableOpacity
          key={priority.value}
          style={[
            styles.priorityOption,
            { 
              backgroundColor: selectedPriority === priority.value ? priority.color : 'transparent',
              borderColor: priority.color,
            }
          ]}
          onPress={() => onPriorityChange(priority.value)}
        >
          <Ionicons 
            name={priority.icon as any} 
            size={20} 
            color={selectedPriority === priority.value ? 'white' : priority.color} 
          />
          <Text style={[
            styles.priorityText,
            { color: selectedPriority === priority.value ? 'white' : priority.color }
          ]}>
            {priority.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 8,
    minWidth: '48%',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default PrioritySelector;