import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Card, Text, useTheme, Chip, IconButton, Divider, FAB } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import pluggyService, { PluggyAccount } from '../services/pluggyService';
import { RootStackParamList } from '../types';

type AccountsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const AccountsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AccountsScreenNavigationProp>();
  const [accounts, setAccounts] = useState<PluggyAccount[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar contas
  const loadAccounts = async () => {
    try {
      const cachedAccounts = await pluggyService.getCachedAccounts();
      console.log('🏦 Contas carregadas:', cachedAccounts.length);
      setAccounts(cachedAccounts);
    } catch (error) {
      console.error('❌ Erro ao carregar contas:', error);
    }
  };

  // Recarregar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  // Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAccounts();
    setIsRefreshing(false);
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular saldo total
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

  // Separar contas por tipo
  const bankAccounts = accounts.filter(acc => acc.type === 'BANK');
  const creditCards = accounts.filter(acc => acc.type === 'CREDIT');

  // Ícone por tipo de conta
  const getAccountIcon = (type: string, subtype?: string) => {
    if (type === 'CREDIT') return 'credit-card';
    if (subtype === 'CHECKING_ACCOUNT') return 'bank';
    if (subtype === 'SAVINGS_ACCOUNT') return 'piggy-bank';
    return 'wallet';
  };

  // Cor por tipo de conta
  const getAccountColor = (type: string) => {
    if (type === 'CREDIT') return '#9c27b0';
    return theme.colors.primary;
  };

  // Nome do tipo de conta
  const getAccountTypeName = (type: string, subtype?: string) => {
    if (type === 'CREDIT') return 'Cartão de Crédito';
    if (subtype === 'CHECKING_ACCOUNT') return 'Conta Corrente';
    if (subtype === 'SAVINGS_ACCOUNT') return 'Conta Poupança';
    return 'Conta';
  };

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Text variant="headlineSmall" style={styles.title}>
          🏦 Minhas Contas
        </Text>

        {/* Resumo Geral */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Resumo Geral
            </Text>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Total de Contas
                </Text>
                <Text variant="displaySmall" style={styles.summaryValue}>
                  {accounts.length}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Saldo Total
                </Text>
                <Text variant="titleLarge" style={[styles.summaryValue, { color: theme.colors.primary }]}>
                  {formatCurrency(totalBalance)}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Contas Bancárias
                </Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {bankAccounts.length}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Cartões
                </Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {creditCards.length}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Contas Bancárias */}
        {bankAccounts.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Contas Bancárias
            </Text>
            {bankAccounts.map((account) => (
              <Card key={account.id} style={styles.accountCard}>
                <Card.Content>
                  <View style={styles.accountHeader}>
                    <View style={styles.accountHeaderLeft}>
                      <IconButton
                        icon={getAccountIcon(account.type, account.subtype)}
                        size={24}
                        iconColor="#fff"
                        style={[styles.accountIcon, { backgroundColor: getAccountColor(account.type) }]}
                      />
                      <View>
                        <Text variant="titleMedium" style={styles.accountName}>
                          {account.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.accountNumber}>
                          {account.number}
                        </Text>
                      </View>
                    </View>
                    
                    <Chip
                      style={styles.typeChip}
                      textStyle={styles.typeChipText}
                      compact
                    >
                      {getAccountTypeName(account.type, account.subtype)}
                    </Chip>
                  </View>

                  <Divider style={styles.accountDivider} />

                  <View style={styles.balanceContainer}>
                    <Text variant="bodySmall" style={styles.balanceLabel}>
                      Saldo Disponível
                    </Text>
                    <Text variant="headlineSmall" style={[styles.balanceValue, { color: theme.colors.primary }]}>
                      {formatCurrency(account.balance || 0)}
                    </Text>
                  </View>

                  {/* @ts-ignore - bankData pode existir */}
                  {account.bankData && (
                    <View style={styles.extraInfo}>
                      {/* @ts-ignore */}
                      {account.bankData.transferNumber && (
                        <View style={styles.infoRow}>
                          <Text variant="bodySmall" style={styles.infoLabel}>
                            Dados para Transferência:
                          </Text>
                          <Text variant="bodySmall" style={styles.infoValue}>
                            {/* @ts-ignore */}
                            {account.bankData.transferNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* Cartões de Crédito */}
        {creditCards.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cartões de Crédito
            </Text>
            {creditCards.map((account) => (
              <Card key={account.id} style={styles.accountCard}>
                <Card.Content>
                  <View style={styles.accountHeader}>
                    <View style={styles.accountHeaderLeft}>
                      <IconButton
                        icon={getAccountIcon(account.type, account.subtype)}
                        size={24}
                        iconColor="#fff"
                        style={[styles.accountIcon, { backgroundColor: getAccountColor(account.type) }]}
                      />
                      <View>
                        <Text variant="titleMedium" style={styles.accountName}>
                          {account.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.accountNumber}>
                          •••• {account.number}
                        </Text>
                      </View>
                    </View>
                    
                    <Chip
                      style={[styles.typeChip, { backgroundColor: '#f3e5f5' }]}
                      textStyle={[styles.typeChipText, { color: '#9c27b0' }]}
                      compact
                    >
                      Cartão
                    </Chip>
                  </View>

                  <Divider style={styles.accountDivider} />

                  <View style={styles.balanceContainer}>
                    <Text variant="bodySmall" style={styles.balanceLabel}>
                      Fatura Atual
                    </Text>
                    <Text variant="headlineSmall" style={[styles.balanceValue, { color: '#f44336' }]}>
                      {formatCurrency(account.balance || 0)}
                    </Text>
                  </View>

                  {/* @ts-ignore - creditData pode existir */}
                  {account.creditData && (
                    <View style={styles.extraInfo}>
                      <View style={styles.infoRow}>
                        <Text variant="bodySmall" style={styles.infoLabel}>
                          Limite Disponível:
                        </Text>
                        <Text variant="bodyMedium" style={[styles.infoValue, { color: '#4caf50' }]}>
                          {/* @ts-ignore */}
                          {formatCurrency(account.creditData.availableCreditLimit || 0)}
                        </Text>
                      </View>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* Empty State */}
        {accounts.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <IconButton
                icon="bank-off"
                size={48}
                iconColor="#999"
              />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhuma conta encontrada
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Conecte uma conta bancária para ver suas contas
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* FAB para conectar nova conta */}
      <FAB
        icon="plus"
        label="Conectar Conta"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ConnectBank')}
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
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 40,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  accountCard: {
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    margin: 0,
    marginRight: 12,
  },
  accountName: {
    fontWeight: 'bold',
  },
  accountNumber: {
    color: '#666',
  },
  typeChip: {
    height: 24,
    backgroundColor: '#e3f2fd',
  },
  typeChipText: {
    fontSize: 10,
    color: '#1976d2',
  },
  accountDivider: {
    marginBottom: 12,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  balanceLabel: {
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontWeight: 'bold',
  },
  extraInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: '500',
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AccountsScreen;
