import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Achievement } from '../../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, onPress }) => {
  const theme = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card 
        style={[
          styles.card, 
          achievement.isUnlocked ? styles.unlockedCard : styles.lockedCard
        ]}
      >
        <Card.Content style={styles.content}>
          {/* Icon */}
          <View style={[
            styles.iconContainer,
            achievement.isUnlocked 
              ? { backgroundColor: theme.colors.primaryContainer }
              : { backgroundColor: theme.colors.surfaceVariant }
          ]}>
            <Text 
              variant="displayMedium" 
              style={[
                styles.icon,
                !achievement.isUnlocked && styles.lockedIcon
              ]}
            >
              {achievement.isUnlocked ? achievement.icon : '🔒'}
            </Text>
          </View>

          {/* Badge Info */}
          <View style={styles.infoContainer}>
            <Text 
              variant="titleMedium" 
              style={[
                styles.title,
                !achievement.isUnlocked && styles.lockedText
              ]}
            >
              {achievement.title}
            </Text>
            
            <Text 
              variant="bodyMedium" 
              style={[
                styles.description,
                { color: theme.colors.outline },
                !achievement.isUnlocked && styles.lockedText
              ]}
            >
              {achievement.description}
            </Text>

            {/* Status */}
            <View style={styles.statusContainer}>
              {achievement.isUnlocked ? (
                <View style={styles.unlockedStatus}>
                  <Text 
                    variant="labelMedium" 
                    style={[styles.statusText, { color: theme.colors.primary }]}
                  >
                    ✅ Desbloqueada
                  </Text>
                  {achievement.unlockedAt && (
                    <Text 
                      variant="labelSmall" 
                      style={[styles.dateText, { color: theme.colors.outline }]}
                    >
                      {formatDate(achievement.unlockedAt)}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.lockedStatus}>
                  <Text 
                    variant="labelMedium" 
                    style={[styles.statusText, { color: theme.colors.outline }]}
                  >
                    🔒 Bloqueada
                  </Text>
                  <Text 
                    variant="labelSmall" 
                    style={[styles.criteriaText, { color: theme.colors.outline }]}
                  >
                    {achievement.criteria}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>

        {/* Unlock Animation Overlay */}
        {achievement.isUnlocked && (
          <View style={styles.glowOverlay} />
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  unlockedCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  lockedCard: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
    lineHeight: 20,
  },
  lockedText: {
    opacity: 0.7,
  },
  statusContainer: {
    marginTop: 4,
  },
  unlockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockedStatus: {
    gap: 4,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  dateText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  criteriaText: {
    fontSize: 10,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    pointerEvents: 'none',
  },
});

export default AchievementBadge;






