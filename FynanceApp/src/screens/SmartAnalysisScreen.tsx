import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Chip,
  ProgressBar,
  List,
  IconButton,
  Divider
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { mockTransactions, mockAccounts, mockGoals } from '../data/mockData';

interface AnalysisInsight {
  id: string;
  type: 'tip' | 'warning' | 'opportunity' | 'achievement' | 'prediction';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  potentialSaving?: number;
  confidence: number;
}

interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  comparison: number; // vs last month
}

interface FinancialScore {
  overall: number;
  spending: number;
  saving: number;
  planning: number;
}

const SmartAnalysisScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [financialScore, setFinancialScore] = useState<FinancialScore>({
    overall: 75,
    spending: 68,
    saving: 82,
    planning: 75
  });

  useEffect(() => {
    generateAnalysis();
  }, [selectedPeriod]);

  const generateAnalysis = async () => {
    setLoading(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate insights based on mock data
    const generatedInsights: AnalysisInsight[] = [
      {
        id: '1',
        type: 'warning',
        title: '🚨 Gasto Excessivo em Alimentação',
        description: 'Você gastou 35% mais em alimentação este mês comparado ao anterior. Considere cozinhar mais em casa.',
        impact: 'high',
        category: 'Alimentação',
        actionable: true,
        potentialSaving: 320,
        confidence: 92
      },
      {
        id: '2',
        type: 'opportunity',
        title: '💡 Oportunidade de Investimento',
        description: 'Com base no seu padrão de poupança, você pode investir R$ 500 mensais em renda fixa.',
        impact: 'high',
        category: 'Investimentos',
        actionable: true,
        potentialSaving: 600,
        confidence: 88
      },
      {
        id: '3',
        type: 'tip',
        title: '🎯 Meta Alcançável',
        description: 'Você está muito próximo de atingir sua meta "Reserva de Emergência". Apenas R$ 350 restantes!',
        impact: 'medium',
        category: 'Metas',
        actionable: true,
        confidence: 95
      },
      {
        id: '4',
        type: 'achievement',
        title: '🏆 Padrão Positivo Detectado',
        description: 'Excelente! Você reduziu gastos em transporte em 25% nos últimos 3 meses.',
        impact: 'medium',
        category: 'Transporte',
        actionable: false,
        confidence: 97
      },
      {
        id: '5',
        type: 'prediction',
        title: '📈 Projeção Financeira',
        description: 'Mantendo o padrão atual, você terá R$ 12.500 poupados até o final do ano.',
        impact: 'low',
        category: 'Planejamento',
        actionable: false,
        confidence: 78
      }
    ];

    // Generate spending patterns
    const patterns: SpendingPattern[] = [
      { category: 'Alimentação', amount: 1240, percentage: 35, trend: 'up', comparison: 15 },
      { category: 'Transporte', amount: 680, percentage: 19, trend: 'down', comparison: -8 },
      { category: 'Entretenimento', amount: 450, percentage: 13, trend: 'stable', comparison: 2 },
      { category: 'Casa', amount: 820, percentage: 23, trend: 'up', comparison: 5 },
      { category: 'Saúde', amount: 320, percentage: 9, trend: 'stable', comparison: -1 }
    ];

    setInsights(generatedInsights);
    setSpendingPatterns(patterns);
    setLoading(false);
  };

  const getInsightIcon = (type: string) => {
    const iconMap = {
      tip: '💡',
      warning: '🚨',
      opportunity: '🎯',
      achievement: '🏆',
      prediction: '📈'
    };
    return iconMap[type as keyof typeof iconMap] || '📊';
  };

  const getInsightColor = (type: string) => {
    const colorMap = {
      tip: '#2196f3',
      warning: '#ff9800',
      opportunity: '#4caf50',
      achievement: '#9c27b0',
      prediction: '#00bcd4'
    };
    return colorMap[type as keyof typeof colorMap] || theme.colors.primary;
  };

  const getImpactColor = (impact: string) => {
    const colorMap = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336'
    };
    return colorMap[impact as keyof typeof colorMap] || theme.colors.outline;
  };

  const getTrendIcon = (trend: string) => {
    const iconMap = {
      up: '📈',
      down: '📉',
      stable: '➡️'
    };
    return iconMap[trend as keyof typeof iconMap] || '➡️';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const periods = [
    { key: 'current_month', label: 'Este Mês' },
    { key: 'last_month', label: 'Mês Passado' },
    { key: 'last_3_months', label: 'Últimos 3 Meses' },
    { key: 'current_year', label: 'Este Ano' }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          🤖 Análise Inteligente
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.outline }]}>
          Insights personalizados sobre suas finanças
        </Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.periodChips}>
            {periods.map(period => (
              <Chip
                key={period.key}
                mode={selectedPeriod === period.key ? 'flat' : 'outlined'}
                selected={selectedPeriod === period.key}
                onPress={() => setSelectedPeriod(period.key)}
                style={styles.periodChip}
              >
                {period.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Financial Score */}
      <Card style={styles.scoreCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            📊 Score Financeiro
          </Text>
          
          <View style={styles.overallScore}>
            <Text variant="displaySmall" style={[styles.scoreNumber, { color: theme.colors.primary }]}>
              {financialScore.overall}
            </Text>
            <Text variant="bodyLarge" style={styles.scoreLabel}>
              /100
            </Text>
          </View>
          
          <Text variant="bodyMedium" style={[styles.scoreDescription, { color: theme.colors.outline }]}>
            Sua saúde financeira está boa! Continue focando em economia.
          </Text>

          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <Text variant="bodyMedium">💰 Gastos</Text>
              <ProgressBar 
                progress={financialScore.spending / 100} 
                color={getImpactColor(financialScore.spending > 70 ? 'low' : 'medium')}
                style={styles.scoreBar}
              />
              <Text variant="bodySmall">{financialScore.spending}/100</Text>
            </View>

            <View style={styles.scoreItem}>
              <Text variant="bodyMedium">🎯 Poupança</Text>
              <ProgressBar 
                progress={financialScore.saving / 100} 
                color={getImpactColor('low')}
                style={styles.scoreBar}
              />
              <Text variant="bodySmall">{financialScore.saving}/100</Text>
            </View>

            <View style={styles.scoreItem}>
              <Text variant="bodyMedium">📅 Planejamento</Text>
              <ProgressBar 
                progress={financialScore.planning / 100} 
                color={getImpactColor('medium')}
                style={styles.scoreBar}
              />
              <Text variant="bodySmall">{financialScore.planning}/100</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Key Insights */}
      <Card style={styles.insightsCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              🔍 Insights Principais
            </Text>
            <Button
              mode="outlined"
              onPress={generateAnalysis}
              loading={loading}
              disabled={loading}
              icon="refresh"
            >
              Atualizar
            </Button>
          </View>

          {insights.slice(0, 3).map((insight) => (
            <Card key={insight.id} style={styles.insightCard}>
              <Card.Content>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>
                    {getInsightIcon(insight.type)}
                  </Text>
                  <View style={styles.insightTitleContainer}>
                    <Text variant="titleMedium" style={styles.insightTitle}>
                      {insight.title}
                    </Text>
                    <View style={styles.insightMeta}>
                      <Chip
                        mode="outlined"
                        textStyle={{ fontSize: 10 }}
                        style={[styles.impactChip, { borderColor: getImpactColor(insight.impact) }]}
                      >
                        {insight.impact.toUpperCase()}
                      </Chip>
                      <Text variant="bodySmall" style={[styles.confidence, { color: theme.colors.outline }]}>
                        {insight.confidence}% confiança
                      </Text>
                    </View>
                  </View>
                </View>

                <Text variant="bodyMedium" style={styles.insightDescription}>
                  {insight.description}
                </Text>

                {insight.potentialSaving && (
                  <View style={styles.savingPotential}>
                    <Text variant="bodyMedium" style={[styles.savingText, { color: theme.colors.primary }]}>
                      💰 Economia potencial: {formatCurrency(insight.potentialSaving)}
                    </Text>
                  </View>
                )}

                {insight.actionable && (
                  <Button
                    mode="contained"
                    style={styles.actionButton}
                    onPress={() => {
                      // Handle insight action
                    }}
                  >
                    Ver Detalhes
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))}
        </Card.Content>
      </Card>

      {/* Spending Patterns */}
      <Card style={styles.patternsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            📈 Padrões de Gastos
          </Text>

          {spendingPatterns.map((pattern, index) => (
            <View key={pattern.category}>
              <List.Item
                title={pattern.category}
                description={`${pattern.percentage}% do total • ${formatCurrency(pattern.amount)}`}
                left={() => (
                  <View style={styles.patternIcon}>
                    <Text style={styles.trendIcon}>
                      {getTrendIcon(pattern.trend)}
                    </Text>
                  </View>
                )}
                right={() => (
                  <View style={styles.patternRight}>
                    <Text 
                      variant="bodySmall" 
                      style={[
                        styles.comparison,
                        { color: pattern.comparison > 0 ? '#f44336' : '#4caf50' }
                      ]}
                    >
                      {pattern.comparison > 0 ? '+' : ''}{pattern.comparison}%
                    </Text>
                    <ProgressBar
                      progress={pattern.percentage / 100}
                      color={theme.colors.primary}
                      style={styles.patternBar}
                    />
                  </View>
                )}
              />
              {index < spendingPatterns.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            ⚡ Ações Rápidas
          </Text>

          <View style={styles.quickActions}>
            <Button
              mode="contained"
              style={styles.quickAction}
              onPress={() => {}}
              icon="target"
            >
              Criar Meta
            </Button>

            <Button
              mode="outlined"
              style={styles.quickAction}
              onPress={() => {}}
              icon="chart-line"
            >
              Ver Relatório
            </Button>

            <Button
              mode="outlined"
              style={styles.quickAction}
              onPress={() => {}}
              icon="lightbulb"
            >
              Mais Dicas
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* AI Disclaimer */}
      <Card style={styles.disclaimerCard}>
        <Card.Content>
          <Text variant="bodySmall" style={[styles.disclaimer, { color: theme.colors.outline }]}>
            🤖 As análises são geradas por inteligência artificial baseada nos seus dados financeiros. 
            Os insights são sugestões e devem ser considerados junto com sua situação financeira pessoal.
          </Text>
        </Card.Content>
      </Card>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 20,
  },
  periodContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  periodChip: {
    marginRight: 8,
  },
  scoreCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    marginLeft: 4,
    opacity: 0.7,
  },
  scoreDescription: {
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreBreakdown: {
    gap: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBar: {
    flex: 1,
    height: 8,
  },
  insightsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  insightCard: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  impactChip: {
    height: 24,
  },
  confidence: {
    fontSize: 12,
  },
  insightDescription: {
    lineHeight: 20,
    marginBottom: 12,
  },
  savingPotential: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  savingText: {
    fontWeight: 'bold',
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  patternsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  patternIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  trendIcon: {
    fontSize: 20,
  },
  patternRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  comparison: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  patternBar: {
    width: 60,
    height: 4,
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickAction: {
    flex: 1,
    minWidth: 100,
  },
  disclaimerCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    backgroundColor: '#fff3e0',
  },
  disclaimer: {
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default SmartAnalysisScreen;






