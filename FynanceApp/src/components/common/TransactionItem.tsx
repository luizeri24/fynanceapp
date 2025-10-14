import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const theme = useTheme();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      'Alimentação': '🍽️',
      'Transporte': '🚗',
      'Entretenimento': '🎬',
      'Saúde': '🏥',
      'Educação': '📚',
      'Compras': '🛍️',
      'Renda': '💰',
      'Investimento': '📈',
      'Casa': '🏠',
      'Outros': '📋'
    };
    return emojis[category] || '📋';
  };

  const amountColor = transaction.type === 'income' 
    ? theme.colors.primary 
    : theme.colors.onSurface;

  return (
    <List.Item
      title={transaction.description}
      description={`${transaction.category} • ${formatDate(transaction.date)}`}
      left={() => (
        <View style={{ justifyContent: 'center', alignItems: 'center', width: 40 }}>
          <Text style={{ fontSize: 24 }}>
            {getCategoryEmoji(transaction.category)}
          </Text>
        </View>
      )}
      right={() => (
        <View style={styles.amountContainer}>
          <Text 
            variant="bodyLarge" 
            style={[
              styles.amount, 
              { color: amountColor },
              transaction.type === 'income' && styles.incomeAmount
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          {transaction.merchant && (
            <Text 
              variant="bodySmall" 
              style={[styles.merchant, { color: theme.colors.outline }]}
            >
              {transaction.merchant}
            </Text>
          )}
        </View>
      )}
      onPress={onPress}
      style={styles.listItem}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
  },
  incomeAmount: {
    fontWeight: 'bold',
  },
  merchant: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
});

export default TransactionItem;
