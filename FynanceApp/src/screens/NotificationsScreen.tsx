import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Chip,
  IconButton,
  Badge,
  FAB,
  Searchbar,
  Surface,
  Avatar,
  ToggleButton,
  Divider
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import pluggyService, { PluggyTransaction } from '../services/pluggyService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'achievement' | 'reminder';
  category: 'transaction' | 'goal' | 'card' | 'system' | 'achievement' | 'reminder';
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  data?: any;
}

const NotificationsScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Gerar notificações inteligentes baseadas nos dados do Open Finance
  const generateSmartNotifications = async () => {
    try {
      const cachedAccounts = await pluggyService.getCachedAccounts();
      const cachedTransactions = await pluggyService.getCachedTransactions();
      const storedGoals = await AsyncStorage.getItem('@fynance:goals');
      const goals = storedGoals ? JSON.parse(storedGoals) : [];

      const smartNotifications: Notification[] = [];

      // 1. Notificações de Cartões de Crédito
      const creditCards = cachedAccounts.filter(acc => acc.type === 'CREDIT');
      creditCards.forEach((card: any) => {
        if (card.creditData?.balanceDueDate) {
          const dueDate = new Date(card.creditData.balanceDueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            smartNotifications.push({
              id: `card-due-${card.id}`,
              title: '💳 Vencimento Próximo',
              message: `Seu cartão ${card.name} vence em ${daysUntilDue} dia(s). Fatura: ${formatCurrency(card.balance)}`,
              type: 'warning',
              category: 'card',
              isRead: false,
              createdAt: new Date().toISOString(),
              priority: 'high',
              actionRequired: true
            });
          }
        }
      });

      // 2. Notificações de Transações Grandes
      const recentTransactions = cachedTransactions
        .filter(t => new Date(t.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
      
      if (recentTransactions.length > 0) {
        const largestTransaction = recentTransactions[0];
        if (Math.abs(largestTransaction.amount) > 1000) {
          smartNotifications.push({
            id: `transaction-large-${largestTransaction.id}`,
            title: '💰 Transação Grande Detectada',
            message: `${largestTransaction.description}: ${formatCurrency(Math.abs(largestTransaction.amount))}`,
            type: 'info',
            category: 'transaction',
            isRead: false,
            createdAt: largestTransaction.date,
            priority: 'medium'
          });
        }
      }

      // 3. Notificações de Metas
      goals.forEach((goal: any) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        
        if (progress >= 90 && progress < 100) {
          smartNotifications.push({
            id: `goal-almost-${goal.id}`,
            title: '🎯 Meta Quase Alcançada!',
            message: `Faltam apenas ${formatCurrency(goal.targetAmount - goal.currentAmount)} para atingir "${goal.name}"!`,
            type: 'success',
            category: 'goal',
            isRead: false,
            createdAt: new Date().toISOString(),
            priority: 'high'
          });
        } else if (progress >= 100) {
          smartNotifications.push({
            id: `goal-complete-${goal.id}`,
            title: '🎉 Meta Alcançada!',
            message: `Parabéns! Você atingiu sua meta "${goal.name}": ${formatCurrency(goal.targetAmount)}!`,
            type: 'achievement',
            category: 'goal',
            isRead: false,
            createdAt: new Date().toISOString(),
            priority: 'high'
          });
        }
      });

      // 4. Notificação de Saldo Baixo
      const totalBalance = cachedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
      if (totalBalance < 500 && totalBalance > 0) {
        smartNotifications.push({
          id: 'balance-low',
          title: '⚠️ Saldo Baixo',
          message: `Seu saldo total está em ${formatCurrency(totalBalance)}. Considere reduzir gastos.`,
          type: 'warning',
          category: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
          priority: 'high',
          actionRequired: true
        });
      }

      // 5. Análise de Gastos Recorrentes
      const descriptions: Record<string, number> = {};
      cachedTransactions.forEach(t => {
        if (t.amount < 0) {
          descriptions[t.description] = (descriptions[t.description] || 0) + 1;
        }
      });
      const recurring = Object.entries(descriptions).filter(([_, count]) => count > 3);
      if (recurring.length > 0) {
        smartNotifications.push({
          id: 'recurring-expenses',
          title: '🔄 Gastos Recorrentes',
          message: `Detectamos ${recurring.length} gastos que se repetem. Considere criar alertas.`,
          type: 'info',
          category: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
          priority: 'medium'
        });
      }

      // 6. Boas-vindas se for primeira vez
      if (cachedAccounts.length > 0 && smartNotifications.length === 0) {
        smartNotifications.push({
          id: 'welcome',
          title: '👋 Bem-vindo ao Fynance!',
          message: `Suas ${cachedAccounts.length} contas foram conectadas com sucesso! Explore o app para ver insights e análises.`,
          type: 'success',
          category: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
          priority: 'medium'
        });
      }

      // Mesclar com notificações existentes do AsyncStorage
      const storedNotifications = await AsyncStorage.getItem('@fynance:notifications');
      const existing = storedNotifications ? JSON.parse(storedNotifications) : [];
      
      // Remover duplicatas
      const allNotifications = [...smartNotifications, ...existing].filter((notif, index, self) =>
        index === self.findIndex(t => t.id === notif.id)
      );

      // Salvar e atualizar
      await AsyncStorage.setItem('@fynance:notifications', JSON.stringify(allNotifications));
      setNotifications(allNotifications);
    } catch (error) {
      console.error('❌ Erro ao gerar notificações:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useFocusEffect(
    useCallback(() => {
      generateSmartNotifications();
    }, [])
  );

  useEffect(() => {
    let filtered = notifications;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(n => n.category === selectedFilter);
    }

    // Filter by read status
    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, selectedFilter, showUnreadOnly]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await generateSmartNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    await AsyncStorage.setItem('@fynance:notifications', JSON.stringify(updated));
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    await AsyncStorage.setItem('@fynance:notifications', JSON.stringify(updated));
  };

  const handleNotificationAction = (notification: Notification) => {
    console.log('Action for notification:', notification.id);
    // Handle specific actions based on notification type
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return 'trophy';
      case 'warning': return 'alert';
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'reminder': return 'bell';
      default: return 'information';
    }
  };

  const getNotificationAvatarColor = (type: string) => {
    switch (type) {
      case 'achievement': return '#ffd700';
      case 'warning': return '#ff9800';
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'reminder': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const filterOptions = [
    { key: 'transaction', label: 'Transações', icon: 'credit-card' },
    { key: 'goal', label: 'Metas', icon: 'target' },
    { key: 'card', label: 'Cartões', icon: 'credit-card-outline' },
    { key: 'achievement', label: 'Conquistas', icon: 'trophy' },
    { key: 'reminder', label: 'Lembretes', icon: 'bell' },
    { key: 'system', label: 'Sistema', icon: 'cog' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Modern Header */}
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleSection}>
            <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
              🔔 Notificações
            </Text>
            <Text variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.colors.onPrimary }]}>
              Mantenha-se atualizado com suas finanças
            </Text>
          </View>
          
          <View style={styles.headerStats}>
            {unreadCount > 0 && (
              <Surface style={[styles.unreadBadge, { backgroundColor: theme.colors.error }]} elevation={2}>
                <Text variant="bodySmall" style={[styles.unreadBadgeText, { color: theme.colors.onError }]}>
                  {unreadCount} novas
                </Text>
              </Surface>
            )}
          </View>
        </View>
      </Surface>

      {/* Quick Actions Bar */}
      <Surface style={styles.quickActionsBar} elevation={1}>
        <View style={styles.quickActions}>
          <View style={styles.actionGroup}>
            <ToggleButton
              icon={showUnreadOnly ? "eye" : "eye-off"}
              value="unread"
              status={showUnreadOnly ? 'checked' : 'unchecked'}
              onPress={() => setShowUnreadOnly(!showUnreadOnly)}
              size={20}
            />
            <Text variant="bodySmall" style={styles.quickActionLabel}>
              {showUnreadOnly ? 'Só não lidas' : 'Todas'}
            </Text>
          </View>
          
          <Divider style={styles.actionDivider} />
          
          <View style={styles.actionGroup}>
            <IconButton
              icon="check-all"
              size={20}
              onPress={markAllAsRead}
              mode="contained-tonal"
            />
            <Text variant="bodySmall" style={styles.quickActionLabel}>
              Marcar todas
            </Text>
          </View>
        </View>
      </Surface>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar notificações..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          elevation={1}
        />
      </View>

      {/* Modern Filter Chips */}
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <Chip
            mode={selectedFilter === 'all' ? 'flat' : 'outlined'}
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            style={styles.modernFilterChip}
            showSelectedOverlay={true}
          >
            Todas ({notifications.length})
          </Chip>
          
          {filterOptions.map(option => {
            const count = notifications.filter(n => n.category === option.key).length;
            return (
              <Chip
                key={option.key}
                mode={selectedFilter === option.key ? 'flat' : 'outlined'}
                selected={selectedFilter === option.key}
                onPress={() => setSelectedFilter(option.key)}
                style={styles.modernFilterChip}
                icon={option.icon}
                showSelectedOverlay={true}
              >
                {option.label} ({count})
              </Chip>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Surface style={styles.emptyStateCard} elevation={2}>
              <View style={styles.emptyContent}>
                <Avatar.Icon 
                  size={80} 
                  icon="bell-sleep" 
                  style={[styles.emptyIcon, { backgroundColor: theme.colors.primaryContainer }]}
                />
                <Text variant="headlineSmall" style={styles.emptyTitle}>
                  {searchQuery ? 'Nada encontrado' : 'Tudo em dia!'}
                </Text>
                <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.outline }]}>
                  {searchQuery 
                    ? 'Tente buscar com outras palavras'
                    : selectedFilter === 'all'
                    ? 'Você não tem notificações pendentes'
                    : 'Nenhuma notificação nesta categoria'
                  }
                </Text>
                {!searchQuery && selectedFilter === 'all' && (
                  <Button 
                    mode="contained-tonal"
                    onPress={() => setSelectedFilter('achievement')}
                    style={styles.emptyAction}
                  >
                    Ver Conquistas
                  </Button>
                )}
              </View>
            </Surface>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {filteredNotifications.map((notification, index) => (
              <Surface
                key={notification.id}
                style={[
                  styles.modernNotificationCard,
                  !notification.isRead && styles.unreadCard,
                ]}
                elevation={notification.isRead ? 1 : 3}
              >
                <Card.Content style={styles.modernNotificationContent}>
                  <View style={styles.notificationRow}>
                    {/* Left: Icon & Content */}
                    <View style={styles.notificationLeft}>
                      <Avatar.Icon 
                        size={48} 
                        icon={getNotificationIcon(notification.type)}
                        style={[
                          styles.notificationAvatar,
                          { backgroundColor: getNotificationAvatarColor(notification.type) }
                        ]}
                      />
                      
                      <View style={styles.notificationTextContent}>
                        <View style={styles.titleRow}>
                          <Text variant="titleMedium" style={[
                            styles.modernNotificationTitle,
                            !notification.isRead && styles.unreadTitle
                          ]}>
                            {notification.title.replace(/^[^\w\s]+\s*/, '')}
                          </Text>
                          {!notification.isRead && (
                            <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                          )}
                        </View>
                        
                        <Text variant="bodyMedium" style={[
                          styles.modernNotificationMessage,
                          { color: theme.colors.onSurface }
                        ]} numberOfLines={2}>
                          {notification.message}
                        </Text>
                        
                        <View style={styles.notificationFooter}>
                          <Chip 
                            mode="outlined" 
                            compact 
                            style={styles.modernPriorityChip}
                            textStyle={styles.priorityChipText}
                          >
                            {notification.priority === 'high' ? '🔴 Alta' : 
                             notification.priority === 'medium' ? '🟡 Média' : '🟢 Baixa'}
                          </Chip>
                          
                          <Text variant="bodySmall" style={[styles.modernTimeAgo, { color: theme.colors.outline }]}>
                            {getTimeAgo(notification.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Right: Actions */}
                    <View style={styles.notificationRight}>
                      <IconButton
                        icon={notification.isRead ? "email-open" : "email"}
                        size={20}
                        onPress={() => markAsRead(notification.id)}
                        mode="contained-tonal"
                      />
                      
                      {notification.actionRequired && (
                        <Button 
                          mode="contained" 
                          compact 
                          onPress={() => handleNotificationAction(notification)}
                          style={styles.modernActionButton}
                        >
                          Ação
                        </Button>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Surface>
            ))}
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modern FAB */}
      {__DEV__ && (
        <FAB
          icon="plus"
          style={[styles.modernFab, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            const testNotification: Notification = {
              id: Date.now().toString(),
              title: '🧪 Notificação de Teste',
              message: 'Esta é uma notificação de teste para demonstração da nova interface.',
              type: 'info',
              category: 'system',
              isRead: false,
              createdAt: new Date().toISOString(),
              priority: 'medium'
            };
            setNotifications(prev => [testNotification, ...prev]);
          }}
          label="Teste"
          extended={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSurface: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.9,
  },
  headerStats: {
    alignItems: 'center',
  },
  unreadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unreadBadgeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  quickActionsBar: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionGroup: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionLabel: {
    marginTop: 4,
    opacity: 0.7,
  },
  actionDivider: {
    height: 30,
    width: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchbar: {
    borderRadius: 12,
  },
  filtersWrapper: {
    paddingTop: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  modernFilterChip: {
    marginRight: 8,
  },
  notificationsList: {
    flex: 1,
    paddingTop: 16,
  },
  emptyStateContainer: {
    flex: 1,
    padding: 32,
  },
  emptyStateCard: {
    borderRadius: 16,
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 8,
  },
  notificationsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  modernNotificationCard: {
    borderRadius: 16,
    marginBottom: 8,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  modernNotificationContent: {
    padding: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationAvatar: {
    marginRight: 16,
  },
  notificationTextContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modernNotificationTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  unreadTitle: {
    color: '#1976d2',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  modernNotificationMessage: {
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernPriorityChip: {
    height: 24,
  },
  priorityChipText: {
    fontSize: 11,
  },
  modernTimeAgo: {
    fontSize: 12,
  },
  notificationRight: {
    alignItems: 'center',
    gap: 8,
  },
  modernActionButton: {
    minWidth: 60,
  },
  bottomSpacing: {
    height: 100,
  },
  modernFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default NotificationsScreen;