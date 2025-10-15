import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import CardsScreen from '../screens/CardsScreen';
import CardDetailsScreen from '../screens/CardDetailsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import AccountsScreen from '../screens/AccountsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SmartAnalysisScreen from '../screens/SmartAnalysisScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import AddFundsScreen from '../screens/AddFundsScreen';
import BackupScreen from '../screens/BackupScreen';
import ConnectBankScreen from '../screens/ConnectBankScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import LoansScreen from '../screens/LoansScreen';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const CardsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Cartões" 
        component={CardsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CardDetails" 
        component={CardDetailsScreen}
        options={{ 
          title: 'Detalhes do Cartão',
          headerBackTitle: 'Voltar'
        }}
      />
    </Stack.Navigator>
  );
};

const GoalsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="GoalsMain" 
        component={GoalsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateGoal" 
        component={CreateGoalScreen}
        options={{ 
          title: 'Nova Meta',
          headerBackTitle: 'Voltar'
        }}
      />
      <Stack.Screen 
        name="AddFunds" 
        component={AddFundsScreen}
        options={{ 
          title: 'Adicionar Fundos',
          headerBackTitle: 'Voltar'
        }}
      />
      <Stack.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{ 
          title: 'Conquistas',
          headerBackTitle: 'Voltar'
        }}
      />
    </Stack.Navigator>
  );
};

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>
        }}
      />
      <Tab.Screen 
        name="SmartAnalysis" 
        component={SmartAnalysisScreen}
        options={{
          title: 'Análise IA',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🤖</Text>
        }}
      />
      <Tab.Screen 
        name="Cards" 
        component={CardsStack} 
        options={{ 
          title: 'Cartões', 
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💳</Text>
        }}
      />
      <Tab.Screen 
        name="Metas" 
        component={GoalsStack} 
        options={{ 
          title: 'Metas', 
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎯</Text>
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
};

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6200ea" />
    <Text style={styles.loadingText}>💰 Fynance</Text>
    <Text style={styles.loadingSubtext}>Carregando...</Text>
  </View>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Tela de loading durante verificação de autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="AddTransaction" 
            component={AddTransactionScreen}
            options={{ 
              presentation: 'modal',
              title: 'Nova Transação',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ 
              title: 'Notificações',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Transactions" 
            component={TransactionsScreen}
            options={{ 
              title: 'Todas as Transações',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Investments" 
            component={InvestmentsScreen}
            options={{ 
              title: 'Investimentos',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Loans" 
            component={LoansScreen}
            options={{ 
              title: 'Empréstimos',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Relatórios" 
            component={ReportsScreen}
            options={{ 
              title: 'Relatórios',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Contas" 
            component={AccountsScreen}
            options={{ 
              title: 'Contas',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Backup" 
            component={BackupScreen}
            options={{ 
              title: 'Backup e Export',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="ConnectBank" 
            component={ConnectBankScreen}
            options={{ 
              title: 'Open Finance',
              headerShown: true
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#6200ea',
  },
  loadingSubtext: {
    fontSize: 16,
    marginTop: 8,
    color: '#666',
  },
});

export default AppNavigator;