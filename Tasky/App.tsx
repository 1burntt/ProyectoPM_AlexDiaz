import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { StatusBar } from "react-native";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import { getThemeColors } from "./src/utils/theme";
import { AuthProvider } from "./src/contexts/AuthContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { Provider } from "react-redux";
import { store } from "./src/store";

const ThemedApp = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <StackNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ThemedApp />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </Provider>
  );
}