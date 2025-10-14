import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Customize themes
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ea',
    primaryContainer: '#bb86fc',
    secondary: '#03dac6',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    primaryContainer: '#6200ea',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#2d2d2d',
    onSurface: '#ffffff',
    onBackground: '#ffffff',
  },
};

// Navigation themes
const { LightTheme: NavigationLightTheme, DarkTheme: NavigationDarkTheme } = 
  adaptNavigationTheme({
    reactNavigationLight: DefaultTheme,
    reactNavigationDark: DarkTheme,
  });

interface ThemeContextData {
  isDarkTheme: boolean;
  paperTheme: typeof lightTheme;
  navigationTheme: typeof NavigationLightTheme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@fynance:theme');
      if (savedTheme !== null) {
        setIsDarkTheme(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    }
  };

  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem('@fynance:theme', JSON.stringify(isDark));
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (isDark: boolean) => {
    setIsDarkTheme(isDark);
    saveThemePreference(isDark);
  };

  const paperTheme = isDarkTheme ? darkTheme : lightTheme;
  const navigationTheme = isDarkTheme ? NavigationDarkTheme : NavigationLightTheme;

  return (
    <ThemeContext.Provider value={{
      isDarkTheme,
      paperTheme,
      navigationTheme,
      toggleTheme,
      setTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};






