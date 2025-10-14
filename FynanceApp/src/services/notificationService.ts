import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface NotificationSchedule {
  id: string;
  title: string;
  message: string;
  date: Date;
  type: 'card_due' | 'goal_reminder' | 'spending_alert' | 'weekly_summary' | 'monthly_summary';
  data?: any;
}

class NotificationService {
  private readonly STORAGE_KEY = '@fynance:notification_settings';

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Simulated initialization - in production would configure actual push notifications
    console.log('NotificationService initialized');
  }

  private handleNotificationTap(notification: any) {
    // Navigate to appropriate screen based on notification type
    const { type, data } = notification.data || {};
    
    switch (type) {
      case 'card_due':
        // Navigate to cards screen
        break;
      case 'goal_reminder':
        // Navigate to goals screen
        break;
      case 'spending_alert':
        // Navigate to dashboard
        break;
      default:
        // Navigate to notifications screen
        break;
    }
  }

  /**
   * Schedule a local notification (simulated for demo)
   */
  scheduleNotification(schedule: NotificationSchedule): void {
    console.log(`📅 Notificação agendada: ${schedule.title} para ${schedule.date.toLocaleString('pt-BR')}`);
    // Store scheduled notification for demo purposes
    this.storeScheduledNotification(schedule);
  }

  /**
   * Send immediate notification (simulated with Alert for demo)
   */
  sendImmediateNotification(title: string, message: string, type: string, data?: any): void {
    console.log(`🔔 Notificação imediata: ${title} - ${message}`);
    // Show alert as demo notification
    Alert.alert(title, message, [{ text: 'OK' }]);
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(id: string): void {
    console.log(`❌ Cancelando notificação: ${id}`);
    this.removeScheduledNotification(id);
  }

  /**
   * Cancel all notifications
   */
  cancelAllNotifications(): void {
    console.log('❌ Cancelando todas as notificações');
    AsyncStorage.removeItem('@fynance:scheduled_notifications');
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('@fynance:scheduled_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private async storeScheduledNotification(notification: NotificationSchedule): Promise<void> {
    try {
      const existing = await this.getScheduledNotifications();
      existing.push(notification);
      await AsyncStorage.setItem('@fynance:scheduled_notifications', JSON.stringify(existing));
    } catch (error) {
      console.error('Erro ao armazenar notificação:', error);
    }
  }

  private async removeScheduledNotification(id: string): Promise<void> {
    try {
      const existing = await this.getScheduledNotifications();
      const filtered = existing.filter((n: any) => n.id !== id);
      await AsyncStorage.setItem('@fynance:scheduled_notifications', JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
    }
  }

  /**
   * Schedule card due date notifications
   */
  async scheduleCardDueNotifications(cards: any[]): Promise<void> {
    // Cancel existing card notifications
    const scheduled = await this.getScheduledNotifications();
    scheduled
      .filter(n => n.userInfo?.type === 'card_due')
      .forEach(n => this.cancelNotification(n.id));

    // Schedule new notifications
    cards.forEach(card => {
      if (card.dueDate) {
        const dueDate = new Date(card.dueDate);
        
        // 3 days before
        const threeDaysBefore = new Date(dueDate);
        threeDaysBefore.setDate(dueDate.getDate() - 3);
        threeDaysBefore.setHours(9, 0, 0, 0); // 9:00 AM
        
        if (threeDaysBefore > new Date()) {
          this.scheduleNotification({
            id: `card_due_3d_${card.id}`,
            title: '💳 Cartão vence em 3 dias',
            message: `Seu cartão ${card.name} vence em 3 dias. Valor: R$ ${card.currentBill?.toFixed(2)}`,
            date: threeDaysBefore,
            type: 'card_due',
            data: { cardId: card.id }
          });
        }

        // 1 day before
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(dueDate.getDate() - 1);
        oneDayBefore.setHours(10, 0, 0, 0); // 10:00 AM
        
        if (oneDayBefore > new Date()) {
          this.scheduleNotification({
            id: `card_due_1d_${card.id}`,
            title: '⚠️ Cartão vence amanhã!',
            message: `Não esqueça! Seu cartão ${card.name} vence amanhã. Valor: R$ ${card.currentBill?.toFixed(2)}`,
            date: oneDayBefore,
            type: 'card_due',
            data: { cardId: card.id }
          });
        }
      }
    });
  }

  /**
   * Schedule goal reminder notifications
   */
  async scheduleGoalReminders(goals: any[]): Promise<void> {
    // Cancel existing goal notifications
    const scheduled = await this.getScheduledNotifications();
    scheduled
      .filter(n => n.userInfo?.type === 'goal_reminder')
      .forEach(n => this.cancelNotification(n.id));

    // Schedule weekly reminders for active goals
    goals
      .filter(goal => goal.isActive && goal.currentAmount < goal.targetAmount)
      .forEach(goal => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(18, 0, 0, 0); // 6:00 PM

        const progressPercentage = (goal.currentAmount / goal.targetAmount * 100).toFixed(0);
        
        this.scheduleNotification({
          id: `goal_reminder_${goal.id}`,
          title: `🎯 Como está sua meta "${goal.title}"?`,
          message: `Você já conquistou ${progressPercentage}% da sua meta. Que tal adicionar mais um pouco?`,
          date: nextWeek,
          type: 'goal_reminder',
          data: { goalId: goal.id }
        });
      });
  }

  /**
   * Schedule spending alerts
   */
  checkSpendingLimits(transactions: any[], budgets: any[]): void {
    budgets.forEach(budget => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlySpending = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === currentMonth && 
                 tDate.getFullYear() === currentYear &&
                 t.category === budget.category &&
                 t.type === 'expense';
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const percentage = (monthlySpending / budget.limit) * 100;

      if (percentage >= 80 && percentage < 100) {
        this.sendImmediateNotification(
          '⚠️ Limite de gastos',
          `Você já gastou ${percentage.toFixed(0)}% do orçamento em ${budget.category}`,
          'spending_alert',
          { category: budget.category, percentage }
        );
      } else if (percentage >= 100) {
        this.sendImmediateNotification(
          '🚨 Orçamento estourado!',
          `Você excedeu o limite de ${budget.category} em ${(percentage - 100).toFixed(0)}%`,
          'spending_alert',
          { category: budget.category, percentage }
        );
      }
    });
  }

  /**
   * Schedule weekly summary
   */
  scheduleWeeklySummary(): void {
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    nextSunday.setHours(19, 0, 0, 0); // 7:00 PM Sunday

    this.scheduleNotification({
      id: 'weekly_summary',
      title: '📊 Resumo da Semana',
      message: 'Veja como foram seus gastos esta semana e planeje a próxima!',
      date: nextSunday,
      type: 'weekly_summary',
      data: {}
    });
  }

  /**
   * Schedule monthly summary
   */
  scheduleMonthlySummary(): void {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(20, 0, 0, 0); // 8:00 PM on 1st of next month

    this.scheduleNotification({
      id: 'monthly_summary',
      title: '📈 Relatório Mensal Pronto',
      message: 'Seu resumo financeiro do mês está disponível. Confira suas conquistas!',
      date: nextMonth,
      type: 'monthly_summary',
      data: {}
    });
  }

  /**
   * Achievement notification
   */
  notifyAchievement(achievement: any): void {
    this.sendImmediateNotification(
      '🏆 Nova Conquista!',
      `Parabéns! Você desbloqueou "${achievement.title}"`,
      'achievement',
      { achievementId: achievement.id }
    );
  }

  /**
   * Goal completed notification
   */
  notifyGoalCompleted(goal: any): void {
    this.sendImmediateNotification(
      '🎉 Meta Alcançada!',
      `Incrível! Você atingiu sua meta "${goal.title}" de R$ ${goal.targetAmount.toFixed(2)}!`,
      'goal_completed',
      { goalId: goal.id }
    );
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem(this.STORAGE_KEY);
      return settings ? JSON.parse(settings) : {
        cardReminders: true,
        goalReminders: true,
        spendingAlerts: true,
        weeklySummary: true,
        monthlySummary: true,
        achievements: true,
      };
    } catch (error) {
      return {
        cardReminders: true,
        goalReminders: true,
        spendingAlerts: true,
        weeklySummary: true,
        monthlySummary: true,
        achievements: true,
      };
    }
  }

  /**
   * Save notification settings
   */
  async saveNotificationSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de notificação:', error);
    }
  }

  /**
   * Request notification permissions (simulated for demo)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Simulate permission request
      console.log('🔔 Solicitando permissões de notificação...');
      // Always return true for demo
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
