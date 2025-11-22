import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type Props = {
    type?: 'text' | 'email' | 'password' | 'number';
    value: string;
    placeholder: string;
    onChange: (text: string) => void;
}

export default function CustomInput({ type = "text", value, placeholder, onChange }: Props) {
    const [isSecureText, setIsSecureText] = useState(type === "password");
    const isPasswordField = type === 'password';
   
    // icono segun el tipo
    const icon = type === 'email' ? 'email' : type === 'password' ? 'lock' : ''

    // tipo de teclado
    const keyboardType = type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : 'default';

    // validaciones
    const getError = () => {
        if (type === 'email' && !value.includes('@')) return 'Correo invalido';
        if (type === 'password' && value.length < 6) return 'La contraseña debe ser mas fuerte';
        return '';
    }
    
    const error = getError();    

    return(
        <View style={styles.wrapper}>
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <MaterialIcons name={icon as any} size={20} color="#000000" />
                <TextInput 
                 placeholder={placeholder}
                 value={value} 
                 onChangeText={onChange}
                 secureTextEntry={isSecureText}
                 style={styles.input}
                 keyboardType={keyboardType}
                 />
                
              {isPasswordField && (
                <TouchableOpacity onPress={() => setIsSecureText(!isSecureText)}>
                    <Ionicons name={isSecureText ? 'eye' : 'eye-off'} size={22} />
                </TouchableOpacity>
              )}
            </View>
            {error && <Text style={styles.errorText}> {error} </Text>}
        </View>
    );
}

const styles = StyleSheet.create({
   wrapper: {
        marginBottom: 10,
   },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8, 
        paddingHorizontal: 13,
        backgroundColor: '#F9F9F9',
    },
    input: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '80%',
    },
    inputError: {
        borderColor: '#FF0000',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: 4,
    }
});