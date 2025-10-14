import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Account } from '../../types';

interface BalanceCardProps {
  accounts: Account[];
}

const BalanceCard: React.FC<BalanceCardProps> = ({ accounts }) => {
  const theme = useTheme();

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.primary }]}>
      <Card.Content>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onPrimary }]}>
          Saldo Total
        </Text>
        <Text variant="displaySmall" style={[styles.balance, { color: theme.colors.onPrimary }]}>
          {formatCurrency(totalBalance)}
        </Text>
        <View style={styles.accountsContainer}>
          {accounts.map((account) => (
            <View key={account.id} style={styles.accountItem}>
              <Text variant="bodySmall" style={[styles.accountName, { color: theme.colors.onPrimary }]}>
                {account.name}
              </Text>
              <Text variant="bodyMedium" style={[styles.accountBalance, { color: theme.colors.onPrimary }]}>
                {formatCurrency(account.balance)}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 8,
    opacity: 0.9,
  },
  balance: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  accountsContainer: {
    gap: 8,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    opacity: 0.8,
  },
  accountBalance: {
    fontWeight: '600',
  },
});

export default BalanceCard;

