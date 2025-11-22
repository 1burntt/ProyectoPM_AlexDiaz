import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../utils/theme";

type Variant = "primary" | "secondary";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
}

export default function CustomButton({
  title,
  onPress,
  variant = "primary",
}: CustomButtonProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.base,
        isPrimary
          ? { backgroundColor: colors.primary }
          : {
              backgroundColor: colors.backgroundAlt,
              borderColor: colors.border,
              borderWidth: 1,
            },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: isPrimary ? '#F9FAFB' : colors.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});