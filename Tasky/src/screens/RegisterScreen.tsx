import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { supabase } from "../services/supabaseClient";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigation = useNavigation<any>();

  const backgroundImage = require("../../assets/RegisterBackgroundImage.jpg");

  const handleRegister = async () => {
    // Primero valido todos los campos
    if (!email || !password || !confirmPassword) {
      Alert.alert("Campos requeridos", "Por favor complete todos los campos obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Error", "Ingresa un correo electrónico válido.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password);
      
      if (result.success) {
        // Si el usuario ingresó nombre o apellido, intento actualizar el perfil
        if (firstName || lastName) {
          // Espero un momento para que se cree el usuario
          setTimeout(async () => {
            try {
              // Obtengo el usuario recién creado
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user) {
                const updates: any = {};
                if (firstName) updates.first_name = firstName;
                if (lastName) updates.last_name = lastName;
                
                // Solo actualizo si hay cambios
                if (Object.keys(updates).length > 0) {
                  await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);
                }
              }
            } catch (profileError) {
              // Si falla, no es crítico, el usuario ya se creó
            }
          }, 1500);
        }
        
        // Muestro mensaje de éxito
        Alert.alert(
          "¡Cuenta creada!",
          result.message || "Tu cuenta ha sido creada exitosamente.",
          [
            {
              text: "Iniciar Sesión",
              onPress: () => {
                // Limpio el formulario
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setFirstName("");
                setLastName("");
                // Navego al login
                navigation.navigate("Login");
              },
            },
          ]
        );
      } else {
        // Si hay error en el registro
        Alert.alert(
          "Error de registro",
          result.message || result.error?.message || "No se pudo crear la cuenta."
        );
      }
    } catch (error: any) {
      // Si hay error inesperado
      Alert.alert(
        "Error",
        error?.message || "Error inesperado. Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a Tasky</Text>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Información Personal</Text>
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Nombre (Opcional)</Text>
                  <CustomInput
                    type="text"
                    value={firstName}
                    placeholder="Tu nombre"
                    onChange={setFirstName}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Apellido (Opcional)</Text>
                  <CustomInput
                    type="text"
                    value={lastName}
                    placeholder="Tu apellido"
                    onChange={setLastName}
                  />
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>
              <Text style={styles.label}>Correo Electrónico *</Text>
              <CustomInput
                type="email"
                value={email}
                placeholder="tu@email.com"
                onChange={setEmail}
              />

              <Text style={styles.label}>Contraseña *</Text>
              <CustomInput
                type="password"
                value={password}
                placeholder="Mínimo 6 caracteres"
                onChange={setPassword}
              />

              <Text style={styles.label}>Confirmar Contraseña *</Text>
              <CustomInput
                type="password"
                value={confirmPassword}
                placeholder="Repite tu contraseña"
                onChange={setConfirmPassword}
              />
            </View>

            <CustomButton
              title={isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              onPress={handleRegister}
              variant="primary"
            />

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.loginLinkContainer}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>
                ¿Ya tienes una cuenta?{" "}
                <Text style={styles.loginLinkBold}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    padding: 20,
    backgroundColor: "rgba(207, 207, 207, 0.27)",
    marginHorizontal: 20,
    borderRadius: 10,
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#367C9C",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  formSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  halfInput: {
    width: "48%",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333333",
    fontWeight: "500",
  },
  loginLinkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLink: {
    color: "#666",
    fontSize: 15,
  },
  loginLinkBold: {
    fontWeight: "600",
    color: "#367C9C",
  },
});
