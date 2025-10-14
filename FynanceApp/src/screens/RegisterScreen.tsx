import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  useTheme,
  Checkbox,
  Snackbar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu nome');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, informe um email válido');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (!agreeTerms) {
      Alert.alert('Erro', 'Você deve concordar com os termos de uso');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // TODO: Implementar registro real
      // Simulando registro por enquanto
      await new Promise<void>(resolve => setTimeout(resolve, 1500));
      
      console.log('Registro realizado:', formData);
      
      Alert.alert(
        'Sucesso!', 
        'Conta criada com sucesso! Você será redirecionado para o app.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navegar direto para o app principal
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' as any }],
              });
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
          💰 Fynance
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.outline }]}>
          Crie sua conta gratuita
        </Text>
      </View>

      {/* Register Form */}
      <Card style={styles.registerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.registerTitle}>
            Criar nova conta
          </Text>

          <TextInput
            label="Nome completo"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            mode="outlined"
            style={styles.input}
            autoCapitalize="words"
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Senha"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
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

          <TextInput
            label="Confirmar senha"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          {/* Terms Checkbox */}
          <View style={styles.termsContainer}>
            <Checkbox
              status={agreeTerms ? 'checked' : 'unchecked'}
              onPress={() => setAgreeTerms(!agreeTerms)}
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" style={styles.termsText}>
              Eu concordo com os{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Termos de Uso
              </Text>
              {' '}e{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Política de Privacidade
              </Text>
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Criando conta...' : 'Criar conta gratuita'}
          </Button>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text variant="bodyMedium" style={styles.loginText}>
              Já tem uma conta?{' '}
            </Text>
            <Button
              mode="text"
              onPress={handleLogin}
              style={styles.loginButton}
              labelStyle={styles.loginButtonLabel}
            >
              Fazer login
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Benefits */}
      <Card style={styles.benefitsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.benefitsTitle}>
            🎯 Por que escolher o Fynance?
          </Text>
          
          <View style={styles.benefitItem}>
            <Text variant="bodyMedium">💰 Controle total dos seus gastos</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text variant="bodyMedium">📊 Relatórios detalhados e gráficos</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text variant="bodyMedium">🎯 Metas financeiras personalizadas</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text variant="bodyMedium">🏆 Sistema de conquistas motivacional</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text variant="bodyMedium">🔒 Dados seguros e privados</Text>
          </View>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  registerCard: {
    marginBottom: 24,
  },
  registerTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingRight: 8,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  registerButton: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
  },
  loginButton: {
    marginLeft: -8,
  },
  loginButtonLabel: {
    fontWeight: 'bold',
  },
  benefitsCard: {
    marginBottom: 24,
  },
  benefitsTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  benefitItem: {
    marginBottom: 8,
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default RegisterScreen;
