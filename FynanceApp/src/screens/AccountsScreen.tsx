import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { 
  Text, 
  Card, 
  FAB, 
  useTheme, 
  Button,
  Divider,
  Menu,
  IconButton
} from 'react-native-paper';
import { Account } from '../types';
import { mockAccounts } from '../data/mockData';

const AccountsScreen = () => {
  const theme = useTheme();
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      'checking': 'Conta Corrente',
      'savings': 'Poupança',
      'investment': 'Investimento'
    };
    return types[type as keyof typeof types] || type;
  };

  const getAccountIcon = (type: string) => {
    const icons = {
      'checking': 'bank',
      'savings': 'piggy-bank',
      'investment': 'trending-up'
    };
    return icons[type as keyof typeof icons] || 'bank';
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const toggleMenu = (accountId: string) => {
    setMenuVisible(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const handleAddAccount = () => {
    console.log('Adicionar nova conta');
    // TODO: Navigate to AddAccountScreen
  };

  const handleEditAccount = (accountId: string) => {
    console.log('Editar conta:', accountId);
    setMenuVisible(prev => ({ ...prev, [accountId]: false }));
    // TODO: Navigate to EditAccountScreen
  };

  const handleViewDetails = (accountId: string) => {
    console.log('Ver detalhes da conta:', accountId);
    setMenuVisible(prev => ({ ...prev, [accountId]: false }));
    // TODO: Navigate to AccountDetailsScreen
  };

  const handleDeleteAccount = (accountId: string) => {
    console.log('Excluir conta:', accountId);
    setMenuVisible(prev => ({ ...prev, [accountId]: false }));
    // TODO: Show confirmation dialog and delete account
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Minhas Contas
        </Text>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Patrimônio Total
            </Text>
            <Text variant="displayMedium" style={[styles.totalBalance, { color: theme.colors.primary }]}>
              {formatCurrency(getTotalBalance())}
            </Text>
            <Text variant="bodyMedium" style={[styles.accountCount, { color: theme.colors.outline }]}>
              {accounts.length} {accounts.length === 1 ? 'conta cadastrada' : 'contas cadastradas'}
            </Text>
          </Card.Content>
        </Card>

        {/* Accounts List */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          📋 Suas Contas
        </Text>

        {accounts.map((account) => (
          <Card key={account.id} style={styles.accountCard}>
            <Card.Content>
              <View style={styles.accountHeader}>
                <View style={styles.accountInfo}>
                  <View style={styles.accountTitleRow}>
                    <Text variant="titleMedium" style={styles.accountName}>
                      {account.name}
                    </Text>
                    <Menu
                      visible={menuVisible[account.id] || false}
                      onDismiss={() => toggleMenu(account.id)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          onPress={() => toggleMenu(account.id)}
                        />
                      }
                    >
                      <Menu.Item 
                        onPress={() => handleViewDetails(account.id)} 
                        title="Ver detalhes" 
                        leadingIcon="eye"
                      />
                      <Menu.Item 
                        onPress={() => handleEditAccount(account.id)} 
                        title="Editar" 
                        leadingIcon="pencil"
                      />
                      <Divider />
                      <Menu.Item 
                        onPress={() => handleDeleteAccount(account.id)} 
                        title="Excluir" 
                        leadingIcon="delete"
                        titleStyle={{ color: theme.colors.error }}
                      />
                    </Menu>
                  </View>
                  
                  <Text variant="bodyMedium" style={[styles.accountBank, { color: theme.colors.outline }]}>
                    {account.bankName} • {getAccountTypeLabel(account.type)}
                  </Text>
                  
                  <Text variant="bodySmall" style={[styles.accountNumber, { color: theme.colors.outline }]}>
                    Conta: {account.accountNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.balanceContainer}>
                <Text variant="bodyMedium" style={styles.balanceLabel}>
                  Saldo Atual
                </Text>
                <Text 
                  variant="headlineSmall" 
                  style={[
                    styles.balance,
                    { color: account.balance >= 0 ? theme.colors.primary : theme.colors.error }
                  ]}
                >
                  {formatCurrency(account.balance)}
                </Text>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <Button
                  mode="outlined"
                  style={styles.actionButton}
                  icon="plus"
                  onPress={() => console.log('Adicionar transação para:', account.id)}
                >
                  Transação
                </Button>
                <Button
                  mode="outlined"
                  style={styles.actionButton}
                  icon="swap-horizontal"
                  onPress={() => console.log('Transferir de:', account.id)}
                >
                  Transferir
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="headlineSmall" style={styles.emptyIcon}>
                🏦
              </Text>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhuma conta cadastrada
              </Text>
              <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.outline }]}>
                Adicione suas contas bancárias para começar a controlar suas finanças
              </Text>
              <Button
                mode="contained"
                style={styles.emptyButton}
                onPress={handleAddAccount}
                icon="plus"
              >
                Adicionar primeira conta
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.tipsTitle}>
              💡 Dicas para Organizar suas Contas
            </Text>
            
            <Text variant="bodyMedium" style={styles.tipText}>
              • Mantenha contas separadas para diferentes objetivos
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              • Use a poupança para reserva de emergência
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              • Considere contas de investimento para metas de longo prazo
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              • Monitore os saldos regularmente para evitar surpresas
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddAccount}
        label="Nova Conta"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    margin: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  totalBalance: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  accountCount: {
    textAlign: 'center',
    fontSize: 14,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  accountCard: {
    margin: 16,
    marginTop: 8,
  },
  accountHeader: {
    marginBottom: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountName: {
    fontWeight: 'bold',
    flex: 1,
  },
  accountBank: {
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 12,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  balanceLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  balance: {
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    margin: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  tipsCard: {
    margin: 16,
    marginTop: 24,
    marginBottom: 80,
  },
  tipsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tipText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AccountsScreen;






