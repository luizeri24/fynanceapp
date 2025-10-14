import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { Transaction } from '../../types';

interface SpendingLimitProps {
  transactions: Transaction[];
  monthlyLimit?: number;
}

const SpendingLimit: React.FC<SpendingLimitProps> = ({ 
  transactions, 
  monthlyLimit = 3000 
}) => {
  const theme = useTheme();

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  const monthlyExpenses = transactions
    .filter(transaction => 
      transaction.type === 'expense' && 
      transaction.date.startsWith(currentMonth)
    )
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  const spendingPercentage = monthlyExpenses / monthlyLimit;
  const remainingAmount = monthlyLimit - monthlyExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = () => {
    if (spendingPercentage >= 1) return theme.colors.error;
    if (spendingPercentage >= 0.8) return theme.colors.errorContainer;
    return theme.colors.primary;
  };

  const getStatusText = () => {
    if (spendingPercentage >= 1) return 'Orçamento estourado!';
    if (spendingPercentage >= 0.8) return 'Atenção ao limite';
    return 'Dentro do orçamento';
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Limite de Gastos Mensal
        </Text>
        
        <View style={styles.amountContainer}>
          <Text variant="bodyLarge" style={styles.spentAmount}>
            {formatCurrency(monthlyExpenses)}
          </Text>
          <Text variant="bodyMedium" style={[styles.limitAmount, { color: theme.colors.outline }]}>
            de {formatCurrency(monthlyLimit)}
          </Text>
        </View>

        <ProgressBar 
          progress={Math.min(spendingPercentage, 1)} 
          style={styles.progressBar}
          color={getStatusColor()}
        />

        <View style={styles.statusContainer}>
          <Text 
            variant="bodyMedium" 
            style={[styles.statusText, { color: getStatusColor() }]}
          >
            {getStatusText()}
          </Text>
          <Text variant="bodyMedium" style={styles.remainingAmount}>
            {remainingAmount > 0 
              ? `${formatCurrency(remainingAmount)} restantes`
              : `${formatCurrency(Math.abs(remainingAmount))} acima do limite`
            }
          </Text>
        </View>

        <View style={styles.tipContainer}>
          <Text variant="bodySmall" style={[styles.tip, { color: theme.colors.outline }]}>
            💡 Dica: Tente manter seus gastos abaixo de 80% do orçamento
          </Text>
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
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  spentAmount: {
    fontWeight: 'bold',
  },
  limitAmount: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontWeight: '600',
  },
  remainingAmount: {
    fontWeight: '500',
  },
  tipContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  tip: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default SpendingLimit;

