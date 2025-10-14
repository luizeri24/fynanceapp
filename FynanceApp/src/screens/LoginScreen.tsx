import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  useTheme,
  Divider,
  Snackbar 
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage('Por favor, preencha todos os campos');
      return;
    }

    if (!authService.validateEmail(email)) {
      showMessage('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        showMessage('Login realizado com sucesso!');
        // A navegação será automática via AuthContext
      } else {
        showMessage('Email ou senha incorretos');
      }
    } catch (error) {
      showMessage('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Senha',
      'Funcionalidade em desenvolvimento. Em breve você poderá recuperar sua senha!'
    );
  };

  const fillTestCredentials = () => {
    const testCreds = authService.testCredentials;
    setEmail(testCreds.email);
    setPassword(testCreds.password);
    showMessage('Credenciais de teste preenchidas!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
          💰 Fynance
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.outline }]}>
          Controle suas finanças de forma inteligente
        </Text>
      </View>

      {/* Login Form */}
      <Card style={styles.loginCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.loginTitle}>
            Entrar na sua conta
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <Button
            mode="text"
            onPress={handleForgotPassword}
            style={styles.forgotButton}
          >
            Esqueci minha senha
          </Button>
        </Card.Content>
      </Card>

      {/* Test User */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Text variant="bodyLarge" style={styles.testTitle}>
            🧪 Usuário de Teste
          </Text>
          
          <Button
            mode="outlined"
            onPress={fillTestCredentials}
            style={styles.testButton}
            icon={() => <Text>🚀</Text>}
          >
            Preencher Credenciais de Teste
          </Button>
          
          <Text variant="bodySmall" style={[styles.testInfo, { color: theme.colors.outline }]}>
            Email: teste@fynance.com{'\n'}
            Senha: 123456
          </Text>
        </Card.Content>
      </Card>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <Divider style={styles.divider} />
        <Text variant="bodyMedium" style={[styles.dividerText, { color: theme.colors.outline }]}>
          ou
        </Text>
        <Divider style={styles.divider} />
      </View>

      {/* Register */}
      <Card style={styles.registerCard}>
        <Card.Content>
          <Text variant="bodyLarge" style={styles.registerText}>
            Ainda não tem uma conta?
          </Text>
          <Button
            mode="outlined"
            onPress={handleRegister}
            style={styles.registerButton}
          >
            Criar conta gratuita
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: theme.colors.surface }]}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loginCard: {
    marginBottom: 16,
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotButton: {
    alignSelf: 'center',
  },
  testCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  testTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  testButton: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  testInfo: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  registerCard: {
    marginBottom: 24,
  },
  registerText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  registerButton: {
    paddingVertical: 4,
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default LoginScreen;