import React, { useEffect } from "react";
import { View, Text, Switch, StyleSheet, BackHandler } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../utils/theme";
import { i18n } from "../contexts/LanguageContext";
import { useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();
  const colors = getThemeColors(theme);

  // manejar boton fisico de retroceso
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate("Home");
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{i18n.t("settings")}</Text>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>{i18n.t("darkMode")}</Text>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            thumbColor={colors.primary}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  card: {
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
  },
});

export default SettingsScreen;