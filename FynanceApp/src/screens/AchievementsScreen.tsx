import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, ProgressBar, useTheme } from 'react-native-paper';
import AchievementBadge from '../components/common/AchievementBadge';
import { mockAchievements } from '../data/mockData';

const AchievementsScreen = () => {
  const theme = useTheme();

  const unlockedAchievements = mockAchievements.filter(achievement => achievement.isUnlocked);
  const lockedAchievements = mockAchievements.filter(achievement => !achievement.isUnlocked);
  
  const completionPercentage = unlockedAchievements.length / mockAchievements.length;

  const handleAchievementPress = (achievementId: string) => {
    console.log('Achievement pressed:', achievementId);
    // TODO: Show achievement details modal
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        🏆 Conquistas
      </Text>

      {/* Progress Summary */}
      <View style={styles.progressContainer}>
        <Text variant="titleMedium" style={styles.progressTitle}>
          Progresso Geral
        </Text>
        
        <View style={styles.progressRow}>
          <Text variant="bodyLarge" style={styles.progressText}>
            {unlockedAchievements.length} de {mockAchievements.length} conquistas
          </Text>
          <Text variant="bodyMedium" style={[styles.progressPercentage, { color: theme.colors.primary }]}>
            {Math.round(completionPercentage * 100)}%
          </Text>
        </View>
        
        <ProgressBar 
          progress={completionPercentage} 
          style={styles.progressBar}
          color={theme.colors.primary}
        />

        <Text variant="bodySmall" style={[styles.motivationText, { color: theme.colors.outline }]}>
          {completionPercentage === 1 
            ? '🎉 Parabéns! Você desbloqueou todas as conquistas!'
            : completionPercentage >= 0.8
            ? '🚀 Quase lá! Você está indo muito bem!'
            : completionPercentage >= 0.5
            ? '💪 Ótimo progresso! Continue assim!'
            : '🎯 Comece sua jornada desbloqueando sua primeira conquista!'
          }
        </Text>
      </View>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            ✅ Desbloqueadas ({unlockedAchievements.length})
          </Text>
          <View style={styles.achievementsGrid}>
            {unlockedAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                onPress={() => handleAchievementPress(achievement.id)}
              />
            ))}
          </View>
        </>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            🔒 A Desbloquear ({lockedAchievements.length})
          </Text>
          <View style={styles.achievementsGrid}>
            {lockedAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                onPress={() => handleAchievementPress(achievement.id)}
              />
            ))}
          </View>
        </>
      )}

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text variant="titleMedium" style={styles.tipsTitle}>
          💡 Dicas para Desbloquear Conquistas
        </Text>
        
        <Text variant="bodyMedium" style={styles.tipText}>
          • Mantenha um controle regular dos seus gastos
        </Text>
        <Text variant="bodyMedium" style={styles.tipText}>
          • Crie e complete metas financeiras
        </Text>
        <Text variant="bodyMedium" style={styles.tipText}>
          • Economize consistentemente todos os meses
        </Text>
        <Text variant="bodyMedium" style={styles.tipText}>
          • Use todas as funcionalidades do aplicativo
        </Text>
        <Text variant="bodyMedium" style={styles.tipText}>
          • Monitore seus investimentos regularmente
        </Text>
      </View>
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
    textAlign: 'center',
  },
  progressContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  progressTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontWeight: '600',
  },
  progressPercentage: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  motivationText: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  achievementsGrid: {
    marginHorizontal: 8,
  },
  tipsContainer: {
    margin: 16,
    marginTop: 24,
    padding: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    marginBottom: 32,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipText: {
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default AchievementsScreen;






