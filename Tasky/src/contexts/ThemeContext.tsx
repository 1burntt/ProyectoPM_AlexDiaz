import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

type Theme = 'light' | 'dark';
type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme debe ser usado dentro de ThemeProvider");
    return context;
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem('theme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                setTheme(storedTheme);
            } else {
                const systemTheme = Appearance.getColorScheme();
                setTheme(systemTheme === 'dark' ? 'dark' : 'light');
            }
        }
        loadTheme();
    }, []); // agregue el array vacio que faltaba

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}