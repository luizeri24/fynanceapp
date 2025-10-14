import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Card, Text, Divider, FAB, useTheme, Button, IconButton, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BalanceCard from '../components/dashboard/BalanceCard';
import CreditCardSummary from '../components/dashboard/CreditCardSummary';
import SpendingLimit from '../components/dashboard/SpendingLimit';
import TransactionItem from '../components/common/TransactionItem';
import pluggyService, { PluggyAccount } from '../services/pluggyService';
import { 
  mockAccounts, 
  mockCreditCards, 
  mockTransactions 
} from '../data/mockData';
import { RootStackParamList } from '../types';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const DashboardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  
  // Estados para Open Finance
  const [openFinanceAccounts, setOpenFinanceAccounts] = useState<PluggyAccount[]>([]);
  const [isLoadingOpenFinance, setIsLoadingOpenFinance] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const recentTransactions = mockTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleAddTransaction = () => {
    // @ts-ignore - Temporariamente ignorar tipo
    navigation.navigate('AddTransaction');
  };

  const handleNavigateToNotifications = () => {
    // @ts-ignore - Temporariamente ignorar tipo
    navigation.navigate('Notifications');
  };

  const handleNavigateToReports = () => {
    // @ts-ignore - Temporariamente ignorar tipo
    navigation.navigate('Relatórios');
  };

  const handleNavigateToAccounts = () => {
    // @ts-ignore - Temporariamente ignorar tipo
    navigation.navigate('Contas');
  };

  const handleNavigateToBankConnection = () => {
    navigation.navigate('ConnectBank');
  };

  // Carregar dados do Open Finance (apenas do cache local)
  const loadOpenFinanceData = async () => {
    try {
      console.log('📊 Dashboard: Carregando dados do cache local...');
      // Só carrega dados do cache local, não tenta fazer requisições à API
      // pois precisamos de um usuário autenticado via PluggyConnect
      const cachedItems = await pluggyService.getCachedItems();
      console.log('📊 Dashboard: Items em cache:', cachedItems.length);
      
      if (cachedItems.length > 0) {
        // Se há items em cache, tenta carregar as contas também do cache
        const cachedAccounts = await pluggyService.getCachedAccounts();
        setOpenFinanceAccounts(cachedAccounts);
        console.log('📊 Dashboard: Contas em cache:', cachedAccounts.length);
      } else {
        setOpenFinanceAccounts([]);
        console.log('📊 Dashboard: Nenhum dado em cache. Conecte uma conta bancária primeiro.');
      }
    } catch (error) {
      console.error('📊 Dashboard: Erro ao carregar cache:', error);
      setOpenFinanceAccounts([]);
    }
  };

  // Refresh control
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOpenFinanceData();
    setIsRefreshing(false);
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadOpenFinanceData();
  }, []);

  // Calcular saldo total das contas Open Finance
  const getTotalOpenFinanceBalance = () => {
    return openFinanceAccounts.reduce((total, account) => {
      const balance = account.balances.find(b => b.balanceType === 'INTERIM_AVAILABLE') || 
                     account.balances.find(b => b.balanceType === 'AVAILABLE') ||
                     account.balances[0];
      if (balance) {
        return total + parseFloat(balance.balanceAmount.amount);
      }
      return total;
    }, 0);
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#1976d2']}
          />
        }
      >
        {/* Header with notifications */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.welcomeText}>
            Olá! 👋
          </Text>
          <IconButton
            icon="bell"
            size={24}
            onPress={handleNavigateToNotifications}
            style={[styles.notificationButton, { backgroundColor: theme.colors.primaryContainer }]}
          />
        </View>

        <BalanceCard accounts={mockAccounts} />

        {/* Open Finance Accounts Section */}
        {openFinanceAccounts.length > 0 && (
          <Card style={styles.openFinanceCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  🏦 Contas Conectadas (Open Finance)
                </Text>
                <Chip 
                  style={styles.accountCountChip}
                  textStyle={styles.accountCountText}
                >
                  {openFinanceAccounts.length} conta{openFinanceAccounts.length !== 1 ? 's' : ''}
                </Chip>
              </View>
              
              <Text variant="bodyLarge" style={styles.totalBalanceText}>
                Saldo Total: {formatBalance(getTotalOpenFinanceBalance())}
              </Text>

              {openFinanceAccounts.slice(0, 2).map((account, index) => {
                const balance = account.balances.find(b => b.balanceType === 'INTERIM_AVAILABLE') || 
                               account.balances.find(b => b.balanceType === 'AVAILABLE') ||
                               account.balances[0];
                
                return (
                  <View key={account.accountId} style={styles.accountItem}>
                    <View style={styles.accountInfo}>
                      <Text variant="bodyMedium" style={styles.accountName}>
                        {account.nickname || account.account.name}
                      </Text>
                      <Text variant="bodySmall" style={styles.accountNumber}>
                        {account.account.identification}
                      </Text>
                    </View>
                    <View style={styles.accountBalance}>
                      <Text variant="bodyLarge" style={styles.balanceAmount}>
                        {balance ? formatBalance(parseFloat(balance.balanceAmount.amount)) : 'N/A'}
                      </Text>
                      <Chip 
                        style={[
                          styles.accountTypeChip,
                          { backgroundColor: account.accountType === 'CACC' ? '#2196f3' : '#4caf50' }
                        ]}
                        textStyle={styles.accountTypeText}
                      >
                        {account.accountType === 'CACC' ? 'Corrente' : 'Poupança'}
                      </Chip>
                    </View>
                  </View>
                );
              })}

              {openFinanceAccounts.length > 2 && (
                <Button
                  mode="outlined"
                  onPress={handleNavigateToBankConnection}
                  style={styles.viewAllButton}
                  compact
                >
                  Ver Todas as Contas ({openFinanceAccounts.length})
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
        
        <CreditCardSummary creditCards={mockCreditCards} />
        
        <SpendingLimit transactions={mockTransactions} />

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.quickActionsTitle}>
              ⚡ Ações Rápidas
            </Text>
            
            <View style={styles.quickActionsGrid}>
              <Button
                mode="outlined"
                onPress={handleNavigateToReports}
                icon="chart-line"
                style={styles.quickActionButton}
              >
                Relatórios
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleNavigateToAccounts}
                icon="bank"
                style={styles.quickActionButton}
              >
                Contas
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleNavigateToNotifications}
                icon="bell"
                style={styles.quickActionButton}
              >
                Notificações
              </Button>
              
              <Button
                mode="contained"
                onPress={handleNavigateToBankConnection}
                icon="bank"
                style={styles.quickActionButton}
              >
                Open Finance
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.transactionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.transactionsTitle}>
              Transações Recentes
            </Text>
            {recentTransactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <TransactionItem 
                  transaction={transaction}
                  onPress={() => {
                    // TODO: Navigate to transaction details
                    console.log('Transaction pressed:', transaction.id);
                  }}
                />
                {index < recentTransactions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

    <FAB
      icon="plus"
      style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      onPress={handleAddTransaction}
      label="Nova Transação"
    />
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontWeight: 'bold',
  },
  notificationButton: {
    margin: 0,
  },
  quickActionsCard: {
    marginTop: 16,
  },
  quickActionsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 100,
  },
  transactionsCard: {
    marginTop: 16,
    marginBottom: 32,
  },
  transactionsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  openFinanceCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  accountCountChip: {
    backgroundColor: '#e3f2fd',
  },
  accountCountText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalBalanceText: {
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 16,
    textAlign: 'center',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  accountNumber: {
    color: '#666',
    fontSize: 12,
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  accountTypeChip: {
    minWidth: 80,
  },
  accountTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default DashboardScreen;