import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { CreditCard } from '../../types';

interface CreditCardSummaryProps {
  creditCards: CreditCard[];
}

const CreditCardSummary: React.FC<CreditCardSummaryProps> = ({ creditCards }) => {
  const theme = useTheme();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
  const totalUsed = creditCards.reduce((sum, card) => sum + card.currentBalance, 0);
  const usagePercentage = totalLimit > 0 ? totalUsed / totalLimit : 0;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Cartões de Crédito
        </Text>
        
        <View style={styles.summaryContainer}>
          <Text variant="bodyLarge" style={styles.usedAmount}>
            {formatCurrency(totalUsed)} usado
          </Text>
          <Text variant="bodyMedium" style={[styles.totalLimit, { color: theme.colors.outline }]}>
            de {formatCurrency(totalLimit)}
          </Text>
        </View>

        <ProgressBar 
          progress={usagePercentage} 
          style={styles.progressBar}
          color={usagePercentage > 0.8 ? theme.colors.error : theme.colors.primary}
        />

        <View style={styles.cardsContainer}>
          {creditCards.map((card) => {
            const cardUsage = card.currentBalance / card.limit;
            return (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardInfo}>
                  <Text variant="bodyMedium" style={styles.cardName}>
                    {card.name}
                  </Text>
                  <Text variant="bodySmall" style={[styles.cardNumber, { color: theme.colors.outline }]}>
                    •••• {card.lastFourDigits}
                  </Text>
                </View>
                <View style={styles.cardAmounts}>
                  <Text variant="bodyMedium" style={styles.cardBalance}>
                    {formatCurrency(card.currentBalance)}
                  </Text>
                  <ProgressBar 
                    progress={cardUsage} 
                    style={styles.cardProgressBar}
                    color={cardUsage > 0.8 ? theme.colors.error : theme.colors.primary}
                  />
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
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  usedAmount: {
    fontWeight: 'bold',
  },
  totalLimit: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 12,
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 12,
    marginTop: 2,
  },
  cardAmounts: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  cardBalance: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardProgressBar: {
    width: 80,
    height: 4,
  },
});

export default CreditCardSummary;

