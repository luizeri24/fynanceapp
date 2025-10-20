import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Chip, Searchbar, useTheme, Divider, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import pluggyService, { PluggyTransaction } from '../services/pluggyService';
import { getTransactionCategory, getTransactionIcon } from '../utils/transactionUtils';

const TransactionsScreen = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<PluggyTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PluggyTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');

  // Carregar transações
  const loadTransactions = async () => {
    try {
      const cachedTransactions = await pluggyService.getCachedTransactions();
      console.log('📊 Transações carregadas:', cachedTransactions.length);
      
      // Ordenar por data (mais recente primeiro)
      const sorted = cachedTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTransactions(sorted);
      setFilteredTransactions(sorted);
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
    }
  };

  // Recarregar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  // Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTransactions();
    setIsRefreshing(false);
  };

  // Filtrar transações
  const filterTransactions = (query: string, type: 'all' | 'debit' | 'credit') => {
    let filtered = transactions;

    // Filtrar por tipo
    if (type === 'debit') {
      filtered = filtered.filter(t => t.amount < 0);
    } else if (type === 'credit') {
      filtered = filtered.filter(t => t.amount > 0);
    }

    // Filtrar por busca
    if (query) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  // Atualizar busca
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    filterTransactions(query, filterType);
  };

  // Atualizar filtro de tipo
  const onChangeFilter = (type: 'all' | 'debit' | 'credit') => {
    setFilterType(type);
    filterTransactions(searchQuery, type);
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calcular totais
  const totalDebit = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCredit = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);


  // Renderizar item
  const renderTransaction = ({ item }: { item: PluggyTransaction }) => {
    const isDebit = item.amount < 0;
    const category = getTransactionCategory(item.description, item.amount);
    const icon = getTransactionIcon(item.description, item.amount);
    
    console.log('🔍 Transactions - Transaction:', item.description, 'Category:', category);
    
    return (
      <Card style={styles.transactionCard}>
        <Card.Content style={styles.transactionContent}>
          <View style={styles.transactionLeft}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: isDebit ? '#ffebee' : '#e8f5e9' }
            ]}>
              <IconButton
                icon={icon}
                size={18}
                iconColor={isDebit ? '#f44336' : '#4caf50'}
                style={styles.icon}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text variant="bodyLarge" style={styles.description}>
                {item.description}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(item.date)}
              </Text>
              <View style={{
                backgroundColor: '#e3f2fd',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
                alignSelf: 'flex-start',
                marginTop: 4
              }}>
                <Text style={{ color: '#1976d2', fontSize: 10, fontWeight: '500' }}>
                  {category}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text
              variant="bodyMedium"
              style={[
                styles.amount,
                { color: isDebit ? '#f44336' : '#4caf50' }
              ]}
              numberOfLines={1}
            >
              {isDebit ? '-' : '+'} {formatCurrency(item.amount)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header com estatísticas */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            Resumo
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Entradas
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: '#4caf50' }]}>
                {formatCurrency(totalCredit)}
              </Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Saídas
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: '#f44336' }]}>
                {formatCurrency(totalDebit)}
              </Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total
              </Text>
              <Text variant="titleMedium" style={styles.statValue}>
                {transactions.length}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Busca */}
      <Searchbar
        placeholder="Buscar transações..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Chip
          selected={filterType === 'all'}
          onPress={() => onChangeFilter('all')}
          style={styles.filterChip}
        >
          Todas ({transactions.length})
        </Chip>
        <Chip
          selected={filterType === 'debit'}
          onPress={() => onChangeFilter('debit')}
          style={styles.filterChip}
        >
          Débitos ({transactions.filter(t => t.amount < 0).length})
        </Chip>
        <Chip
          selected={filterType === 'credit'}
          onPress={() => onChangeFilter('credit')}
          style={styles.filterChip}
        >
          Créditos ({transactions.filter(t => t.amount > 0).length})
        </Chip>
      </View>

      {/* Lista de transações */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nenhuma transação encontrada
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 12,
    paddingTop: 8,
  },
  transactionCard: {
    marginBottom: 8,
    marginHorizontal: 4,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    maxWidth: '70%',
  },
  iconContainer: {
    borderRadius: 18,
    marginRight: 10,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    margin: 0,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  description: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 16,
  },
  date: {
    color: '#666',
    marginBottom: 4,
    fontSize: 11,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    height: 18,
    marginTop: 2,
  },
  categoryText: {
    fontSize: 9,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
    maxWidth: '30%',
    paddingLeft: 8,
  },
  amount: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
    textAlign: 'right',
    paddingRight: 4,
  },
  statusChip: {
    height: 18,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
});

export default TransactionsScreen;

