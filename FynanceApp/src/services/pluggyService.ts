import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Pluggy - Suas credenciais
const PLUGGY_CLIENT_ID = '5c960db6-43e2-462c-8b24-bc970a2f2da5';
const PLUGGY_CLIENT_SECRET = 'f148bcb5-27c2-4962-a3b7-518462705b72';
const PLUGGY_API_URL = 'https://api.pluggy.ai';

interface PluggyItem {
  id: string;
  connector: {
    id: number;
    name: string;
  };
  createdAt: string;
  status: string;
  executionStatus: string;
}

interface PluggyAccount {
  id: string;
  itemId: string;
  type: string;
  subtype: string;
  number: string;
  name: string;
  balance: number;
  currencyCode: string;
}

export interface PluggyTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  category: string;
  type: string;
}

class PluggyService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Obtém token de acesso do Pluggy
   */
  async getAccessToken(): Promise<string> {
    // Verifica se o token ainda é válido
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('🔑 Usando token em cache (válido)');
      return this.accessToken;
    }

    try {
      console.log('🔑 Pluggy: Obtendo novo access token...');
      console.log('🔑 Client ID:', PLUGGY_CLIENT_ID);
      console.log('🔑 API URL:', PLUGGY_API_URL);
      
      const response = await fetch(`${PLUGGY_API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: PLUGGY_CLIENT_ID,
          clientSecret: PLUGGY_CLIENT_SECRET,
        }),
      });

      console.log('🔑 Response status:', response.status);
      const data = await response.json();
      console.log('🔑 Response data:', data);
      
      if (!response.ok) {
        console.error('🔑 Erro na autenticação:', data);
        throw new Error(data.message || `Erro ao autenticar com Pluggy: ${response.status}`);
      }

      this.accessToken = data.apiKey;
      // Token expira em 24 horas (86400000 ms)
      this.tokenExpiry = Date.now() + 86400000;

      if (!this.accessToken) {
        throw new Error('API Key não recebida do Pluggy');
      }

      console.log('🔑 Token obtido com sucesso:', this.accessToken.substring(0, 10) + '...');
      return this.accessToken;
    } catch (error) {
      console.error('🔑 Erro ao obter token Pluggy:', error);
      throw error;
    }
  }

  /**
   * Cria um Connect Token para iniciar o fluxo de conexão
   */
  async createConnectToken(itemId?: string): Promise<string> {
    try {
      console.log('🔗 Pluggy: Criando connect token...');
      const token = await this.getAccessToken();
      
      const body: any = {};
      if (itemId) {
        body.itemId = itemId;
      }

      const response = await fetch(`${PLUGGY_API_URL}/connect_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': token,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Erro ao criar connect token: ${response.status}`);
      }

      return data.accessToken;
    } catch (error) {
      console.error('Erro ao criar connect token:', error);
      throw error;
    }
  }

  /**
   * Busca todos os items (conexões) da API usando a API Key.
   */
  async getItems(): Promise<PluggyItem[]> {
    try {
      console.log('📦 Pluggy: Buscando items da API...');
      const token = await this.getAccessToken();
      console.log('📦 Token para getItems:', token ? token.substring(0, 10) + '...' : 'null');
      
      const response = await fetch(`${PLUGGY_API_URL}/items`, {
        method: 'GET',
        headers: {
          'X-API-KEY': token,
          'Content-Type': 'application/json',
        },
      });

      console.log('📦 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        console.error('📦 Erro na resposta:', data);
        throw new Error(data.message || `Erro ao buscar items: ${response.status}`);
      }
      
      const items = data.results || [];
      console.log('📦 Items encontrados na API:', items.length);
      
      // Salvar no cache
      await AsyncStorage.setItem('@fynance:pluggy_items', JSON.stringify(items));
      return items;
    } catch (error: any) {
      console.error('❌ Erro em getItems:', error.message || error);
      console.log('📦 Erro ao buscar da API, retornando cache...');
      return this.getCachedItems();
    }
  }

  /**
   * Busca contas de um item específico usando API Key
   */
  async getAccountsByItemId(itemId: string): Promise<PluggyAccount[]> {
    try {
      console.log(`💰 Pluggy: Buscando contas para item ${itemId}...`);
      const token = await this.getAccessToken();
      
      const response = await fetch(`${PLUGGY_API_URL}/accounts?itemId=${itemId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': token,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Erro ao buscar contas para item ${itemId}: ${response.status}`);
      }
      
      const accounts = data.results || [];
      return accounts;
    } catch (error: any) {
      console.error(`❌ Erro ao buscar contas para item ${itemId}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Busca todas as contas de todos os items.
   */
  async getAllAccounts(): Promise<PluggyAccount[]> {
    try {
      console.log('💰 Pluggy: Buscando todas as contas da API...');
      const items = await this.getItems(); // Chama a função corrigida que busca da API
      
      if (items.length === 0) {
        console.log('💰 Nenhum item encontrado para buscar contas');
        await AsyncStorage.setItem('@fynance:pluggy_accounts', JSON.stringify([]));
        return [];
      }

      let allAccounts: PluggyAccount[] = [];

      for (const item of items) {
        const accounts = await this.getAccountsByItemId(item.id);
        allAccounts = [...allAccounts, ...accounts];
      }
      
      console.log('💰 Total de contas encontradas na API:', allAccounts.length);
      
      // Salvar no cache
      await AsyncStorage.setItem('@fynance:pluggy_accounts', JSON.stringify(allAccounts));
      return allAccounts;
    } catch (error: any) {
      console.error('❌ Erro em getAllAccounts:', error.message || error);
      console.log('💰 Erro ao buscar da API, retornando cache...');
      return this.getCachedAccounts();
    }
  }

  /**
   * Deleta um item
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      console.log(`🗑️ Pluggy: Deletando item ${itemId}...`);
      const token = await this.getAccessToken();
      
      await fetch(`${PLUGGY_API_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'X-API-KEY': token,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`✅ Item ${itemId} deletado com sucesso`);
      
      // Limpa o cache após deletar
      await this.getAllAccounts(); // Re-fetch all accounts from remaining items and update cache
      await this.getCachedItems(); // Re-fetch items and update cache
    } catch (error: any) {
      console.error('❌ Erro em deleteItem:', error.message || error);
      throw error;
    }
  }

  /**
   * Força a atualização de um item no Pluggy.
   */
  async updateItem(itemId: string): Promise<void> {
    try {
      console.log(`🔄 Pluggy: Solicitando atualização para o item ${itemId}...`);
      const token = await this.getAccessToken();
      await fetch(`${PLUGGY_API_URL}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'X-API-KEY': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parameters: {} }),
      });
      console.log(`✅ Solicitação de atualização enviada para o item ${itemId}`);
    } catch (error) {
      console.error('Erro em updateItem:', error);
      throw error;
    }
  }

  /**
   * Carrega items do cache
   */
  async getCachedItems(): Promise<PluggyItem[]> {
    const cached = await AsyncStorage.getItem('@fynance:pluggy_items');
    return cached ? JSON.parse(cached) : [];
  }

  /**
   * Carrega contas do cache
   Garante que o itemID está presente em cada conta.
   */
  async getCachedAccounts(): Promise<PluggyAccount[]> {
    const cached = await AsyncStorage.getItem('@fynance:pluggy_accounts');
    return cached ? JSON.parse(cached) : [];
  }

  /**
   * Busca transações de contas específicas
   */
  async getTransactionsByAccountIds(accountIds: string[]): Promise<PluggyTransaction[]> {
    try {
      console.log('💳 Pluggy: Buscando transações para contas:', accountIds);
      const token = await this.getAccessToken();
      
      let allTransactions: PluggyTransaction[] = [];

      for (const accountId of accountIds) {
        try {
          console.log(`💳 Buscando transações para conta: ${accountId}`);
          const response = await fetch(`${PLUGGY_API_URL}/transactions?accountId=${accountId}`, {
            method: 'GET',
            headers: {
              'X-API-KEY': token,
              'Content-Type': 'application/json',
            },
          });

          console.log(`💳 Response status para conta ${accountId}:`, response.status);
          const data = await response.json();
          console.log(`💳 Response data para conta ${accountId}:`, data);
          
          if (response.ok && data.results) {
            console.log(`💳 Transações encontradas para conta ${accountId}:`, data.results.length);
            allTransactions = [...allTransactions, ...data.results];
          } else {
            console.warn(`💳 Nenhuma transação encontrada para conta ${accountId}. Status: ${response.status}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar transações da conta ${accountId}:`, error);
        }
      }
      
      console.log('💳 Total de transações encontradas:', allTransactions.length);
      
      // Salvar no cache
      await AsyncStorage.setItem('@fynance:pluggy_transactions', JSON.stringify(allTransactions));
      return allTransactions;
    } catch (error: any) {
      console.error('❌ Erro em getTransactionsByAccountIds:', error.message || error);
      console.log('💳 Erro ao buscar da API, retornando cache...');
      return this.getCachedTransactions();
    }
  }

  /**
   * Busca todas as transações de todas as contas
   */
  async getAllTransactions(accountIds: string[]): Promise<PluggyTransaction[]> {
    if (accountIds.length === 0) {
      return [];
    }
    return this.getTransactionsByAccountIds(accountIds);
  }

  /**
   * Carrega transações do cache
   */
  async getCachedTransactions(): Promise<PluggyTransaction[]> {
    try {
      const cached = await AsyncStorage.getItem('@fynance:pluggy_transactions');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('❌ Erro ao buscar transações do cache:', error);
      return [];
    }
  }

  /**
   * Limpa o token de acesso e força nova autenticação
   */
  clearAccessToken(): void {
    console.log('🔑 Limpando token de acesso...');
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Força nova autenticação
   */
  async forceReauth(): Promise<string> {
    console.log('🔑 Forçando nova autenticação...');
    this.clearAccessToken();
    return await this.getAccessToken();
  }

  /**
   * Testa a conectividade com a API do Pluggy
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testando conectividade com Pluggy...');
      const token = await this.getAccessToken();
      
      // Teste simples - buscar items
      const response = await fetch(`${PLUGGY_API_URL}/items`, {
        method: 'GET',
        headers: {
          'X-API-KEY': token,
          'Content-Type': 'application/json',
        },
      });

      console.log('🧪 Status da conexão:', response.status);
      
      if (response.status === 200) {
        console.log('✅ Conectividade OK');
        return true;
      } else {
        const data = await response.json();
        console.error('❌ Erro de conectividade:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no teste de conectividade:', error);
      return false;
    }
  }
}

export default new PluggyService();
export type { PluggyItem, PluggyAccount };