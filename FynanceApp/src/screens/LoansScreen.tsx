import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Card, Text, useTheme, Chip, IconButton, Divider, FAB, ProgressBar } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import pluggyService, { PluggyAccount } from '../services/pluggyService';
import { RootStackParamList } from '../types';

type LoansScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const LoansScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<LoansScreenNavigationProp>();
  const [loans, setLoans] = useState<PluggyAccount[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar empréstimos
  const loadLoans = async () => {
    try {
      const cachedAccounts = await pluggyService.getCachedAccounts();
      console.log('💵 Todas as contas:', cachedAccounts.length);
      console.log('💵 Tipos de contas encontrados:', cachedAccounts.map(acc => ({ type: acc.type, subtype: acc.subtype, name: acc.name })));
      
      // Filtrar empréstimos - verificar diferentes tipos possíveis
      const loanAccounts = cachedAccounts.filter(account => {
        const type = account.type?.toUpperCase();
        const subtype = account.subtype?.toUpperCase();
        const name = account.name?.toUpperCase();
        
        return type === 'LOAN' || 
               subtype === 'LOAN' ||
               name?.includes('EMPRÉSTIMO') ||
               name?.includes('CRÉDITO') ||
               name?.includes('FINANCIAMENTO') ||
               name?.includes('PESSOAL') ||
               name?.includes('CONSIGNADO');
      });
      
      console.log('💵 Empréstimos filtrados:', loanAccounts.length);
      console.log('💵 Empréstimos encontrados:', loanAccounts.map(acc => ({ type: acc.type, subtype: acc.subtype, name: acc.name })));
      
      setLoans(loanAccounts);
    } catch (error) {
      console.error('❌ Erro ao carregar empréstimos:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLoans();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLoans();
    setIsRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular totais
  const totalDebt = loans.reduce((sum, loan) => sum + Math.abs(loan.balance || 0), 0);

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
          💵 Meus Empréstimos
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
                  Dívida Total
                </Text>
                <Text variant="displaySmall" style={[styles.summaryValue, { color: '#f44336' }]}>
                  {formatCurrency(totalDebt)}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Empréstimos Ativos
                </Text>
                <Text variant="displaySmall" style={styles.summaryValue}>
                  {loans.length}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Lista de Empréstimos */}
        {loans.length > 0 ? (
          loans.map((loan) => {
            // @ts-ignore - loanData pode existir
            const loanData = loan.loanData || {};
            const progress = loanData.amountPaid && loanData.totalAmount 
              ? loanData.amountPaid / loanData.totalAmount 
              : 0;

            return (
              <Card key={loan.id} style={styles.loanCard}>
                <Card.Content>
                  {/* Header */}
                  <View style={styles.loanHeader}>
                    <View style={styles.loanHeaderLeft}>
                      <IconButton
                        icon="cash-multiple"
                        size={24}
                        iconColor="#fff"
                        style={[styles.loanIcon, { backgroundColor: '#f44336' }]}
                      />
                      <View>
                        <Text variant="titleMedium" style={styles.loanName}>
                          {loan.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.loanNumber}>
                          {loan.number || loan.id.substring(0, 8)}
                        </Text>
                      </View>
                    </View>
                    
                    <Chip
                      style={[styles.statusChip, { backgroundColor: '#ffebee' }]}
                      textStyle={{ color: '#f44336', fontSize: 10 }}
                      compact
                    >
                      Ativo
                    </Chip>
                  </View>

                  <Divider style={styles.loanDivider} />

                  {/* Valor Devido */}
                  <View style={styles.debtContainer}>
                    <Text variant="bodySmall" style={styles.debtLabel}>
                      Saldo Devedor
                    </Text>
                    <Text variant="headlineSmall" style={[styles.debtValue, { color: '#f44336' }]}>
                      {formatCurrency(Math.abs(loan.balance || 0))}
                    </Text>
                  </View>

                  {/* Informações do Empréstimo */}
                  {loanData && Object.keys(loanData).length > 0 && (
                    <View style={styles.loanInfo}>
                      {loanData.totalAmount && (
                        <View style={styles.infoRow}>
                          <Text variant="bodySmall" style={styles.infoLabel}>
                            Valor Total:
                          </Text>
                          <Text variant="bodyMedium" style={styles.infoValue}>
                            {formatCurrency(loanData.totalAmount)}
                          </Text>
                        </View>
                      )}

                      {loanData.amountPaid && (
                        <View style={styles.infoRow}>
                          <Text variant="bodySmall" style={styles.infoLabel}>
                            Valor Pago:
                          </Text>
                          <Text variant="bodyMedium" style={[styles.infoValue, { color: '#4caf50' }]}>
                            {formatCurrency(loanData.amountPaid)}
                          </Text>
                        </View>
                      )}

                      {loanData.interestRate && (
                        <View style={styles.infoRow}>
                          <Text variant="bodySmall" style={styles.infoLabel}>
                            Taxa de Juros:
                          </Text>
                          <Text variant="bodyMedium" style={styles.infoValue}>
                            {loanData.interestRate}% a.m.
                          </Text>
                        </View>
                      )}

                      {loanData.dueDate && (
                        <View style={styles.infoRow}>
                          <Text variant="bodySmall" style={styles.infoLabel}>
                            Vencimento:
                          </Text>
                          <Text variant="bodyMedium" style={styles.infoValue}>
                            {new Date(loanData.dueDate).toLocaleDateString('pt-BR')}
                          </Text>
                        </View>
                      )}

                      {/* Barra de Progresso */}
                      {progress > 0 && (
                        <View style={styles.progressContainer}>
                          <Text variant="bodySmall" style={styles.progressLabel}>
                            Progresso do Pagamento
                          </Text>
                          <ProgressBar
                            progress={progress}
                            color="#4caf50"
                            style={styles.progressBar}
                          />
                          <Text variant="bodySmall" style={styles.progressText}>
                            {(progress * 100).toFixed(1)}% pago
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <IconButton
                icon="cash-check"
                size={48}
                iconColor="#999"
              />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhum empréstimo encontrado
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Você não possui empréstimos ativos no momento
              </Text>
              <Chip icon="check-circle" style={styles.emptyChip}>
                Situação financeira saudável! 🎉
              </Chip>
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
    backgroundColor: '#ffebee',
  },
  summaryTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    height: 60,
  },
  loanCard: {
    marginBottom: 12,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loanIcon: {
    margin: 0,
    marginRight: 12,
  },
  loanName: {
    fontWeight: 'bold',
  },
  loanNumber: {
    color: '#666',
  },
  statusChip: {
    height: 24,
  },
  loanDivider: {
    marginBottom: 12,
  },
  debtContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  debtLabel: {
    color: '#666',
    marginBottom: 4,
  },
  debtValue: {
    fontWeight: 'bold',
  },
  loanInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressLabel: {
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    textAlign: 'right',
    color: '#666',
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
    marginBottom: 16,
  },
  emptyChip: {
    backgroundColor: '#e8f5e9',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default LoansScreen;

