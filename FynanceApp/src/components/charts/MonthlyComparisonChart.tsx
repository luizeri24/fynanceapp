import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, useTheme, ProgressBar } from 'react-native-paper';
import { Transaction } from '../../types';

interface MonthlyComparisonChartProps {
  transactions: Transaction[];
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ transactions }) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Gerar dados dos últimos 6 meses
  const currentDate = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthYear = date.toISOString().slice(0, 7); // YYYY-MM format
    const monthName = date.toLocaleDateString('pt-BR', { 
      month: 'short'
    });
    return {
      monthYear,
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1)
    };
  }).reverse();

  // Calcular receitas e despesas por mês
  const monthlyData = months.map(({ monthYear, monthName }) => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthYear));
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      monthName,
      income,
      expenses,
      balance: income - expenses
    };
  });

  // Preparar dados para o gráfico
  const maxValue = Math.max(
    ...monthlyData.map(d => Math.max(d.income, d.expenses))
  );

  const barData = monthlyData.map((data, index) => ({
    value: data.expenses,
    label: data.monthName,
    frontColor: '#FF6B6B',
    spacing: 2,
    labelWidth: 30,
    labelTextStyle: {
      color: theme.colors.onSurface,
      fontSize: 10,
    },
  }));

  const incomeData = monthlyData.map((data, index) => ({
    value: data.income,
    frontColor: '#4ECDC4',
  }));

  // Combinar dados de despesas e receitas
  const combinedData: any[] = [];
  barData.forEach((expense, index) => {
    combinedData.push(expense);
    combinedData.push(incomeData[index]);
  });

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>
          Receitas vs Despesas (6 meses)
        </Text>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
            <Text variant="bodyMedium">Receitas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text variant="bodyMedium">Despesas</Text>
          </View>
        </View>

        {/* Simplified Bar Chart */}
        <View style={styles.chartContainer}>
          {monthlyData.map((data, index) => {
            const incomePercentage = maxValue > 0 ? data.income / maxValue : 0;
            const expensePercentage = maxValue > 0 ? data.expenses / maxValue : 0;
            return (
              <View key={index} style={styles.monthBar}>
                <Text variant="bodySmall" style={styles.monthLabel}>
                  {data.monthName}
                </Text>
                <View style={styles.barContainer}>
                  <View style={styles.barRow}>
                    <Text variant="labelSmall" style={styles.barLabel}>Receita</Text>
                    <ProgressBar
                      progress={incomePercentage}
                      style={styles.incomeBar}
                      color='#4ECDC4'
                    />
                    <Text variant="labelSmall" style={styles.barValue}>
                      {formatCurrency(data.income)}
                    </Text>
                  </View>
                  <View style={styles.barRow}>
                    <Text variant="labelSmall" style={styles.barLabel}>Despesa</Text>
                    <ProgressBar
                      progress={expensePercentage}
                      style={styles.expenseBar}
                      color='#FF6B6B'
                    />
                    <Text variant="labelSmall" style={styles.barValue}>
                      {formatCurrency(data.expenses)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text variant="titleMedium" style={styles.summaryTitle}>
            Resumo do Período
          </Text>
          {monthlyData.map((data, index) => {
            const balanceColor = data.balance >= 0 ? '#4ECDC4' : '#FF6B6B';
            return (
              <View key={index} style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryMonth}>
                  {data.monthName}
                </Text>
                <View style={styles.summaryValues}>
                  <Text variant="bodySmall" style={styles.summaryIncome}>
                    +{formatCurrency(data.income)}
                  </Text>
                  <Text variant="bodySmall" style={styles.summaryExpense}>
                    -{formatCurrency(data.expenses)}
                  </Text>
                  <Text 
                    variant="bodyMedium" 
                    style={[styles.summaryBalance, { color: balanceColor }]}
                  >
                    {formatCurrency(data.balance)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginTop: 0,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chartContainer: {
    marginVertical: 16,
    gap: 12,
  },
  monthBar: {
    marginBottom: 16,
  },
  monthLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  barContainer: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    minWidth: 50,
    fontSize: 10,
  },
  incomeBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  expenseBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  barValue: {
    minWidth: 60,
    textAlign: 'right',
    fontSize: 10,
  },
  summary: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  summaryTitle: {
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryMonth: {
    fontWeight: '500',
    minWidth: 40,
  },
  summaryValues: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  summaryIncome: {
    color: '#4ECDC4',
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  summaryExpense: {
    color: '#FF6B6B',
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  summaryBalance: {
    fontWeight: 'bold',
    minWidth: 70,
    textAlign: 'right',
  },
});

export default MonthlyComparisonChart;
