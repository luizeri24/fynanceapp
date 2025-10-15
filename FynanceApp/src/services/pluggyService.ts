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
      return this.accessToken;
    }

    try {
      console.log('🔑 Pluggy: Obtendo access token...');
      console.log('🔑 Client ID:', PLUGGY_CLIENT_ID);
      
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
        throw new Error(data.message || `Erro ao autenticar com Pluggy: ${response.status}`);
      }

      this.accessToken = data.apiKey;
      // Token expira em 24 horas (86400000 ms)
      this.tokenExpiry = Date.now() + 86400000;

      if (!this.accessToken) {
        throw new Error('API Key não recebida do Pluggy');
      }

      return this.accessToken;
    } catch (error) {
      console.error('Erro ao obter token Pluggy:', error);
      throw error;
    }
  }

  /**
   * Busca conectores disponíveis (apenas Sandbox)
   */
  async getConnectors(): Promise<any[]> {
    try {
      console.log('🔍 Pluggy: Buscando conectores Sandbox...');
      const token = await this.getAccessToken();
      
      // Buscar apenas conectores Sandbox usando filtro
      const response = await fetch(`${PLUGGY_API_URL}/connectors?sandbox=true`, {
        method: 'GET',
        headers: {
          'X-API-KEY': token,
        },
      });

      console.log('🔍 Response status:', response.status);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Erro ao buscar conectores: ${response.status}`);
      }

      const connectors = data.results || [];
      console.log('🔍 Conectores Sandbox encontrados:', connectors.length);
      
      // Filtrar apenas o MeuPluggy (ID 200) para garantir
      const sandboxConnectors = connectors.filter((c: any) => c.id === 200);
      console.log('🧪 Conectores filtrados (apenas MeuPluggy):', sandboxConnectors.length);
      
      return sandboxConnectors;
    } catch (error) {
      console.error('Erro ao buscar conectores:', error);
      return [];
    }
  }

  /**
   * Cria um Connect Token para iniciar o fluxo de conexão
   */
  async createConnectToken(itemId?: string): Promise<string> {
    try {
      console.log('🔗 Pluggy: Criando connect token...');
      const token = await this.getAccessToken();
      console.log('🔗 Access token obtido:', token ? '✅' : '❌');
      
      const body: any = {
        parameters: {
          products: ['ACCOUNTS', 'TRANSACTIONS', 'CREDIT_CARDS', 'INVESTMENTS']
        }
      };
      
      // FORÇAR uso do Sandbox connector apenas para testes
      console.log('🧪 MODO SANDBOX: Forçando uso do Sandbox connector (ID 200)');
      body.parameters.connectorIds = [200]; // ID 200 = MeuPluggy (Sandbox)
      
      console.log('🔗 Conectores que serão usados:', body.parameters.connectorIds);
      
      if (itemId) {
        body.itemId = itemId;
      }

      console.log('🔗 Enviando requisição para connect_token...');
      console.log('🔗 Body:', JSON.stringify(body, null, 2));
      const response = await fetch(`${PLUGGY_API_URL}/connect_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': token,
        },
        body: JSON.stringify(body),
      });

      console.log('🔗 Response status:', response.status);
      const data = await response.json();
      console.log('🔗 Response data:', data);
      
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
   * Busca todos os items (conexões) usando Connect Token
   */
  async getItems(connectToken?: string): Promise<PluggyItem[]> {
    try {
      console.log('📦 Pluggy: Buscando items...');
      
      // Se não tiver connectToken, tentar buscar do cache
      if (!connectToken) {
        console.log('📦 Nenhum connect token fornecido, buscando do cache...');
        const cachedItems = await this.getCachedItems();
        if (cachedItems.length > 0) {
          console.log('📦 Items encontrados no cache:', cachedItems.length);
          return cachedItems;
        }
        console.log('📦 Nenhum item no cache, retornando array vazio');
        return [];
      }
      
      const response = await fetch(`${PLUGGY_API_URL}/items`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connectToken}`,
        },
      });

      console.log('📦 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        throw new Error(data.message || `Erro ao buscar items: ${response.status}`);
      }
      
      const items = data.results || [];
      console.log('📦 Items encontrados:', items.length);
      
      // Salvar no cache
      await AsyncStorage.setItem('@fynance:pluggy_items', JSON.stringify(items));
      return items;
    } catch (error: any) {
      console.error('❌ Erro em getItems:', error.message || error);
      throw error;
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
        },
      });

      console.log(`💰 Response status (item ${itemId}):`, response.status);
      const data = await response.json();
      console.log(`💰 Response data (item ${itemId}):`, JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        throw new Error(data.message || `Erro ao buscar contas para item ${itemId}: ${response.status}`);
      }
      
      const accounts = data.results || [];
      console.log(`💰 Contas encontradas para item ${itemId}:`, accounts.length);
      
      // Salvar no cache
      await AsyncStorage.setItem('@fynance:pluggy_accounts', JSON.stringify(accounts));
      return accounts;
    } catch (error: any) {
      console.error(`❌ Erro ao buscar contas para item ${itemId}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Busca transações de uma conta específica usando API Key
   */
  async getTransactionsByAccountId(accountId: string): Promise<PluggyTransaction[]> {
    try {
      console.log(`💸 Pluggy: Buscando transações para conta ${accountId}...`);
      const token = await this.getAccessToken();
      
      const response = await fetch(`${PLUGGY_API_URL}/transactions?accountId=${accountId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': token,
        },
      });

      console.log(`💸 Response status (conta ${accountId}):`, response.status);
      const data = await response.json();
      console.log(`💸 Response data (conta ${accountId}):`, JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        throw new Error(data.message || `Erro ao buscar transações para conta ${accountId}: ${response.status}`);
      }
      
      const transactions = data.results || [];
      console.log(`💸 Transações encontradas para conta ${accountId}:`, transactions.length);
      
      return transactions;
    } catch (error: any) {
      console.error(`❌ Erro ao buscar transações para conta ${accountId}:`, error.message || error);
      return []; // Retorna array vazio em caso de erro
    }
  }

  /**
   * Busca todas as transações de todas as contas
   */
  async getAllTransactions(accountIds: string[]): Promise<PluggyTransaction[]> {
    try {
      console.log(`💸 Pluggy: Buscando transações para ${accountIds.length} contas...`);
      
      let allTransactions: PluggyTransaction[] = [];
      
      for (const accountId of accountIds) {
        const transactions = await this.getTransactionsByAccountId(accountId);
        allTransactions = [...allTransactions, ...transactions];
      }
      
      console.log(`💸 Total de transações encontradas:`, allTransactions.length);
      
      // Salvar no cache
      await AsyncStorage.setItem('@fynance:pluggy_transactions', JSON.stringify(allTransactions));
      return allTransactions;
    } catch (error: any) {
      console.error('❌ Erro ao buscar todas as transações:', error.message || error);
      return [];
    }
  }

  /**
   * Busca transações do cache
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
   * Busca todas as contas de todos os items usando Connect Token
   */
  async getAllAccounts(connectToken?: string): Promise<PluggyAccount[]> {
    try {
      console.log('💰 Pluggy: Buscando contas...');
      
      // Se não tiver connectToken, tentar buscar do cache
      if (!connectToken) {
        console.log('💰 Nenhum connect token fornecido, buscando do cache...');
        const cachedAccounts = await this.getCachedAccounts();
        if (cachedAccounts.length > 0) {
          console.log('💰 Contas encontradas no cache:', cachedAccounts.length);
          return cachedAccounts;
        }
        console.log('💰 Nenhuma conta no cache, retornando array vazio');
        return [];
      }
      
      const items = await this.getItems(connectToken);
      
      if (items.length === 0) {
        console.log('💰 Nenhum item encontrado para buscar contas');
        return [];
      }

      let allAccounts: PluggyAccount[] = [];

      for (const item of items) {
        console.log(`💰 Buscando contas para item: ${item.id} (${item.connector.name})`);
        
        const response = await fetch(`${PLUGGY_API_URL}/accounts?itemId=${item.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${connectToken}`,
          },
        });

        console.log(`💰 Response status (item ${item.id}):`, response.status);
        const data = await response.json();
        
        if (!response.ok) {
          console.error(`❌ Erro ao buscar contas para item ${item.id}:`, data);
          continue; // Continua para o próximo item
        }
        
        const accounts = data.results || [];
        console.log(`💰 Contas encontradas para ${item.connector.name}:`, accounts.length);
        allAccounts = [...allAccounts, ...accounts];
      }
      
      console.log('💰 Total de contas encontradas:', allAccounts.length);
      
      // Salvar no cache
      await AsyncStorage.setItem('@fynance:pluggy_accounts', JSON.stringify(allAccounts));
      return allAccounts;
    } catch (error: any) {
      console.error('❌ Erro em getAllAccounts:', error.message || error);
      throw error;
    }
  }

  /**
   * Deleta um item
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      console.log(`🗑️ Pluggy: Deletando item ${itemId}...`);
      const token = await this.getAccessToken();
      
      const response = await fetch(`${PLUGGY_API_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'X-API-KEY': token,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao deletar item');
      }
      
      console.log(`✅ Item ${itemId} deletado com sucesso`);
      
      // Limpa o cache após deletar
      await AsyncStorage.removeItem('@fynance:pluggy_items');
      await AsyncStorage.removeItem('@fynance:pluggy_accounts');
    } catch (error: any) {
      console.error('❌ Erro em deleteItem:', error.message || error);
      throw error;
    }
  }

  /**
   * Atualiza um item (força a sincronização)
   */
  async updateItem(itemId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      await fetch(`${PLUGGY_API_URL}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'X-API-KEY': token,
        },
      });
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
   */
  async getCachedAccounts(): Promise<PluggyAccount[]> {
    const cached = await AsyncStorage.getItem('@fynance:pluggy_accounts');
    const accounts = cached ? JSON.parse(cached) : [];
    
    // Log detalhado dos dados
    console.log('🔍 Cache de contas carregado:', accounts.length);
    accounts.forEach((account: PluggyAccount, index: number) => {
      console.log(`🔍 Conta ${index + 1}:`, {
        id: account.id,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        balance: account.balance,
        number: account.number
      });
    });
    
    return accounts;
  }
}

export default new PluggyService();
export type { PluggyItem, PluggyAccount };
