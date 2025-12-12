import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { i18n } from "../contexts/LanguageContext";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, isAllowed, login } = useAuth();
  const navigation = useNavigation<any>();

  const backgroundImage = require("../../assets/LoginBackgroundImage.jpg");

  useEffect(() => {
    if (user && isAllowed) {
      navigation.navigate("Home");
    }
  }, [user, isAllowed, navigation]);

  const handleLogin = async () => {
    if (email.includes("@") && email.includes(".") && password.length >= 6) {
      await login(email, password);
      // La navegación se maneja en el useEffect cuando user/isAllowed cambien
    } else {
      alert(i18n.t("invalidCredentials"));
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Tasky</Text>
          <Text style={styles.subtitle}>Organiza tus tareas</Text>

          <Text style={styles.label}>{i18n.t("email")}</Text>
          <CustomInput
            type="email"
            value={email}
            placeholder="ejemplo@correo.com"
            onChange={setEmail}
          />

          <Text style={styles.label}>{i18n.t("password")}</Text>
          <CustomInput
            type="password"
            value={password}
            placeholder="Ingresa tu contraseña"
            onChange={setPassword}
          />

          <CustomButton
            title={i18n.t("login")}
            onPress={handleLogin}
            variant="primary"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomButton
            title="Crear Cuenta"
            onPress={handleRegister}
            variant="secondary"
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(207, 207, 207, 0.27)",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#367C9C",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#666",
    fontSize: 14,
  },
});

export default LoginScreen;