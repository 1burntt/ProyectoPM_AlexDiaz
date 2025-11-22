import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "../screens/ProfileScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { getThemeColors } from "../utils/theme";
import { useTheme } from "../contexts/ThemeContext";
import SettingsScreen from "../screens/SettingsScreen";
import { i18n } from "../contexts/LanguageContext";

export type TabsParamList = {
    Profile: undefined;
    Settings: undefined;
}

const Tab = createBottomTabNavigator<TabsParamList>();

const TabsNavigator = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
        },
      }}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: i18n.t("profile"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: i18n.t("settings"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabsNavigator;