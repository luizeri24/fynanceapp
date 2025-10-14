import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  List,
  Divider,
  Switch,
  Snackbar,
  ProgressBar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { backupService, ExportOptions } from '../services/backupService';
import { mockTransactions } from '../data/mockData';

type BackupScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const BackupScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<BackupScreenNavigationProp>();
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [backupInfo, setBackupInfo] = useState<any>(null);
  
  // Export options
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeTransactions: true,
    includeGoals: true,
    includeAccounts: true,
    includeCreditCards: true,
    includeSettings: true
  });

  useEffect(() => {
    loadBackupInfo();
  }, []);

  const loadBackupInfo = async () => {
    try {
      const info = await backupService.getBackupInfo();
      setBackupInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações de backup:', error);
    }
  };

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const simulateProgress = async (duration: number = 3000) => {
    const steps = 20;
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      setProgress(i / steps);
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
  };

  const handleExportJSON = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      await simulateProgress(2000);
      
      const jsonContent = await backupService.exportToJSON(exportOptions);
      
      Alert.alert(
        'Backup Criado',
        'Deseja compartilhar o arquivo de backup?',
        [
          { text: 'Não', style: 'cancel' },
          { 
            text: 'Compartilhar', 
            onPress: async () => {
              try {
                await backupService.shareBackup(jsonContent, 'json');
                showMessage('Backup compartilhado com sucesso!');
              } catch (error) {
                showMessage('Erro ao compartilhar backup');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      showMessage('Erro ao criar backup');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      await simulateProgress(1500);
      
      const csvContent = await backupService.exportTransactionsToCSV(mockTransactions);
      
      Alert.alert(
        'Planilha Criada',
        'Deseja compartilhar a planilha de transações?',
        [
          { text: 'Não', style: 'cancel' },
          { 
            text: 'Compartilhar', 
            onPress: async () => {
              try {
                await backupService.shareBackup(csvContent, 'csv');
                showMessage('Planilha compartilhada com sucesso!');
              } catch (error) {
                showMessage('Erro ao compartilhar planilha');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      showMessage('Erro ao criar planilha');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      await simulateProgress(2500);
      
      const reportContent = await backupService.generateSummaryReport();
      
      Alert.alert(
        'Relatório Gerado',
        'Relatório financeiro criado com sucesso. Deseja compartilhar?',
        [
          { text: 'Não', style: 'cancel' },
          { 
            text: 'Compartilhar', 
            onPress: async () => {
              try {
                await backupService.shareBackup(reportContent, 'csv');
                showMessage('Relatório compartilhado com sucesso!');
              } catch (error) {
                showMessage('Erro ao compartilhar relatório');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      showMessage('Erro ao gerar relatório');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleCleanOldBackups = async () => {
    Alert.alert(
      'Limpar Backups Antigos',
      'Remover backups com mais de 30 dias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await backupService.cleanOldBackups(30);
              showMessage('Backups antigos removidos!');
            } catch (error) {
              showMessage('Erro ao limpar backups');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          💾 Backup e Exportação
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.outline }]}>
          Mantenha seus dados seguros e acessíveis
        </Text>
      </View>

      {/* Backup Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📊 Informações de Backup
          </Text>
          
          <List.Item
            title="Último backup"
            description={formatDate(backupInfo?.lastBackup)}
            left={props => <List.Icon {...props} icon="backup-restore" />}
          />
          
          <Divider />
          
          <List.Item
            title="Última importação"
            description={formatDate(backupInfo?.lastImport)}
            left={props => <List.Icon {...props} icon="download" />}
          />
          
          <Divider />
          
          <List.Item
            title="Versão do app"
            description={backupInfo?.appVersion || '1.0.0'}
            left={props => <List.Icon {...props} icon="information" />}
          />
        </Card.Content>
      </Card>

      {/* Progress */}
      {loading && (
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.progressText}>
              Processando... {Math.round(progress * 100)}%
            </Text>
            <ProgressBar 
              progress={progress} 
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>
      )}

      {/* Export Options */}
      <Card style={styles.optionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            ⚙️ Opções de Exportação
          </Text>
          
          <List.Item
            title="Incluir transações"
            description="Histórico completo de movimentações"
            left={props => <List.Icon {...props} icon="credit-card" />}
            right={() => (
              <Switch
                value={exportOptions.includeTransactions}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, includeTransactions: value }))
                }
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Incluir metas"
            description="Objetivos financeiros e progresso"
            left={props => <List.Icon {...props} icon="target" />}
            right={() => (
              <Switch
                value={exportOptions.includeGoals}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, includeGoals: value }))
                }
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Incluir contas"
            description="Contas bancárias e saldos"
            left={props => <List.Icon {...props} icon="bank" />}
            right={() => (
              <Switch
                value={exportOptions.includeAccounts}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, includeAccounts: value }))
                }
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Incluir cartões"
            description="Cartões de crédito e faturas"
            left={props => <List.Icon {...props} icon="credit-card-outline" />}
            right={() => (
              <Switch
                value={exportOptions.includeCreditCards}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, includeCreditCards: value }))
                }
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Incluir configurações"
            description="Preferências e configurações do app"
            left={props => <List.Icon {...props} icon="cog" />}
            right={() => (
              <Switch
                value={exportOptions.includeSettings}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, includeSettings: value }))
                }
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Backup Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🚀 Ações de Backup
          </Text>
          
          <Button
            mode="contained"
            onPress={handleExportJSON}
            style={styles.actionButton}
            loading={loading}
            disabled={loading}
            icon="download"
          >
            Backup Completo (JSON)
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleExportCSV}
            style={styles.actionButton}
            loading={loading}
            disabled={loading}
            icon="table"
          >
            Exportar Transações (CSV)
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleGenerateReport}
            style={styles.actionButton}
            loading={loading}
            disabled={loading}
            icon="file-document"
          >
            Gerar Relatório Resumo
          </Button>
        </Card.Content>
      </Card>

      {/* Maintenance */}
      <Card style={styles.maintenanceCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🧹 Manutenção
          </Text>
          
          <Button
            mode="outlined"
            onPress={handleCleanOldBackups}
            style={styles.actionButton}
            disabled={loading}
            icon="delete"
            textColor={theme.colors.error}
          >
            Limpar Backups Antigos
          </Button>
          
          <Text variant="bodySmall" style={[styles.maintenanceNote, { color: theme.colors.outline }]}>
            Remove backups com mais de 30 dias para liberar espaço
          </Text>
        </Card.Content>
      </Card>

      {/* Info */}
      <Card style={styles.infoBottomCard}>
        <Card.Content>
          <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.outline }]}>
            💡 <Text style={{ fontWeight: 'bold' }}>Dica:</Text> Faça backups regularmente para manter seus dados seguros. Os arquivos são salvos localmente e podem ser compartilhados via email, WhatsApp ou outras formas.
          </Text>
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 20,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  progressCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  optionsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  maintenanceCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#fff3e0',
  },
  infoBottomCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    backgroundColor: '#e8f5e8',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  maintenanceNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  infoText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default BackupScreen;
