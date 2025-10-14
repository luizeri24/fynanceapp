import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import GoalProgress from '../components/common/GoalProgress';
import { mockGoals } from '../data/mockData';
import { RootStackParamList } from '../types';

type GoalsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const GoalsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<GoalsScreenNavigationProp>();

  const activeGoals = mockGoals.filter(goal => goal.isActive);
  const completedGoals = mockGoals.filter(goal => !goal.isActive || goal.currentAmount >= goal.targetAmount);

  const handleEditGoal = (goalId: string) => {
    console.log('Edit goal:', goalId);
    // TODO: Navigate to edit goal screen
  };

  const handleAddFunds = (goalId: string) => {
    // @ts-ignore - Temporarily ignore type
    navigation.navigate('AddFunds', { goalId });
  };

  const handleCreateGoal = () => {
    // @ts-ignore - Temporarily ignore type
    navigation.navigate('CreateGoal');
  };

  const handleViewAchievements = () => {
    navigation.navigate('Achievements');
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Minhas Metas Financeiras
        </Text>

        {/* Summary */}
        <Text variant="bodyMedium" style={styles.summary}>
          {activeGoals.length} metas ativas • {completedGoals.length} concluídas
        </Text>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              🎯 Metas Ativas
            </Text>
            {activeGoals.map((goal) => (
              <GoalProgress
                key={goal.id}
                goal={goal}
                onEditPress={() => handleEditGoal(goal.id)}
                onAddFundsPress={() => handleAddFunds(goal.id)}
              />
            ))}
          </>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              ✅ Metas Concluídas
            </Text>
            {completedGoals.map((goal) => (
              <GoalProgress
                key={goal.id}
                goal={goal}
                onEditPress={() => handleEditGoal(goal.id)}
                onAddFundsPress={() => handleAddFunds(goal.id)}
              />
            ))}
          </>
        )}

        {/* Empty State */}
        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <Text variant="bodyLarge" style={styles.emptyText}>
            Você ainda não tem metas financeiras. Criar uma meta ajuda a manter o foco nos seus objetivos!
          </Text>
        )}

        {/* Achievement Button */}
        <Text 
          variant="titleMedium" 
          style={[styles.achievementButton, { color: theme.colors.primary }]}
          onPress={handleViewAchievements}
        >
          🏆 Ver Conquistas
        </Text>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateGoal}
        label="Nova Meta"
      />
    </>
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
  summary: {
    marginHorizontal: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptyText: {
    margin: 32,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  achievementButton: {
    margin: 16,
    marginTop: 24,
    marginBottom: 80,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default GoalsScreen;