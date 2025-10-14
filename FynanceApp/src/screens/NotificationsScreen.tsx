import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

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

  // Mock notifications data with better variety
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: '🎉 Meta Alcançada!',
      message: 'Parabéns! Você atingiu sua meta de "Viagem dos Sonhos". R$ 5.000 conquistados!',
      type: 'achievement',
      category: 'goal',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      priority: 'high'
    },
    {
      id: '2',
      title: '💳 Vencimento Próximo',
      message: 'Seu cartão Nubank vence em 2 dias. Valor atual: R$ 1.247,85',
      type: 'warning',
      category: 'card',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      priority: 'high',
      actionRequired: true
    },
    {
      id: '3',
      title: '📊 Relatório Mensal',
      message: 'Seu relatório de dezembro está pronto! Economia de 15% comparado ao mês anterior.',
      type: 'info',
      category: 'system',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      priority: 'medium'
    },
    {
      id: '4',
      title: '⚠️ Limite de Gastos',
      message: 'Você já gastou 85% do seu orçamento em "Alimentação" este mês.',
      type: 'warning',
      category: 'transaction',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      priority: 'medium',
      actionRequired: true
    },
    {
      id: '5',
      title: '🏆 Nova Conquista!',
      message: 'Desbloqueou "Poupador Iniciante" - 30 dias consecutivos adicionando à reserva!',
      type: 'achievement',
      category: 'achievement',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      priority: 'low'
    },
    {
      id: '6',
      title: '💰 Transação Detectada',
      message: 'Nova transação: -R$ 45,90 - Uber *TRIP em sua conta Itaú',
      type: 'info',
      category: 'transaction',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      priority: 'low'
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

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
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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