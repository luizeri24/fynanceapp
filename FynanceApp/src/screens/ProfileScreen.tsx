import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  TextInput,
  Switch,
  List,
  Divider,
  useTheme,
  IconButton,
  Snackbar,
  Dialog,
  Portal
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { authService } from '../services/authService';
import { biometricService } from '../services/biometricService';
import { useNotifications } from '../hooks/useNotifications';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const { isDarkTheme, toggleTheme } = useAppTheme();
  const { 
    notificationSettings, 
    permissionsGranted, 
    updateNotificationSettings,
    sendTestNotification,
    requestPermissions
  } = useNotifications();
  
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [changePasswordDialogVisible, setChangePasswordDialogVisible] = useState(false);
  
  // Settings states
  const [biometrics, setBiometrics] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('');
  
  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    checkBiometricSupport();
    loadBiometricSettings();
  }, []);

  const checkBiometricSupport = async () => {
    const result = await biometricService.isBiometricSupported();
    setBiometricSupported(result.success);
    if (result.biometryType) {
      setBiometryType(biometricService.getBiometryTypeLabel(result.biometryType));
    }
  };

  const loadBiometricSettings = async () => {
    const enabled = await biometricService.isBiometricEnabled();
    setBiometrics(enabled);
  };

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showMessage('Nome é obrigatório');
      return;
    }

    if (!authService.validateEmail(email)) {
      showMessage('Email inválido');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null
      });
      
      setEditing(false);
      showMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      showMessage('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('Nova senha e confirmação não coincidem');
      return;
    }

    const passwordValidation = authService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      showMessage(passwordValidation.message || 'Senha inválida');
      return;
    }

    setLoading(true);
    try {
      // Simular validação da senha atual e alteração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChangePasswordDialogVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Senha alterada com sucesso!');
    } catch (error) {
      showMessage('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      setLoading(true);
      try {
        const success = await biometricService.setBiometricEnabled(true);
        if (success) {
          setBiometrics(true);
          showMessage('Autenticação biométrica habilitada!');
        } else {
          showMessage('Falha ao habilitar autenticação biométrica');
        }
      } catch (error) {
        showMessage('Erro ao configurar biometria');
      } finally {
        setLoading(false);
      }
    } else {
      setBiometrics(false);
      await biometricService.setBiometricEnabled(false);
      showMessage('Autenticação biométrica desabilitada');
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      showMessage('Logout realizado com sucesso');
    } catch (error) {
      showMessage('Erro ao fazer logout');
    } finally {
      setLoading(false);
      setLogoutDialogVisible(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={80}
              label={getInitials(user?.name || 'U')}
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            />
            <IconButton
              icon="camera"
              size={20}
              style={[styles.cameraButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => showMessage('Funcionalidade em desenvolvimento')}
            />
          </View>
          
          <Text variant="headlineSmall" style={styles.userName}>
            {user?.name}
          </Text>
          <Text variant="bodyMedium" style={[styles.userEmail, { color: theme.colors.outline }]}>
            {user?.email}
          </Text>
          
          <View style={styles.headerActions}>
            {!editing ? (
              <Button
                mode="outlined"
                onPress={() => setEditing(true)}
                icon="pencil"
              >
                Editar Perfil
              </Button>
            ) : (
              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={handleCancelEdit}
                  style={styles.cancelButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  loading={loading}
                  disabled={loading}
                >
                  Salvar
                </Button>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Edit Profile Form */}
      {editing && (
        <Card style={styles.editCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Editar Informações
            </Text>
            
            <TextInput
              label="Nome completo"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
            />
            
            <TextInput
              label="Telefone (opcional)"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
            />
          </Card.Content>
        </Card>
      )}

      {/* Account Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🔐 Configurações da Conta
          </Text>
          
          <List.Item
            title="Alterar senha"
            description="Manter sua conta segura"
            left={props => <List.Icon {...props} icon="key" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setChangePasswordDialogVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title="Autenticação biométrica"
            description={
              biometricSupported 
                ? `Login com ${biometryType || 'biometria'}` 
                : 'Não disponível neste dispositivo'
            }
            left={props => <List.Icon {...props} icon="fingerprint" />}
            right={() => (
              <Switch
                value={biometrics}
                onValueChange={handleBiometricToggle}
                disabled={!biometricSupported || loading}
              />
            )}
            disabled={!biometricSupported}
          />
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🎨 Configurações do App
          </Text>
          
          <List.Item
            title="Tema escuro"
            description="Aparência dark para o aplicativo"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkTheme}
                onValueChange={toggleTheme}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Notificações"
            description={
              permissionsGranted 
                ? "Receber alertas e lembretes" 
                : "Permissões não concedidas"
            }
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={() => {
                  if (permissionsGranted) {
                    // Navigate to detailed notification settings
                    showMessage('Configurações detalhadas em desenvolvimento');
                  } else {
                    requestPermissions();
                  }
                }}
                compact
              >
                {permissionsGranted ? 'Configurar' : 'Ativar'}
              </Button>
            )}
          />
          
          {permissionsGranted && (
            <>
              <Divider />
              
              <List.Item
                title="Teste de notificação"
                description="Enviar notificação de teste"
                left={props => <List.Icon {...props} icon="bell-ring" />}
                right={() => (
                  <Button
                    mode="contained"
                    onPress={sendTestNotification}
                    compact
                  >
                    Testar
                  </Button>
                )}
              />
            </>
          )}
          
          <Divider />
          
          <List.Item
            title="Newsletter"
            description="Dicas financeiras por email"
            left={props => <List.Icon {...props} icon="email-newsletter" />}
            right={() => (
              <Switch
                value={newsletter}
                onValueChange={setNewsletter}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Help & Support */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📞 Ajuda & Suporte
          </Text>
          
          <List.Item
            title="Central de ajuda"
            description="Perguntas frequentes e tutoriais"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showMessage('Central de ajuda em desenvolvimento')}
          />
          
          <Divider />
          
          <List.Item
            title="Open Finance"
            description="Conecte suas contas bancárias via Pluggy"
            left={props => <List.Icon {...props} icon="bank-transfer" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              navigation.navigate('ConnectBank');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Backup e Export"
            description="Exportar seus dados financeiros"
            left={props => <List.Icon {...props} icon="backup-restore" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              navigation.navigate('Backup');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Fale conosco"
            description="Entre em contato com o suporte"
            left={props => <List.Icon {...props} icon="message" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showMessage('Chat de suporte em desenvolvimento')}
          />
          
          <Divider />
          
          <List.Item
            title="Avaliar o app"
            description="Compartilhe sua experiência"
            left={props => <List.Icon {...props} icon="star" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showMessage('Redirecionamento para loja em desenvolvimento')}
          />
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={[styles.settingsCard, styles.dangerCard]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            ⚠️ Zona de Perigo
          </Text>
          
          <List.Item
            title="Sair da conta"
            description="Fazer logout do aplicativo"
            titleStyle={{ color: theme.colors.error }}
            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setLogoutDialogVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title="Excluir conta"
            description="Remover permanentemente sua conta"
            titleStyle={{ color: theme.colors.error }}
            left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showMessage('Funcionalidade em desenvolvimento')}
          />
        </Card.Content>
      </Card>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text variant="bodySmall" style={[styles.versionText, { color: theme.colors.outline }]}>
          Fynance v1.0.0
        </Text>
        <Text variant="bodySmall" style={[styles.versionText, { color: theme.colors.outline }]}>
          Desenvolvido com ❤️ para suas finanças
        </Text>
      </View>

      {/* Change Password Dialog */}
      <Portal>
        <Dialog
          visible={changePasswordDialogVisible}
          onDismiss={() => setChangePasswordDialogVisible(false)}
        >
          <Dialog.Title>Alterar Senha</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Senha atual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              style={styles.dialogInput}
              secureTextEntry
              left={<TextInput.Icon icon="lock" />}
            />
            
            <TextInput
              label="Nova senha"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              style={styles.dialogInput}
              secureTextEntry
              left={<TextInput.Icon icon="lock-plus" />}
            />
            
            <TextInput
              label="Confirmar nova senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              style={styles.dialogInput}
              secureTextEntry
              left={<TextInput.Icon icon="lock-check" />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setChangePasswordDialogVisible(false)}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
            >
              Alterar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Logout Confirmation Dialog */}
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
        >
          <Dialog.Title>Confirmar Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Tem certeza que deseja sair da sua conta?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleLogout}
              loading={loading}
              disabled={loading}
              buttonColor={theme.colors.error}
            >
              Sair
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    elevation: 4,
  },
  userName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    textAlign: 'center',
    marginBottom: 20,
  },
  headerActions: {
    width: '100%',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  editCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  settingsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  dangerCard: {
    borderColor: '#ffebee',
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  dialogInput: {
    marginBottom: 12,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 32,
  },
  versionText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default ProfileScreen;
