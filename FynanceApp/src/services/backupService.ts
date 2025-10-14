import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share, Alert } from 'react-native';

export interface BackupData {
  version: string;
  timestamp: string;
  user: any;
  transactions: any[];
  goals: any[];
  accounts: any[];
  creditCards: any[];
  settings: any;
  notificationSettings: any;
}

export interface ExportOptions {
  includeTransactions: boolean;
  includeGoals: boolean;
  includeAccounts: boolean;
  includeCreditCards: boolean;
  includeSettings: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

class BackupService {
  private readonly APP_VERSION = '1.0.0';

  /**
   * Create complete backup of user data
   */
  async createBackup(): Promise<BackupData> {
    try {
      const [
        user,
        transactions,
        goals,
        accounts,
        creditCards,
        settings,
        notificationSettings
      ] = await Promise.all([
        AsyncStorage.getItem('@fynance:user'),
        AsyncStorage.getItem('@fynance:transactions'),
        AsyncStorage.getItem('@fynance:goals'),
        AsyncStorage.getItem('@fynance:accounts'),
        AsyncStorage.getItem('@fynance:credit_cards'),
        AsyncStorage.getItem('@fynance:settings'),
        AsyncStorage.getItem('@fynance:notification_settings'),
      ]);

      const backup: BackupData = {
        version: this.APP_VERSION,
        timestamp: new Date().toISOString(),
        user: user ? JSON.parse(user) : null,
        transactions: transactions ? JSON.parse(transactions) : [],
        goals: goals ? JSON.parse(goals) : [],
        accounts: accounts ? JSON.parse(accounts) : [],
        creditCards: creditCards ? JSON.parse(creditCards) : [],
        settings: settings ? JSON.parse(settings) : {},
        notificationSettings: notificationSettings ? JSON.parse(notificationSettings) : {}
      };

      return backup;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw new Error('Falha ao criar backup dos dados');
    }
  }

  /**
   * Export data to JSON file
   */
  async exportToJSON(options: ExportOptions = {
    includeTransactions: true,
    includeGoals: true,
    includeAccounts: true,
    includeCreditCards: true,
    includeSettings: true
  }): Promise<string> {
    try {
      const backup = await this.createBackup();
      
      // Filter data based on options
      const exportData: any = {
        version: backup.version,
        timestamp: backup.timestamp,
        user: backup.user
      };

      if (options.includeTransactions) {
        exportData.transactions = this.filterTransactionsByDate(
          backup.transactions, 
          options.dateRange
        );
      }

      if (options.includeGoals) {
        exportData.goals = backup.goals;
      }

      if (options.includeAccounts) {
        exportData.accounts = backup.accounts;
      }

      if (options.includeCreditCards) {
        exportData.creditCards = backup.creditCards;
      }

      if (options.includeSettings) {
        exportData.settings = backup.settings;
        exportData.notificationSettings = backup.notificationSettings;
      }

      // Create JSON string for sharing
      const fileName = `fynance_backup_${new Date().toISOString().split('T')[0]}.json`;
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Return data for sharing (simulated file path)
      console.log(`📁 Backup JSON criado: ${fileName} (${jsonData.length} caracteres)`);
      return jsonData;
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      throw new Error('Falha ao exportar dados');
    }
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactionsToCSV(transactions: any[], dateRange?: { start: string; end: string }): Promise<string> {
    try {
      const filteredTransactions = this.filterTransactionsByDate(transactions, dateRange);
      
      // CSV Headers
      const headers = [
        'Data',
        'Descrição',
        'Categoria',
        'Tipo',
        'Valor',
        'Conta',
        'Cartão'
      ];

      // CSV Rows
      const rows = filteredTransactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString('pt-BR'),
        transaction.description,
        transaction.category,
        transaction.type === 'income' ? 'Receita' : 'Despesa',
        transaction.amount.toFixed(2).replace('.', ','),
        transaction.accountId || '',
        transaction.creditCardId || ''
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(';'))
        .join('\n');

      // Create CSV content for sharing
      const fileName = `fynance_transacoes_${new Date().toISOString().split('T')[0]}.csv`;
      
      console.log(`📊 CSV criado: ${fileName} (${csvContent.length} caracteres)`);
      return csvContent;
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      throw new Error('Falha ao exportar transações');
    }
  }

