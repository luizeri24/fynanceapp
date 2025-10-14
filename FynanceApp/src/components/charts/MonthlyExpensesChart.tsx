import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, useTheme, ProgressBar } from 'react-native-paper';
import { Transaction } from '../../types';

interface MonthlyExpensesChartProps {
  transactions: Transaction[];
  selectedMonth: string;
}

const MonthlyExpensesChart: React.FC<MonthlyExpensesChartProps> = ({ 
  transactions, 
  selectedMonth 
}) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar transações do mês selecionado (apenas despesas)
  const monthlyExpenses = transactions.filter(transaction => 
    transaction.type === 'expense' && 
    transaction.date.startsWith(selectedMonth)
  );

  // Agrupar por categoria
  const categoryData = monthlyExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (acc[category]) {
      acc[category] += Math.abs(transaction.amount);
    } else {
      acc[category] = Math.abs(transaction.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  // Cores para as categorias
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  // Converter para formato do gráfico
  const pieData = Object.entries(categoryData)
    .sort(([,a], [,b]) => b - a) // Ordenar por valor decrescente
    .map(([category, amount], index) => ({
      value: amount,
      color: colors[index % colors.length],
      text: category,
      labelComponent: () => (
        <Text style={styles.labelText}>
          {category}
        </Text>
      ),
    }));

  const totalExpenses = Object.values(categoryData).reduce((sum, value) => sum + value, 0);

  if (pieData.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Gastos por Categoria
          </Text>
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nenhuma despesa encontrada para este mês
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>
          Gastos por Categoria
        </Text>
        
        <Text variant="bodyMedium" style={[styles.total, { color: theme.colors.outline }]}>
          Total: {formatCurrency(totalExpenses)}
        </Text>

        {/* Simplified Chart - List View */}
        <View style={styles.totalContainer}>
          <Text variant="titleLarge" style={styles.totalLabel}>
            Total do Mês
          </Text>
          <Text variant="displaySmall" style={styles.totalValue}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>

        {/* Category Breakdown */}
        <View style={styles.legend}>
          {pieData.map((item, index) => {
            const percentage = ((item.value / totalExpenses) * 100);
            return (
              <View key={index} style={styles.legendItem}>
                <View style={styles.categoryRow}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text variant="bodyMedium" style={styles.legendText}>
                    {item.text}
                  </Text>
                  <Text variant="bodyMedium" style={styles.legendValue}>
                    {formatCurrency(item.value)}
                  </Text>
                </View>
                <ProgressBar
                  progress={percentage / 100}
                  style={styles.categoryProgress}
                  color={item.color}
                />
                <Text variant="bodySmall" style={styles.percentageText}>
                  {percentage.toFixed(1)}% do total
                </Text>
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
    marginTop: 8,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  total: {
    marginBottom: 16,
    fontSize: 14,
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  totalLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  legend: {
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  categoryProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 11,
    textAlign: 'right',
    opacity: 0.7,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    flex: 1,
    fontWeight: '500',
  },
  legendValue: {
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MonthlyExpensesChart;
