import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, Alert } from 'react-native';
import { Card, Text, FAB, useTheme, Button, ProgressBar, IconButton, Chip, TextInput, Portal, Modal } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pluggyService from '../services/pluggyService';
import { RootStackParamList } from '../types';

type GoalsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

const GoalsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<GoalsScreenNavigationProp>();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    category: 'Economia'
  });

  // Carregar metas e saldo
  const loadData = async () => {
    try {
      // Carregar saldo total
      const cachedAccounts = await pluggyService.getCachedAccounts();
      const balance = cachedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
      setTotalBalance(balance);

      // Carregar metas do AsyncStorage
      const storedGoals = await AsyncStorage.getItem('@fynance:goals');
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Criar nova meta
  const handleCreateGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      Alert.alert('Erro', 'Preencha o nome e o valor da meta');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      category: newGoal.category,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    await AsyncStorage.setItem('@fynance:goals', JSON.stringify(updatedGoals));

    setShowCreateModal(false);
    setNewGoal({ name: '', targetAmount: '', deadline: '', category: 'Economia' });
    Alert.alert('Sucesso!', 'Meta criada com sucesso!');
  };

  // Adicionar fundos à meta
  const handleAddFunds = async (goalId: string) => {
    Alert.prompt(
      'Adicionar Fundos',
      'Quanto você quer adicionar a esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: async (value) => {
            const amount = parseFloat(value || '0');
            if (amount > 0) {
              const updatedGoals = goals.map(goal => {
                if (goal.id === goalId) {
                  return {
                    ...goal,
                    currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount)
                  };
                }
                return goal;
              });
              setGoals(updatedGoals);
              await AsyncStorage.setItem('@fynance:goals', JSON.stringify(updatedGoals));
              Alert.alert('Sucesso!', `R$ ${amount.toFixed(2)} adicionado à meta!`);
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  // Deletar meta
  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const updatedGoals = goals.filter(g => g.id !== goalId);
            setGoals(updatedGoals);
            await AsyncStorage.setItem('@fynance:goals', JSON.stringify(updatedGoals));
          }
        }
      ]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const activeGoals = goals.filter(g => g.isActive && g.currentAmount < g.targetAmount);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount);

  return (
    <>
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
          🎯 Minhas Metas
        </Text>

        {/* Saldo Disponível */}
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.balanceLabel}>
              Saldo Total Disponível
            </Text>
            <Text variant="displaySmall" style={[styles.balanceValue, { color: theme.colors.primary }]}>
              {formatCurrency(totalBalance)}
            </Text>
            <Text variant="bodySmall" style={styles.balanceHint}>
              Use seu saldo para criar e alcançar suas metas
            </Text>
          </Card.Content>
        </Card>

        {/* Resumo */}
        <View style={styles.summary}>
          <Chip icon="flag" style={styles.summaryChip}>
            {activeGoals.length} ativas
          </Chip>
          <Chip icon="check-circle" style={[styles.summaryChip, { backgroundColor: '#e8f5e9' }]}>
            {completedGoals.length} concluídas
          </Chip>
        </View>

        {/* Metas Ativas */}
        {activeGoals.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Metas Ativas
            </Text>
            {activeGoals.map((goal) => {
              const progress = goal.currentAmount / goal.targetAmount;
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <Card key={goal.id} style={styles.goalCard}>
                  <Card.Content>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalHeaderLeft}>
                        <IconButton
                          icon="flag"
                          size={20}
                          iconColor="#fff"
                          style={[styles.goalIcon, { backgroundColor: theme.colors.primary }]}
                        />
                        <View>
                          <Text variant="titleMedium" style={styles.goalName}>
                            {goal.name}
                          </Text>
                          <Chip style={styles.categoryChip} compact>
                            {goal.category}
                          </Chip>
                        </View>
                      </View>
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteGoal(goal.id)}
                      />
                    </View>

                    <View style={styles.goalProgress}>
                      <View style={styles.progressHeader}>
                        <Text variant="bodyLarge" style={styles.progressCurrent}>
                          {formatCurrency(goal.currentAmount)}
                        </Text>
                        <Text variant="bodyMedium" style={styles.progressTarget}>
                          de {formatCurrency(goal.targetAmount)}
                        </Text>
                      </View>
                      <ProgressBar
                        progress={progress}
                        color={progress >= 1 ? '#4caf50' : theme.colors.primary}
                        style={styles.progressBar}
                      />
                      <Text variant="bodySmall" style={styles.progressPercent}>
                        {(progress * 100).toFixed(1)}% concluído
                      </Text>
                    </View>

                    <View style={styles.goalFooter}>
                      <View style={styles.deadlineContainer}>
                        <IconButton icon="calendar" size={16} style={styles.deadlineIcon} />
                        <Text variant="bodySmall" style={styles.deadlineText}>
                          {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}
                        </Text>
                      </View>
                      <Button
                        mode="contained"
                        onPress={() => handleAddFunds(goal.id)}
                        compact
                      >
                        Adicionar Fundos
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </>
        )}

        {/* Metas Concluídas */}
        {completedGoals.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🎉 Metas Concluídas
            </Text>
            {completedGoals.map((goal) => (
              <Card key={goal.id} style={[styles.goalCard, { backgroundColor: '#e8f5e9' }]}>
                <Card.Content>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalHeaderLeft}>
                      <IconButton
                        icon="check-circle"
                        size={20}
                        iconColor="#4caf50"
                        style={styles.goalIcon}
                      />
                      <View>
                        <Text variant="titleMedium" style={styles.goalName}>
                          {goal.name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#4caf50' }}>
                          Meta alcançada! 🎉
                        </Text>
                      </View>
                    </View>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDeleteGoal(goal.id)}
                    />
                  </View>
                  <Text variant="bodyMedium" style={styles.completedAmount}>
                    {formatCurrency(goal.targetAmount)}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <IconButton icon="flag-outline" size={48} iconColor="#999" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Nenhuma meta criada
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Crie sua primeira meta financeira e comece a economizar!
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Modal de Criar Meta */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Nova Meta
          </Text>

          <TextInput
            label="Nome da Meta"
            value={newGoal.name}
            onChangeText={(text) => setNewGoal({ ...newGoal, name: text })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Valor Alvo (R$)"
            value={newGoal.targetAmount}
            onChangeText={(text) => setNewGoal({ ...newGoal, targetAmount: text })}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Categoria"
            value={newGoal.category}
            onChangeText={(text) => setNewGoal({ ...newGoal, category: text })}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.modalButtons}>
            <Button onPress={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={handleCreateGoal}>
              Criar Meta
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* FAB */}
      <FAB
        icon="plus"
        label="Nova Meta"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      />
    </>
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
  balanceCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  balanceLabel: {
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceHint: {
    color: '#666',
    fontStyle: 'italic',
  },
  summary: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  summaryChip: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  goalCard: {
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    margin: 0,
    marginRight: 8,
  },
  goalName: {
    fontWeight: 'bold',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 24,
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressCurrent: {
    fontWeight: 'bold',
  },
  progressTarget: {
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressPercent: {
    textAlign: 'right',
    color: '#666',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineIcon: {
    margin: 0,
    marginRight: -8,
  },
  deadlineText: {
    color: '#666',
  },
  completedAmount: {
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginTop: 8,
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default GoalsScreen;