  /**
   * Share backup content (simplified for demo)
   */
  async shareBackup(content: string, type: 'json' | 'csv' = 'json'): Promise<void> {
    try {
      // Use React Native's built-in Share
      const fileName = type === 'json' 
        ? `fynance_backup_${new Date().toISOString().split('T')[0]}.json`
        : `fynance_transacoes_${new Date().toISOString().split('T')[0]}.csv`;
      
      await Share.share({
        message: `Backup Fynance - ${fileName}\n\nConteúdo:\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`,
        title: 'Backup Fynance',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o backup');
    }
  }

  /**
   * Import backup from JSON
   */
  async importBackup(backupData: BackupData): Promise<void> {
    try {
      // Validate backup format
      if (!backupData.version || !backupData.timestamp) {
        throw new Error('Formato de backup inválido');
      }

      // Store each data type
      const storageOperations = [];

      if (backupData.user) {
        storageOperations.push(['@fynance:user', JSON.stringify(backupData.user)]);
      }

      if (backupData.transactions) {
        storageOperations.push(['@fynance:transactions', JSON.stringify(backupData.transactions)]);
      }

      if (backupData.goals) {
        storageOperations.push(['@fynance:goals', JSON.stringify(backupData.goals)]);
      }

      if (backupData.accounts) {
        storageOperations.push(['@fynance:accounts', JSON.stringify(backupData.accounts)]);
      }

      if (backupData.creditCards) {
        storageOperations.push(['@fynance:credit_cards', JSON.stringify(backupData.creditCards)]);
      }

      if (backupData.settings) {
        storageOperations.push(['@fynance:settings', JSON.stringify(backupData.settings)]);
      }

      if (backupData.notificationSettings) {
        storageOperations.push(['@fynance:notification_settings', JSON.stringify(backupData.notificationSettings)]);
      }

      // Store import timestamp
      storageOperations.push(['@fynance:last_import', new Date().toISOString()]);

      await AsyncStorage.multiSet(storageOperations as any);

    } catch (error) {
      console.error('Erro ao importar backup:', error);
      throw new Error('Falha ao importar dados');
    }
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport(): Promise<string> {
    try {
      const backup = await this.createBackup();
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Calculate statistics
      const totalAccounts = backup.accounts.length;
      const totalGoals = backup.goals.length;
      const activeGoals = backup.goals.filter((g: any) => g.isActive).length;
      
      const monthlyTransactions = backup.transactions.filter((t: any) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      });

      const monthlyIncome = monthlyTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const monthlyExpenses = monthlyTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      const totalBalance = backup.accounts.reduce((sum: number, a: any) => sum + a.balance, 0);

      // Generate report
      const report = `
RELATÓRIO FINANCEIRO FYNANCE
============================

Data: ${currentDate.toLocaleDateString('pt-BR')}
Versão: ${backup.version}

RESUMO GERAL
------------
• Contas cadastradas: ${totalAccounts}
• Saldo total: R$ ${totalBalance.toFixed(2)}
• Metas ativas: ${activeGoals} de ${totalGoals}

MOVIMENTAÇÃO DO MÊS (${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
--------------------
• Receitas: R$ ${monthlyIncome.toFixed(2)}
• Despesas: R$ ${monthlyExpenses.toFixed(2)}
• Saldo do mês: R$ ${(monthlyIncome - monthlyExpenses).toFixed(2)}
• Total de transações: ${monthlyTransactions.length}

CATEGORIAS MAIS UTILIZADAS
--------------------------
${this.getTopCategories(monthlyTransactions).map((cat: any, index: number) => 
  `${index + 1}. ${cat.category}: R$ ${Math.abs(cat.total).toFixed(2)} (${cat.count} transações)`
).join('\n')}

METAS EM ANDAMENTO
------------------
${backup.goals.filter((g: any) => g.isActive).map((goal: any) => {
  const progress = (goal.currentAmount / goal.targetAmount * 100).toFixed(1);
  return `• ${goal.title}: ${progress}% (R$ ${goal.currentAmount.toFixed(2)} de R$ ${goal.targetAmount.toFixed(2)})`;
}).join('\n')}

Relatório gerado automaticamente pelo Fynance
      `.trim();

      // Return report content
      const fileName = `fynance_relatorio_${new Date().toISOString().split('T')[0]}.txt`;
      
      console.log(`📄 Relatório criado: ${fileName} (${report.length} caracteres)`);
      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw new Error('Falha ao gerar relatório');
    }
  }

  /**
   * Get backup file info
   */
  async getBackupInfo(): Promise<any> {
    try {
      const lastBackup = await AsyncStorage.getItem('@fynance:last_backup');
      const lastImport = await AsyncStorage.getItem('@fynance:last_import');
      
      return {
        lastBackup: lastBackup ? new Date(lastBackup) : null,
        lastImport: lastImport ? new Date(lastImport) : null,
        appVersion: this.APP_VERSION
      };
    } catch (error) {
      return {
        lastBackup: null,
        lastImport: null,
        appVersion: this.APP_VERSION
      };
    }
  }

  /**
   * Clean old backup files (simulated)
   */
  async cleanOldBackups(keepDays: number = 30): Promise<void> {
    try {
      console.log(`🧹 Limpando backups com mais de ${keepDays} dias...`);
      // In a real app, this would clean actual files
      // For demo, we just clean stored backup references
      await AsyncStorage.removeItem('@fynance:old_backups');
      console.log('✅ Limpeza concluída');
    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
    }
  }

  // Private methods

  private filterTransactionsByDate(transactions: any[], dateRange?: { start: string; end: string }): any[] {
    if (!dateRange) return transactions;

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  private getTopCategories(transactions: any[], limit: number = 5): any[] {
    const categoryMap = new Map();

    transactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, count: 0 });
      }
      
      const current = categoryMap.get(category);
      current.total += Math.abs(transaction.amount);
      current.count += 1;
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }
}

export const backupService = new BackupService();
