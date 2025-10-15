import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Card, Text, useTheme, Chip, IconButton, Divider, List } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import pluggyService, { PluggyTransaction } from '../services/pluggyService';

const SmartAnalysisScreen = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<PluggyTransaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);

  // Carregar dados e gerar insights
  const loadDataAndAnalyze = async () => {
    try {
      const cachedTransactions = await pluggyService.getCachedTransactions();
      const cachedAccounts = await pluggyService.getCachedAccounts();
      
      setTransactions(cachedTransactions);
      setAccounts(cachedAccounts);

      // Gerar insights
      generateInsights(cachedTransactions, cachedAccounts);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
  };

  // Gerar insights baseados nos dados
  const generateInsights = (txs: PluggyTransaction[], accs: any[]) => {
    const newInsights = [];

    // 1. Análise de Gastos por Categoria
    const categorySpending: Record<string, number> = {};
    txs.filter(t => t.amount < 0).forEach(t => {
      const category = t.category || 'Outros';
      categorySpending[category] = (categorySpending[category] || 0) + Math.abs(t.amount);
    });

    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      newInsights.push({
        id: '1',
        type: 'spending',
        icon: 'chart-pie',
        title: 'Maior Categoria de Gastos',
        description: `Você gastou mais em ${topCategory[0]}: ${formatCurrency(topCategory[1])}`,
        color: '#f44336',
        priority: 'high'
      });
    }

    // 2. Média de Gastos Diários
    const debits = txs.filter(t => t.amount < 0);
    const totalSpent = debits.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const avgDaily = totalSpent / 30; // Aproximadamente 30 dias
    newInsights.push({
      id: '2',
      type: 'average',
      icon: 'calendar-today',
      title: 'Média de Gastos Diários',
      description: `Você gasta em média ${formatCurrency(avgDaily)} por dia`,
      color: '#ff9800',
      priority: 'medium'
    });

    // 3. Análise de Saldo
    const totalBalance = accs.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    if (totalBalance > 0) {
      const daysUntilZero = Math.floor(totalBalance / avgDaily);
      newInsights.push({
        id: '3',
        type: 'balance',
        icon: 'wallet',
        title: 'Projeção de Saldo',
        description: `Com seus gastos atuais, seu saldo durará aproximadamente ${daysUntilZero} dias`,
        color: totalBalance > avgDaily * 30 ? '#4caf50' : '#ff9800',
        priority: totalBalance > avgDaily * 30 ? 'low' : 'high'
      });
    }

    // 4. Transações Recorrentes
    const descriptions: Record<string, number> = {};
    txs.forEach(t => {
      descriptions[t.description] = (descriptions[t.description] || 0) + 1;
    });
    const recurring = Object.entries(descriptions).filter(([_, count]) => count > 2);
    if (recurring.length > 0) {
      newInsights.push({
        id: '4',
        type: 'recurring',
        icon: 'repeat',
        title: 'Gastos Recorrentes Detectados',
        description: `Identificamos ${recurring.length} gastos que se repetem. Considere criar alertas ou metas para eles.`,
        color: '#2196f3',
        priority: 'medium'
      });
    }

    // 5. Maior Transação
    const largestDebit = debits.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
    if (largestDebit) {
      newInsights.push({
        id: '5',
        type: 'largest',
        icon: 'alert-circle',
        title: 'Maior Gasto do Período',
        description: `${largestDebit.description}: ${formatCurrency(Math.abs(largestDebit.amount))}`,
        color: '#f44336',
        priority: 'high'
      });
    }

    // 6. Análise de Créditos
    const credits = txs.filter(t => t.amount > 0);
    const totalIncome = credits.reduce((sum, t) => sum + t.amount, 0);
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100;
      newInsights.push({
        id: '6',
        type: 'savings',
        icon: 'piggy-bank',
        title: 'Taxa de Economia',
        description: `Você está economizando ${savingsRate.toFixed(1)}% da sua renda`,
        color: savingsRate > 20 ? '#4caf50' : savingsRate > 10 ? '#ff9800' : '#f44336',
        priority: savingsRate > 20 ? 'low' : 'high'
      });
    }

    // 7. Dica de Economia
    if (avgDaily > 100) {
      const potentialSavings = avgDaily * 0.1; // 10% de economia
      newInsights.push({
        id: '7',
        type: 'tip',
        icon: 'lightbulb-on',
        title: '💡 Dica de Economia',
        description: `Se você reduzir seus gastos em apenas 10%, poderá economizar ${formatCurrency(potentialSavings * 30)} por mês!`,
        color: '#9c27b0',
        priority: 'medium'
      });
    }

    // 8. Análise de Cartão de Crédito
    const creditCards = accs.filter(acc => acc.type === 'CREDIT');
    if (creditCards.length > 0) {
      const totalCreditUsed = creditCards.reduce((sum, card) => sum + (card.balance || 0), 0);
      newInsights.push({
        id: '8',
        type: 'credit',
        icon: 'credit-card',
        title: 'Uso de Cartão de Crédito',
        description: `Você tem ${formatCurrency(totalCreditUsed)} em faturas de cartão de crédito`,
        color: totalCreditUsed > 1000 ? '#f44336' : '#4caf50',
        priority: totalCreditUsed > 1000 ? 'high' : 'low'
      });
    }

    setInsights(newInsights);
  };

  useFocusEffect(
    useCallback(() => {
      loadDataAndAnalyze();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDataAndAnalyze();
    setIsRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Ordenar insights por prioridade
  const sortedInsights = insights.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority as keyof typeof priority] - priority[b.priority as keyof typeof priority];
  });

  return (
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
        🤖 Análise Inteligente
      </Text>

      {/* Resumo Rápido */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.summaryTitle}>
            📊 Resumo Rápido
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <IconButton icon="chart-line" size={24} iconColor={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Transações
              </Text>
              <Text variant="titleMedium" style={styles.summaryValue}>
                {transactions.length}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.summaryItem}>
              <IconButton icon="bank" size={24} iconColor={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Contas
              </Text>
              <Text variant="titleMedium" style={styles.summaryValue}>
                {accounts.length}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.summaryItem}>
              <IconButton icon="lightbulb-on" size={24} iconColor={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Insights
              </Text>
              <Text variant="titleMedium" style={styles.summaryValue}>
                {insights.length}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Insights */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        💡 Insights Personalizados
      </Text>

      {sortedInsights.length > 0 ? (
        sortedInsights.map((insight) => (
          <Card key={insight.id} style={styles.insightCard}>
            <Card.Content>
              <View style={styles.insightHeader}>
                <View style={styles.insightHeaderLeft}>
                  <IconButton
                    icon={insight.icon}
                    size={24}
                    iconColor="#fff"
                    style={[styles.insightIcon, { backgroundColor: insight.color }]}
                  />
                  <View style={styles.insightTitleContainer}>
                    <Text variant="titleMedium" style={styles.insightTitle}>
                      {insight.title}
                    </Text>
                    <Chip
                      style={[
                        styles.priorityChip,
                        {
                          backgroundColor: 
                            insight.priority === 'high' ? '#ffebee' :
                            insight.priority === 'medium' ? '#fff3e0' :
                            '#e8f5e9'
                        }
                      ]}
                      textStyle={{
                        color: 
                          insight.priority === 'high' ? '#f44336' :
                          insight.priority === 'medium' ? '#ff9800' :
                          '#4caf50',
                        fontSize: 10
                      }}
                      compact
                    >
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Chip>
                  </View>
                </View>
              </View>
              <Text variant="bodyMedium" style={styles.insightDescription}>
                {insight.description}
              </Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <IconButton icon="robot-outline" size={48} iconColor="#999" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              Analisando seus dados...
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Conecte uma conta bancária para receber insights personalizados
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Dicas Gerais */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        📚 Dicas Financeiras
      </Text>

      <List.Section>
        <List.Item
          title="Regra 50-30-20"
          description="50% necessidades, 30% desejos, 20% poupança"
          left={props => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Fundo de Emergência"
          description="Mantenha 3-6 meses de despesas guardados"
          left={props => <List.Icon {...props} icon="shield-check" />}
        />
        <List.Item
          title="Evite Dívidas"
          description="Pague suas faturas em dia para evitar juros"
          left={props => <List.Icon {...props} icon="alert-circle" />}
        />
      </List.Section>
    </ScrollView>
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
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#666',
    marginTop: -8,
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 60,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  insightCard: {
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  insightIcon: {
    margin: 0,
    marginRight: 12,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priorityChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  insightDescription: {
    color: '#666',
    lineHeight: 20,
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
});

export default SmartAnalysisScreen;
