import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CreditCard as CreditCardType } from '../../types';

interface CreditCardProps {
  card: CreditCardType;
  onPress?: () => void;
}

const CreditCard: React.FC<CreditCardProps> = ({ card, onPress }) => {
  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'american_express':
        return '💳';
      case 'elo':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: card.color || '#6200ea' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.brandIcon}>{getBrandIcon(card.brand)}</Text>
      </View>
      
      <View style={styles.numberContainer}>
        <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFourDigits}</Text>
      </View>
      
      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Limite Disponível</Text>
          <Text style={styles.value}>{formatCurrency(card.availableLimit)}</Text>
        </View>
        <View style={styles.rightInfo}>
          <Text style={styles.label}>Fatura Atual</Text>
          <Text style={styles.value}>{formatCurrency(card.currentBalance)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  brandIcon: {
    fontSize: 24,
  },
  numberContainer: {
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default CreditCard;



