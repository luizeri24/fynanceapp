import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Card, Text, useTheme, Chip, IconButton, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import pluggyService, { PluggyAccount } from '../services/pluggyService';

const CardsScreen = () => {
  const theme = useTheme();
  const [creditCards, setCreditCards] = useState<PluggyAccount[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar cartões de crédito
  const loadCreditCards = async () => {
    try {
      const cachedAccounts = await pluggyService.getCachedAccounts();
      
      // Filtrar apenas cartões de crédito
      const cards = cachedAccounts.filter(account => account.type === 'CREDIT');
      console.log('💳 Cartões carregados:', cards.length);
      
      setCreditCards(cards);
    } catch (error) {
      console.error('❌ Erro ao carregar cartões:', error);
    }
  };

  // Recarregar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadCreditCards();
    }, [])
  );

  // Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCreditCards();
    setIsRefreshing(false);
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular totais
  const totalLimit = creditCards.reduce((sum, card) => {
    // @ts-ignore - creditData pode existir
    return sum + (card.creditData?.creditLimit || 0);
  }, 0);

  const totalAvailable = creditCards.reduce((sum, card) => {
    // @ts-ignore - creditData pode existir
    return sum + (card.creditData?.availableCreditLimit || 0);
  }, 0);

  const totalUsed = totalLimit - totalAvailable;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Text variant="headlineSmall" style={styles.title}>
        💳 Meus Cartões
      </Text>

      {/* Resumo Geral */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.summaryTitle}>
            Resumo Geral
          </Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Total de Cartões
              </Text>
              <Text variant="titleLarge" style={styles.summaryValue}>
                {creditCards.length}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryItem}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Limite Total
              </Text>
              <Text variant="titleMedium" style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {formatCurrency(totalLimit)}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Disponível
              </Text>
              <Text variant="titleMedium" style={[styles.summaryValue, { color: '#4caf50' }]}>
                {formatCurrency(totalAvailable)}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryItem}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Utilizado
              </Text>
              <Text variant="titleMedium" style={[styles.summaryValue, { color: '#f44336' }]}>
                {formatCurrency(totalUsed)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Lista de Cartões */}
      {creditCards.length > 0 ? (
        creditCards.map((card) => {
          // @ts-ignore - creditData pode existir
          const creditData = card.creditData || {};
          const usedPercentage = creditData.creditLimit 
            ? ((creditData.creditLimit - creditData.availableCreditLimit) / creditData.creditLimit) * 100 
            : 0;

          return (
            <Card key={card.id} style={styles.cardContainer}>
              <Card.Content>
                {/* Header do Cartão */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <IconButton
                      icon="credit-card"
                      size={24}
                      iconColor="#fff"
                      style={[styles.cardIcon, { backgroundColor: theme.colors.primary }]}
                    />
                    <View>
                      <Text variant="titleMedium" style={styles.cardName}>
                        {card.name}
                      </Text>
                      <Text variant="bodySmall" style={styles.cardNumber}>
                        •••• {card.number}
                      </Text>
                    </View>
                  </View>
                  
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: creditData.status === 'ACTIVE' ? '#e8f5e9' : '#ffebee' }
                    ]}
                    textStyle={{
                      color: creditData.status === 'ACTIVE' ? '#4caf50' : '#f44336',
                      fontSize: 10
                    }}
                    compact
                  >
                    {creditData.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </Chip>
                </View>

                <Divider style={styles.cardDivider} />

                {/* Informações do Cartão */}
                <View style={styles.cardInfo}>
                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>
                      Limite Total:
                    </Text>
                    <Text variant="bodyLarge" style={styles.infoValue}>
                      {formatCurrency(creditData.creditLimit || 0)}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>
                      Disponível:
                    </Text>
                    <Text variant="bodyLarge" style={[styles.infoValue, { color: '#4caf50' }]}>
                      {formatCurrency(creditData.availableCreditLimit || 0)}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>
                      Fatura Atual:
                    </Text>
                    <Text variant="bodyLarge" style={[styles.infoValue, { color: '#f44336' }]}>
                      {formatCurrency(card.balance || 0)}
                    </Text>
                  </View>

                  {creditData.balanceDueDate && (
                    <View style={styles.infoRow}>
                      <Text variant="bodySmall" style={styles.infoLabel}>
                        Vencimento:
                      </Text>
                      <Text variant="bodyMedium" style={styles.infoValue}>
                        {new Date(creditData.balanceDueDate).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  )}

                  {creditData.minimumPayment && (
                    <View style={styles.infoRow}>
                      <Text variant="bodySmall" style={styles.infoLabel}>
                        Pagamento Mínimo:
                      </Text>
                      <Text variant="bodyMedium" style={styles.infoValue}>
                        {formatCurrency(creditData.minimumPayment)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Barra de Progresso */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${usedPercentage}%`,
                          backgroundColor: usedPercentage > 80 ? '#f44336' : usedPercentage > 50 ? '#ff9800' : '#4caf50'
                        }
                      ]}
                    />
                  </View>
                  <Text variant="bodySmall" style={styles.progressText}>
                    {usedPercentage.toFixed(1)}% utilizado
                  </Text>
                </View>
              </Card.Content>
            </Card>
          );
        })
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <IconButton
              icon="credit-card-off"
              size={48}
              iconColor="#999"
            />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              Nenhum cartão encontrado
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Conecte uma conta bancária para ver seus cartões
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 40,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    margin: 0,
    marginRight: 12,
  },
  cardName: {
    fontWeight: 'bold',
  },
  cardNumber: {
    color: '#666',
  },
  statusChip: {
    height: 24,
  },
  cardDivider: {
    marginBottom: 12,
  },
  cardInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'right',
    color: '#666',
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
});

export default CardsScreen;
