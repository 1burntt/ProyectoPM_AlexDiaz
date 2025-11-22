import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { i18n } from "../contexts/LanguageContext";
import CustomInput from "../components/CustomInput";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const backgroundImage = require("../../assets/LoginBackgroundImage.jpg");

  const handleLogin = () => {
    if (email.includes("@") && email.includes(".")) {
      const phoneNumber = parseInt(phone) || 0;
      login(email, password, phoneNumber);
      navigation.navigate("Home");
    } else {
      alert(i18n.t("invalidCredentials"));
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.label}>{i18n.t("email")}</Text>
          <CustomInput
            type="email"
            value={email}
            placeholder={i18n.t("email")}
            onChange={setEmail}
          />

          <Text style={styles.label}>{i18n.t("password")}</Text>
          <CustomInput
            type="password"
            value={password}
            placeholder={i18n.t("password")}
            onChange={setPassword}
          />

          <Text style={styles.label}>{i18n.t("phone")}</Text>
          <CustomInput
            type="number"
            value={phone}
            placeholder={i18n.t("phone")}
            onChange={setPhone}
          />

          <Button title={i18n.t("login")} onPress={handleLogin} color="#367C9C" />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: 'rgba(207, 207, 207, 0.27)',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333333",
  },
});

export default LoginScreen;