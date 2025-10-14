import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Context
import { AuthProvider } from './src/contexts/AuthContext';

// Theme
import { theme } from './src/styles/theme';

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;