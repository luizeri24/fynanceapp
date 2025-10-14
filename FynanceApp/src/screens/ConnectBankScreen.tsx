import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Text, Button, Card, ActivityIndicator, IconButton, List } from 'react-native-paper';
import { PluggyConnect } from 'react-native-pluggy-connect';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pluggyService, { PluggyItem, PluggyAccount } from '../services/pluggyService';

const ConnectBankScreen = () => {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [savedConnectToken, setSavedConnectToken] = useState<string | null>(null);
  const [showPluggy, setShowPluggy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PluggyItem[]>([]);
  const [accounts, setAccounts] = useState<PluggyAccount[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🚀 ConnectBank: Componente montado, carregando dados...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 ConnectBank: Carregando dados...');
      
      // Primeiro, tenta carregar dados do cache
      const cachedItems = await pluggyService.getCachedItems();
      const cachedAccounts = await pluggyService.getCachedAccounts();
      
      if (cachedItems.length > 0) {
        console.log('✅ ConnectBank: Carregando dados do cache - Items:', cachedItems.length, 'Contas:', cachedAccounts.length);
        setItems(cachedItems);
        setAccounts(cachedAccounts);
        
        // Se temos um connectToken salvo, tentar buscar dados atualizados
        if (savedConnectToken) {
          console.log('🔄 Tentando atualizar dados reais...');
          try {
            const response = await fetch('https://api.pluggy.ai/items', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${savedConnectToken}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              const realItems = data.results || [];
              
              if (realItems.length > 0) {
                console.log('✅ Dados reais atualizados encontrados!');
                
                // Buscar contas atualizadas
                let realAccounts: any[] = [];
                for (const item of realItems) {
                  try {
                    const accountsResponse = await fetch(`https://api.pluggy.ai/accounts?itemId=${item.id}`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${savedConnectToken}`,
                      },
                    });
                    
                    if (accountsResponse.ok) {
                      const accountsData = await accountsResponse.json();
                      realAccounts = [...realAccounts, ...(accountsData.results || [])];
                    }
                  } catch (accountError) {
                    console.log('⚠️ Erro ao buscar contas do item:', item.id, accountError);
                  }
                }
                
                // Atualizar cache e interface com dados reais
                await AsyncStorage.setItem('@fynance:pluggy_items', JSON.stringify(realItems));
                await AsyncStorage.setItem('@fynance:pluggy_accounts', JSON.stringify(realAccounts));
                
                setItems(realItems);
                setAccounts(realAccounts);
                
                console.log('✅ Interface atualizada com dados reais!');
              }
            }
          } catch (updateError) {
            console.log('⚠️ Erro ao atualizar dados reais:', updateError);
          }
        }
        
        return;
      }
      
      // Se não há cache, não há dados conectados ainda
      console.log('📭 ConnectBank: Nenhum dado encontrado. Conecte uma conta bancária primeiro.');
      setItems([]);
      setAccounts([]);
      
    } catch (error) {
      console.error('❌ ConnectBank: Erro geral ao carregar dados:', error);
      setItems([]);
      setAccounts([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnectBank = async () => {
    // Proteção contra cliques múltiplos
    if (loading || showPluggy) {
      console.log('⚠️ ConnectBank: Tentativa de conexão já em andamento');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 ConnectBank: Iniciando conexão bancária...');
      const token = await pluggyService.createConnectToken();
      setConnectToken(token);
      setShowPluggy(true);
    } catch (error) {
      console.error('❌ ConnectBank: Erro ao conectar banco:', error);
      Alert.alert(
        'Erro',
        'Não foi possível iniciar a conexão bancária. Verifique se os Open Finance Connectors estão configurados no Dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePluggySuccess = async (itemData: any) => {
    console.log('🎉 Conexão bem-sucedida com Pluggy:', itemData);
    setShowPluggy(false);
    setLoading(true);

    try {
      // Salvar o connectToken para uso futuro
      if (connectToken) {
        setSavedConnectToken(connectToken);
        console.log('💾 ConnectToken salvo para uso futuro');
      }
      
      // PRIMEIRO: Tentar buscar dados reais da sua conta
      console.log('🔄 Tentando buscar dados reais da sua conta...');
      let realItems: any[] = [];
      let realAccounts: any[] = [];
      
      try {
        // Aguardar mais tempo para o Sandbox processar a conexão
        console.log('⏳ Aguardando processamento do Sandbox...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Tentar buscar dados reais usando o connectToken (múltiplas tentativas)
        if (connectToken) {
          console.log('🔍 Tentativa 1: Buscando items reais com connectToken...');
          
          // Primeira tentativa
          let response = await fetch('https://api.pluggy.ai/items', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${connectToken}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            realItems = data.results || [];
            console.log('✅ Items reais encontrados na primeira tentativa:', realItems.length);
          } else {
            // Segunda tentativa após mais tempo
            console.log('⏳ Aguardando mais tempo e tentando novamente...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            response = await fetch('https://api.pluggy.ai/items', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${connectToken}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              realItems = data.results || [];
              console.log('✅ Items reais encontrados na segunda tentativa:', realItems.length);
            }
          }
          
          // Buscar contas para cada item
          for (const item of realItems) {
            try {
              console.log('🔍 Buscando contas para item:', item.id);
              const accountsResponse = await fetch(`https://api.pluggy.ai/accounts?itemId=${item.id}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${connectToken}`,
                },
              });
              
              if (accountsResponse.ok) {
                const accountsData = await accountsResponse.json();
                realAccounts = [...realAccounts, ...(accountsData.results || [])];
                console.log('✅ Contas encontradas para item', item.id, ':', accountsData.results?.length || 0);
              } else {
                console.log('⚠️ Erro ao buscar contas para item', item.id, 'Status:', accountsResponse.status);
              }
            } catch (accountError) {
              console.log('⚠️ Erro ao buscar contas do item:', item.id, accountError);
            }
          }
        }
      } catch (realDataError) {
        console.log('⚠️ Erro ao buscar dados reais:', realDataError);
      }
      
      // Se conseguiu dados reais, usar eles. Senão, usar dados de teste
      if (realItems.length > 0) {
        console.log('✅ Usando dados reais da sua conta!');
        
        // Salvar dados reais no cache
        await AsyncStorage.setItem('@fynance:pluggy_items', JSON.stringify(realItems));
        await AsyncStorage.setItem('@fynance:pluggy_accounts', JSON.stringify(realAccounts));
        
        // Atualizar a interface com dados reais
        setItems(realItems);
        setAccounts(realAccounts);
        
        Alert.alert(
          'Sucesso!',
          `Sua conta bancária foi conectada com sucesso!\n\nEncontradas ${realItems.length} instituição(ões) e ${realAccounts.length} conta(s).`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('🧪 Usando dados de teste (dados reais não disponíveis ainda)');
        
        // Criar dados de teste como fallback
        const testItems = [
          {
            id: 'test-connected-item',
            connector: {
              id: 1,
              name: 'Sua Conta Conectada'
            },
            status: 'UPDATED',
            executionStatus: 'OK',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        const testAccounts = [
          {
            id: 'test-connected-account',
            itemId: 'test-connected-item',
            type: 'BANK',
            subtype: 'CHECKING_ACCOUNT',
            number: '****-****',
            name: 'Conta Conectada (Sincronizando...)',
            balance: 0,
            currencyCode: 'BRL'
          }
        ];
        
        // Salvar dados de teste no cache
        await AsyncStorage.setItem('@fynance:pluggy_items', JSON.stringify(testItems));
        await AsyncStorage.setItem('@fynance:pluggy_accounts', JSON.stringify(testAccounts));
        
        // Atualizar a interface
        setItems(testItems);
        setAccounts(testAccounts);
        
        Alert.alert(
          'Conexão Realizada!',
          'Sua conta foi conectada com sucesso! Os dados reais podem levar alguns minutos para sincronizar. Puxe para baixo para atualizar.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Erro geral na conexão:', error);
      Alert.alert('Erro', 'Erro ao processar a conexão');
    } finally {
      setLoading(false);
      setConnectToken(null);
    }
  };

  const handlePluggyError = (error: any) => {
    console.error('Erro no Pluggy:', error);
    setShowPluggy(false);
    setConnectToken(null);
    
    // Analisa o tipo de erro
    let errorMessage = 'Não foi possível conectar sua conta bancária.';
    
    if (error?.message?.includes('Item was not sync successfully')) {
      errorMessage = 'A conexão foi criada mas falhou na sincronização. Isso pode acontecer se:\n\n• O banco não suporta Open Finance\n• Os conectores não estão configurados no Dashboard\n• Problemas temporários de conectividade\n\nTente novamente ou configure os Open Finance Connectors no Dashboard do Pluggy.';
    } else if (error?.message?.includes('OUTDATED')) {
      errorMessage = 'A conexão expirou ou está desatualizada. Tente reconectar sua conta bancária.';
    } else if (error?.message?.includes('ITEM_IS_ALREADY_UPDATING')) {
      errorMessage = 'Uma conexão já está sendo processada. Aguarde alguns minutos e tente novamente.';
    } else if (error?.message) {
      errorMessage = `Erro: ${error.message}`;
    }
    
    Alert.alert('Erro na Conexão', errorMessage);
  };

  const handlePluggyClose = () => {
    console.log('🔒 Pluggy Connect fechado pelo usuário.');
    setShowPluggy(false);
    setConnectToken(null);
    
    // Aguardar um pouco e tentar carregar dados
    setTimeout(async () => {
      console.log('🔄 Tentando carregar dados após fechamento...');
      await loadData();
    }, 2000);
  };

  const handleDeleteItem = async (itemId: string, bankName: string) => {
    Alert.alert(
      'Desconectar Banco',
      `Deseja realmente desconectar ${bankName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await pluggyService.deleteItem(itemId);
              await loadData();
              Alert.alert('Sucesso', 'Banco desconectado com sucesso.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível desconectar o banco.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      setLoading(true);
      await pluggyService.updateItem(itemId);
      await loadData();
      Alert.alert('Sucesso', 'Dados atualizados com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAccountsByItem = (itemId: string) => {
    return accounts.filter(account => account.itemId === itemId);
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  if (showPluggy && connectToken) {
    return (
      <View style={{ flex: 1 }}>
        {/* Aviso para usar apenas MeuPluggy */}
        <View style={{ backgroundColor: '#ff9800', padding: 16 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            🧪 MODO SANDBOX
          </Text>
          <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Selecione apenas "MeuPluggy" para testes
          </Text>
          <Text style={{ color: '#fff', fontSize: 11, textAlign: 'center', marginTop: 2 }}>
            Usuário: user-ok | Senha: password-ok
          </Text>
        </View>
        <PluggyConnect
          connectToken={connectToken}
          onSuccess={handlePluggySuccess}
          onError={handlePluggyError}
          onClose={handlePluggyClose}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Open Finance
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Conecte suas contas bancárias de forma segura
        </Text>
      </View>

      {/* Resumo Total */}
      {accounts.length > 0 && (
        <Card style={styles.totalCard}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.totalLabel}>
              Saldo Total
            </Text>
            <Text variant="headlineLarge" style={styles.totalValue}>
              {formatCurrency(getTotalBalance())}
            </Text>
            <Text variant="bodySmall" style={styles.accountsCount}>
              {accounts.length} conta(s) conectada(s)
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Botão Conectar Banco */}
      <Button
        mode="contained"
        onPress={handleConnectBank}
        loading={loading}
        disabled={loading}
        style={styles.connectButton}
        icon="bank-plus"
      >
        Conectar Conta Bancária
      </Button>
      
             {/* Botão de atualização */}
             <Button
               mode="outlined"
               onPress={loadData}
               style={[styles.connectButton, { marginTop: 10 }]}
               icon="refresh"
               loading={refreshing}
             >
               🔄 Atualizar Dados
             </Button>

      {/* Lista de Bancos Conectados */}
      {refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : items.length > 0 ? (
        <View style={styles.itemsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Bancos Conectados
          </Text>
          
          {items.map((item) => {
            const itemAccounts = getAccountsByItem(item.id);
            const itemBalance = itemAccounts.reduce((sum, acc) => sum + acc.balance, 0);
            
            return (
              <Card key={item.id} style={styles.itemCard}>
                <Card.Title
                  title={item.connector.name}
                  subtitle={`${itemAccounts.length} conta(s) • ${formatCurrency(itemBalance)}`}
                  left={(props) => <List.Icon {...props} icon="bank" />}
                  right={(props) => (
                    <View style={styles.itemActions}>
                      <IconButton
                        icon="refresh"
                        onPress={() => handleUpdateItem(item.id)}
                        disabled={loading}
                      />
                      <IconButton
                        icon="delete"
                        onPress={() => handleDeleteItem(item.id, item.connector.name)}
                        disabled={loading}
                      />
                    </View>
                  )}
                />
                
                {/* Lista de Contas */}
                {itemAccounts.map((account) => (
                  <List.Item
                    key={account.id}
                    title={account.name}
                    description={`${account.type} • ${account.number}`}
                    right={() => (
                      <Text style={styles.accountBalance}>
                        {formatCurrency(account.balance)}
                      </Text>
                    )}
                    style={styles.accountItem}
                  />
                ))}
              </Card>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Nenhuma conta conectada
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Conecte suas contas bancárias para visualizar saldos e transações automaticamente
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#6200ea',
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  totalCard: {
    margin: 16,
    backgroundColor: '#6200ea',
  },
  totalLabel: {
    color: '#ffffff',
    opacity: 0.8,
  },
  totalValue: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  accountsCount: {
    color: '#ffffff',
    opacity: 0.7,
    marginTop: 4,
  },
  connectButton: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  itemCard: {
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountItem: {
    paddingLeft: 16,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    alignSelf: 'center',
    marginRight: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default ConnectBankScreen;
