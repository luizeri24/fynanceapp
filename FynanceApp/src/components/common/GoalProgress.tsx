import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, useTheme, Button } from 'react-native-paper';
import { Goal } from '../../types';

interface GoalProgressProps {
  goal: Goal;
  onEditPress?: () => void;
  onAddFundsPress?: () => void;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ 
  goal, 
  onEditPress, 
  onAddFundsPress 
}) => {
  const theme = useTheme();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const progress = goal.currentAmount / goal.targetAmount;
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  
  // Calcular dias restantes
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcular quanto precisa economizar por mês
  const monthsRemaining = Math.max(daysRemaining / 30, 1);
  const monthlyRequired = remainingAmount / monthsRemaining;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.primary;
      case 'low': return theme.colors.outline;
      default: return theme.colors.outline;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getStatusMessage = () => {
    if (progress >= 1) return '🎉 Meta atingida!';
    if (daysRemaining < 0) return '⏰ Meta vencida';
    if (daysRemaining < 30) return '🚨 Prazo próximo';
    return '🎯 Em progresso';
  };

  return (
    <Card style={[styles.card, !goal.isActive && styles.inactiveCard]}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {goal.title}
            </Text>
            <View style={styles.priorityBadge}>
              <Text 
                variant="labelSmall" 
                style={[styles.priorityText, { color: getPriorityColor(goal.priority) }]}
              >
                {getPriorityLabel(goal.priority)}
              </Text>
            </View>
          </View>
          <Text variant="bodyMedium" style={styles.status}>
            {getStatusMessage()}
          </Text>
        </View>

        {/* Description */}
        {goal.description && (
          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.outline }]}>
            {goal.description}
          </Text>
        )}

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.amountRow}>
            <Text variant="bodyLarge" style={styles.currentAmount}>
              {formatCurrency(goal.currentAmount)}
            </Text>
            <Text variant="bodyMedium" style={[styles.targetAmount, { color: theme.colors.outline }]}>
              de {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
          
          <ProgressBar 
            progress={Math.min(progress, 1)} 
            style={styles.progressBar}
            color={progress >= 1 ? theme.colors.primary : theme.colors.secondary}
          />
          
          <Text variant="bodySmall" style={[styles.percentage, { color: theme.colors.outline }]}>
            {Math.round(progress * 100)}% concluído
          </Text>
        </View>

        {/* Target Info */}
        <View style={styles.targetInfo}>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Meta:</Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {formatDate(goal.targetDate)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Dias restantes:</Text>
            <Text 
              variant="bodyMedium" 
              style={[
                styles.infoValue,
                { color: daysRemaining < 30 ? theme.colors.error : theme.colors.onSurface }
              ]}
            >
              {daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencido'}
            </Text>
          </View>
          
          {remainingAmount > 0 && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Falta:</Text>
              <Text variant="bodyMedium" style={[styles.infoValue, styles.remainingAmount]}>
                {formatCurrency(remainingAmount)}
              </Text>
            </View>
          )}
        </View>

        {/* Projection */}
        {remainingAmount > 0 && daysRemaining > 0 && (
          <View style={styles.projection}>
            <Text variant="bodyMedium" style={[styles.projectionText, { color: theme.colors.outline }]}>
              💡 Para atingir a meta, economize {formatCurrency(monthlyRequired)} por mês
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button 
            mode="outlined" 
            style={styles.actionButton}
            onPress={onEditPress}
          >
            Editar
          </Button>
          <Button 
            mode="contained" 
            style={styles.actionButton}
            onPress={onAddFundsPress}
          >
            Adicionar Valor
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 8,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderColor: 'transparent',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  status: {
    fontWeight: '500',
  },
  description: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  currentAmount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  targetAmount: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  percentage: {
    fontSize: 12,
    textAlign: 'right',
  },
  targetInfo: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoValue: {
    fontWeight: '600',
  },
  remainingAmount: {
    color: '#F44336',
  },
  projection: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  projectionText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default GoalProgress;






