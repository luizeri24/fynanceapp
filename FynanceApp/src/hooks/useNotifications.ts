import { useEffect, useState } from 'react';
// import { notificationService } from '../services/notificationService';
// import { mockCreditCards, mockGoals, mockTransactions } from '../data/mockData';

export const useNotifications = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    cardReminders: true,
    goalReminders: true,
    spendingAlerts: true,
    weeklySummary: true,
    monthlySummary: true,
    achievements: true,
  });
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Simulate permissions granted for demo (simplified)
      setPermissionsGranted(true);
      console.log('Notificações inicializadas com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
      setPermissionsGranted(false);
    }
  };

  const scheduleAllNotifications = async () => {
    try {
      const settings = await notificationService.getNotificationSettings();

      // Schedule card reminders
      if (settings.cardReminders) {
        await notificationService.scheduleCardDueNotifications(mockCreditCards);
      }

      // Schedule goal reminders
      if (settings.goalReminders) {
        await notificationService.scheduleGoalReminders(mockGoals);
      }

      // Schedule weekly summary
      if (settings.weeklySummary) {
        notificationService.scheduleWeeklySummary();
      }

      // Schedule monthly summary
      if (settings.monthlySummary) {
        notificationService.scheduleMonthlySummary();
      }

      // Check spending limits
      if (settings.spendingAlerts) {
        const budgets = [
          { category: 'Alimentação', limit: 800 },
          { category: 'Transporte', limit: 400 },
          { category: 'Entretenimento', limit: 300 },
          { category: 'Compras', limit: 500 },
        ];
        notificationService.checkSpendingLimits(mockTransactions, budgets);
      }
    } catch (error) {
      console.error('Erro ao agendar notificações:', error);
    }
  };

  const updateNotificationSettings = async (newSettings: any) => {
    try {
      await notificationService.saveNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      
      // Reschedule notifications based on new settings
      if (permissionsGranted) {
        notificationService.cancelAllNotifications();
        scheduleAllNotifications();
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
    }
  };

  const sendTestNotification = () => {
    // Simplified test notification
    console.log('🔔 Teste de notificação');
    alert('🧪 Notificação de Teste\n\nEsta é uma notificação de teste do Fynance!');
  };

  const notifyGoalProgress = (goal: any, amount: number) => {
    if (notificationSettings.goalReminders) {
      const newTotal = goal.currentAmount + amount;
      const percentage = (newTotal / goal.targetAmount * 100).toFixed(0);
      
      notificationService.sendImmediateNotification(
        `🎯 Progresso na meta "${goal.title}"`,
        `Ótimo! Você adicionou R$ ${amount.toFixed(2)}. Agora está ${percentage}% da meta!`,
        'goal_progress',
        { goalId: goal.id, newAmount: newTotal }
      );

      // Check if goal is completed
      if (newTotal >= goal.targetAmount) {
        notificationService.notifyGoalCompleted(goal);
      }
    }
  };

  const notifyNewTransaction = (transaction: any) => {
    if (notificationSettings.spendingAlerts && transaction.type === 'expense' && Math.abs(transaction.amount) > 100) {
      notificationService.sendImmediateNotification(
        '💰 Nova transação',
        `Gasto de R$ ${Math.abs(transaction.amount).toFixed(2)} em ${transaction.category}`,
        'transaction',
        { transactionId: transaction.id }
      );
    }
  };

  const notifyCardPayment = (card: any) => {
    if (notificationSettings.cardReminders) {
      notificationService.sendImmediateNotification(
        '✅ Cartão pago!',
        `Pagamento do cartão ${card.name} confirmado. Parabéns pela organização!`,
        'card_payment',
        { cardId: card.id }
      );
    }
  };

  return {
    notificationSettings,
    permissionsGranted,
    updateNotificationSettings,
    sendTestNotification,
    notifyGoalProgress,
    notifyNewTransaction,
    notifyCardPayment,
    scheduleAllNotifications,
    requestPermissions: async () => {
      // Simplified permission request
      console.log('🔔 Solicitando permissões...');
      setPermissionsGranted(true);
      return true;
    }
  };
};
