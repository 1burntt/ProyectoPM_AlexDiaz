import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showUserButton?: boolean;
  showSettingsButton?: boolean;
  onBack?: () => void;
  onUserPress?: () => void;
  onSettingsPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showUserButton = false,
  showSettingsButton = false,
  onBack,
  onUserPress,
  onSettingsPress,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { 
      backgroundColor: colors.card,
      paddingTop: insets.top + 15,
    }]}>
      
      {/* lado izquierdo - boton atras o espacio */}
      <View style={styles.sideContainer}>
        {showBackButton ? (
          <TouchableOpacity style={styles.iconButton} onPress={onBack}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* titulo en el centro */}
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>

      {/* lado derecho - botones */}
      <View style={styles.sideContainer}>
        <View style={styles.rightButtons}>
          {showUserButton && (
            <TouchableOpacity style={styles.iconButton} onPress={onUserPress}>
              <Ionicons name="person-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          {showSettingsButton && (
            <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  sideContainer: {
    width: 80,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
});

export default Header;