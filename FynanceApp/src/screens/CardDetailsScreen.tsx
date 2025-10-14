import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CardDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Cartão</Text>
      <Text style={styles.subtitle}>Em desenvolvimento...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default CardDetailsScreen;




