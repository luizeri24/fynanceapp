import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Pluggy - Suas credenciais
const PLUGGY_CLIENT_ID = 'de084caf-5ac4-47e1-97c7-707dbd0d8444';
const PLUGGY_CLIENT_SECRET = 'f196c29b-c17a-4682-b966-a220eccfab5b';
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

interface PluggyTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  category: string;
  providerCode: string;
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
   * Busca todos os items (conexões)
   */
  async getItems(): Promise<PluggyItem[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${PLUGGY_API_URL}/items`, {
        headers: {
          'X-API-KEY': token,
        },
      });
      if (!response.ok) throw new Error('Erro ao buscar items');
      const data = await response.json();
      const items = data.results;
      await AsyncStorage.setItem('pluggy_items', JSON.stringify(items));
      return items;
    } catch (error) {
      console.error('Erro em getItems:', error);
      throw error;
    }
  }

  /**
   * Busca todas as contas de todos os items
   */
  async getAllAccounts(): Promise<PluggyAccount[]> {
    try {
      const items = await this.getItems();
      let allAccounts: PluggyAccount[] = [];

      for (const item of items) {
        const token = await this.getAccessToken();
        const response = await fetch(`${PLUGGY_API_URL}/accounts?itemId=${item.id}`, {
          headers: {
            'X-API-KEY': token,
          },
        });
        if (!response.ok) throw new Error(`Erro ao buscar contas para o item ${item.id}`);
        const data = await response.json();
        allAccounts = [...allAccounts, ...data.results];
      }
      
      await AsyncStorage.setItem('pluggy_accounts', JSON.stringify(allAccounts));
      return allAccounts;
    } catch (error) {
      console.error('Erro em getAllAccounts:', error);
      throw error;
    }
  }

  /**
   * Deleta um item
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      await fetch(`${PLUGGY_API_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'X-API-KEY': token,
        },
      });
      // Limpa o cache após deletar
      await AsyncStorage.removeItem('pluggy_items');
      await AsyncStorage.removeItem('pluggy_accounts');
    } catch (error) {
      console.error('Erro em deleteItem:', error);
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
    const cached = await AsyncStorage.getItem('pluggy_items');
    return cached ? JSON.parse(cached) : [];
  }

  /**
   * Carrega contas do cache
   */
  async getCachedAccounts(): Promise<PluggyAccount[]> {
    const cached = await AsyncStorage.getItem('pluggy_accounts');
    return cached ? JSON.parse(cached) : [];
  }
}

export default new PluggyService();
export type { PluggyItem, PluggyAccount, PluggyTransaction };
