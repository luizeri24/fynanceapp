import { Achievement, Transaction, Account, Goal, CreditCard } from '../types';

interface UserData {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  creditCards: CreditCard[];
}

export class AchievementService {
  /**
   * Determina quais conquistas foram desbloqueadas com base nos dados do usuário
   */
  static checkUnlockedAchievements(
    userData: UserData,
    currentAchievements: Achievement[]
  ): Achievement[] {
    return currentAchievements.map(achievement => {
      const isUnlocked = this.evaluateAchievementCriteria(achievement, userData);
      
      // Se a conquista foi desbloqueada agora e não estava antes
      if (isUnlocked && !achievement.isUnlocked) {
        return {
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date().toISOString()
        };
      }
      
      return achievement;
    });
  }

  /**
   * Avalia se uma conquista específica deve ser desbloqueada
   */
  private static evaluateAchievementCriteria(
    achievement: Achievement,
    userData: UserData
  ): boolean {
    switch (achievement.id) {
      case '1': // Primeiro Passo
        return userData.transactions.length > 0;

      case '2': // Economizador
        return this.hasMonthlyEconomyTarget(userData, 1000);

      case '3': // Planejador
        return userData.goals.length > 0;

      case '4': // Milionário
        return this.getTotalPatrimony(userData) >= 100000;

      case '5': // Disciplinado
        return this.hasConsecutiveMonthsWithinBudget(userData, 3);

      default:
        return achievement.isUnlocked;
    }
  }

  /**
   * Verifica se o usuário economizou um valor mínimo em algum mês
   */
  private static hasMonthlyEconomyTarget(userData: UserData, target: number): boolean {
    const monthlyData = this.getMonthlyData(userData.transactions);
    
    return Object.values(monthlyData).some(month => {
      const balance = month.income - month.expenses;
      return balance >= target;
    });
  }

  /**
   * Calcula o patrimônio total do usuário
   */
  private static getTotalPatrimony(userData: UserData): number {
    const totalBalance = userData.accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalCreditDebt = userData.creditCards.reduce((sum, card) => sum + card.currentBalance, 0);
    
    return totalBalance - totalCreditDebt;
  }

  /**
   * Verifica se o usuário ficou dentro do orçamento por X meses consecutivos
   */
  private static hasConsecutiveMonthsWithinBudget(
    userData: UserData, 
    consecutiveMonths: number,
    monthlyBudget: number = 3000
  ): boolean {
    const monthlyData = this.getMonthlyData(userData.transactions);
    const sortedMonths = Object.keys(monthlyData).sort();
    
    let consecutiveCount = 0;
    
    for (const month of sortedMonths) {
      const expenses = monthlyData[month].expenses;
      
      if (expenses <= monthlyBudget) {
        consecutiveCount++;
        if (consecutiveCount >= consecutiveMonths) {
          return true;
        }
      } else {
        consecutiveCount = 0;
      }
    }
    
    return false;
  }

  /**
   * Agrupa transações por mês
   */
  private static getMonthlyData(transactions: Transaction[]): Record<string, { income: number; expenses: number }> {
    return transactions.reduce((acc, transaction) => {
      const month = transaction.date.slice(0, 7); // YYYY-MM
      
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expenses += Math.abs(transaction.amount);
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);
  }

  /**
   * Retorna estatísticas gerais para gamificação
   */
  static getUserStats(userData: UserData) {
    const totalTransactions = userData.transactions.length;
    const totalPatrimony = this.getTotalPatrimony(userData);
    const activeGoals = userData.goals.filter(goal => goal.isActive).length;
    const completedGoals = userData.goals.filter(goal => 
      goal.currentAmount >= goal.targetAmount
    ).length;
    
    const monthlyData = this.getMonthlyData(userData.transactions);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthData = monthlyData[currentMonth] || { income: 0, expenses: 0 };
    
    return {
      totalTransactions,
      totalPatrimony,
      activeGoals,
      completedGoals,
      currentMonthBalance: currentMonthData.income - currentMonthData.expenses,
      totalMonthsTracked: Object.keys(monthlyData).length,
    };
  }

  /**
   * Sugere próximas conquistas a serem desbloqueadas
   */
  static getNextAchievementSuggestions(
    userData: UserData,
    achievements: Achievement[]
  ): string[] {
    const suggestions: string[] = [];
    const stats = this.getUserStats(userData);
    
    const lockedAchievements = achievements.filter(a => !a.isUnlocked);
    
    for (const achievement of lockedAchievements) {
      switch (achievement.id) {
        case '1':
          if (stats.totalTransactions === 0) {
            suggestions.push('Registre sua primeira transação para desbloquear "Primeiro Passo"');
          }
          break;
          
        case '2':
          if (stats.currentMonthBalance < 1000) {
            const needed = 1000 - stats.currentMonthBalance;
            suggestions.push(`Economize mais R$ ${needed.toFixed(2)} este mês para desbloquear "Economizador"`);
          }
          break;
          
        case '3':
          if (stats.activeGoals === 0) {
            suggestions.push('Crie sua primeira meta financeira para desbloquear "Planejador"');
          }
          break;
          
        case '4':
          if (stats.totalPatrimony < 100000) {
            const needed = 100000 - stats.totalPatrimony;
            suggestions.push(`Acumule mais R$ ${needed.toFixed(2)} em patrimônio para desbloquear "Milionário"`);
          }
          break;
          
        case '5':
          suggestions.push('Mantenha seus gastos dentro do orçamento por 3 meses consecutivos para desbloquear "Disciplinado"');
          break;
      }
    }
    
    return suggestions.slice(0, 3); // Retorna apenas as 3 primeiras sugestões
  }
}






