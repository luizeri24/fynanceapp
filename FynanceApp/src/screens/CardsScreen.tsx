import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CreditCard from '../components/common/CreditCard';
import { mockCreditCards } from '../data/mockData';
import { RootStackParamList } from '../types';

type CardsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CardsScreen = () => {
  const navigation = useNavigation<CardsScreenNavigationProp>();

  const handleCardPress = (cardId: string) => {
    navigation.navigate('CardDetails', { cardId });
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Meus Cartões
      </Text>
      
      {mockCreditCards.map((creditCard) => (
        <CreditCard
          key={creditCard.id}
          card={creditCard}
          onPress={() => handleCardPress(creditCard.id)}
        />
      ))}
      
      {/* Summary Card */}
      <Text variant="titleMedium" style={styles.summaryTitle}>
        Resumo dos Cartões
      </Text>
      
      <Text variant="bodyMedium" style={styles.summaryText}>
        • Total de cartões: {mockCreditCards.length}
      </Text>
      <Text variant="bodyMedium" style={styles.summaryText}>
        • Limite total: {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(mockCreditCards.reduce((sum, card) => sum + card.limit, 0))}
      </Text>
      <Text variant="bodyMedium" style={styles.summaryText}>
        • Disponível: {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(mockCreditCards.reduce((sum, card) => sum + card.availableLimit, 0))}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    margin: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  summaryTitle: {
    margin: 16,
    marginTop: 24,
    marginBottom: 12,
    fontWeight: '600',
  },
  summaryText: {
    marginHorizontal: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default CardsScreen;