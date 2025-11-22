import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18n } from "i18n-js";
import { createContext, useContext, useEffect, useState } from "react";
import { transltns } from "../utils/translations";

type Language = 'es' | 'en';

type LanguageContextProps = {
    language: Language;
    changeLanguage: (lng: Language) => void;
}

const i18n = new I18n(transltns);
i18n.defaultLocale = "en";
i18n.enableFallback = true;

const LanguageContext = createContext<LanguageContextProps | null>(null);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage debe usarse dentro de LanguageProvider");
    return context;
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>("es");

    useEffect(() => {
        const loadLanguage = async () => {
            const storedLanguage = await AsyncStorage.getItem("language");
            if (storedLanguage) {
                setLanguage(storedLanguage as Language);
                i18n.locale = storedLanguage;
            }
        };
        loadLanguage();
    }, []);

    const changeLanguage = async (lng: Language) => {
        setLanguage(lng);
        i18n.locale = lng;
        await AsyncStorage.setItem("language", lng);
    }

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export { i18n }