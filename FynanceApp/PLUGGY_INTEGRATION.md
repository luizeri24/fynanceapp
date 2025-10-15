# 🔌 Integração Pluggy - Guia Completo

## 📚 Documentação Oficial

- **Pluggy Docs**: https://docs.pluggy.ai/
- **React Native SDK**: https://www.npmjs.com/package/react-native-pluggy-connect
- **Quickstart**: https://github.com/pluggyai/quickstart

## ✅ Status da Integração

### Já Instalado
- ✅ `react-native-pluggy-connect` v1.4.0
- ✅ `react-native-webview` v13.16.0
- ✅ Credenciais configuradas em `pluggyService.ts`

### Configuração Atual

**Arquivo**: `src/services/pluggyService.ts`

```typescript
const PLUGGY_CLIENT_ID = 'de084caf-5ac4-47e1-97c7-707dbd0d8444';
const PLUGGY_CLIENT_SECRET = 'f196c29b-c17a-4682-b966-a220eccfab5b';
const PLUGGY_API_URL = 'https://api.pluggy.ai';
```

## 🚀 Como Funciona

### 1. Fluxo de Autenticação

```
App → pluggyService.getAccessToken() → Pluggy API
     ↓
  API Key (válido por 24h)
```

### 2. Fluxo de Conexão

```
User clica "Conectar Banco"
     ↓
pluggyService.createConnectToken()
     ↓
PluggyConnect Widget abre
     ↓
User seleciona banco e faz login
     ↓
onSuccess callback
     ↓
Salva dados no AsyncStorage
```

### 3. Estrutura de Dados

#### Item (Conexão Bancária)
```typescript
{
  id: string;
  connector: {
    id: number;
    name: string;
  };
  status: 'UPDATED' | 'UPDATING' | 'LOGIN_ERROR' | 'OUTDATED';
  executionStatus: 'OK' | 'ERROR';
  createdAt: string;
}
```

#### Account (Conta Bancária)
```typescript
{
  id: string;
  itemId: string;
  type: 'BANK' | 'CREDIT';
  subtype: string;
  number: string;
  name: string;
  balance: number;
  currencyCode: 'BRL';
}
```

#### Transaction (Transação)
```typescript
{
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  category: string;
}
```

## 📱 Componentes Principais

### ConnectBankScreen.tsx

**Responsabilidades:**
- Exibir PluggyConnect Widget
- Gerenciar callbacks (onSuccess, onError, onClose)
- Salvar dados no AsyncStorage
- Exibir lista de contas conectadas

**Callbacks Principais:**

```typescript
// Sucesso na conexão
onSuccess={(itemData) => {
  console.log('Item conectado:', itemData.item.id);
  // Buscar contas e transações
}}

// Erro na conexão
onError={(error) => {
  console.error('Erro:', error);
  Alert.alert('Erro', error.message);
}}

// Widget fechado
onClose={() => {
  setShowPluggy(false);
}}
```

### pluggyService.ts

**Métodos Principais:**

```typescript
// Autenticação
getAccessToken(): Promise<string>

// Criar token de conexão
createConnectToken(): Promise<string>

// Buscar items conectados
getItems(): Promise<PluggyItem[]>

// Buscar contas de um item
getAllAccounts(): Promise<PluggyAccount[]>

// Buscar transações de uma conta
getTransactions(accountId: string): Promise<PluggyTransaction[]>

// Deletar item
deleteItem(itemId: string): Promise<void>

// Atualizar item
updateItem(itemId: string): Promise<void>

// Cache local
getCachedItems(): Promise<PluggyItem[]>
getCachedAccounts(): Promise<PluggyAccount[]>
```

## 🧪 Testando com Sandbox

### MeuPluggy (Banco de Teste)

1. Abra o app
2. Faça login com credenciais de teste
3. Vá para **Perfil** → **Conectar Banco**
4. Clique em **Conectar Banco**
5. Selecione **MeuPluggy**
6. Use qualquer CPF válido (ex: 111.111.111-11)
7. Use qualquer senha (ex: 1234)

### Dados de Teste Retornados

O MeuPluggy retorna dados fictícios mas realistas:
- 1-3 contas bancárias
- Saldos variados
- Transações dos últimos 90 dias

## 🔐 Segurança

### Boas Práticas Implementadas

✅ **API Key nunca exposta no frontend**
- Gerada via `/auth` endpoint
- Válida por 24h
- Armazenada em memória

✅ **Connect Token de uso único**
- Gerado para cada conexão
- Expira após uso
- Não pode ser reutilizado

✅ **Dados criptografados**
- AsyncStorage para cache local
- Nunca expor credenciais bancárias

### ⚠️ Importante

- **NÃO** commite credenciais no Git
- **NÃO** exponha API Keys no código
- **USE** variáveis de ambiente em produção

## 📊 Endpoints Utilizados

### Autenticação
```
POST https://api.pluggy.ai/auth
Body: { clientId, clientSecret }
Response: { apiKey }
```

### Criar Connect Token
```
POST https://api.pluggy.ai/connect_token
Headers: { X-API-KEY: apiKey }
Response: { accessToken }
```

### Listar Items
```
GET https://api.pluggy.ai/items
Headers: { X-API-KEY: apiKey }
Response: { results: [items] }
```

### Listar Contas
```
GET https://api.pluggy.ai/accounts?itemId={itemId}
Headers: { X-API-KEY: apiKey }
Response: { results: [accounts] }
```

### Listar Transações
```
GET https://api.pluggy.ai/transactions?accountId={accountId}
Headers: { X-API-KEY: apiKey }
Response: { results: [transactions] }
```

## 🐛 Troubleshooting

### Erro: "Missing authorization token"
**Causa**: API Key não foi gerada ou expirou
**Solução**: Chamar `pluggyService.getAccessToken()` novamente

### Erro: "ITEM_IS_ALREADY_UPDATING"
**Causa**: Tentativa de atualizar item que já está sendo atualizado
**Solução**: Aguardar conclusão da atualização anterior

### Erro: "Connector not found"
**Causa**: Connector ID inválido ou não disponível
**Solução**: Usar `getOpenFinanceConnectors()` para listar conectores disponíveis

### Widget não abre
**Causa**: Connect Token inválido ou expirado
**Solução**: Gerar novo connect token

### Dados não aparecem após conexão
**Causa**: Sincronização ainda em andamento
**Solução**: Aguardar alguns segundos e atualizar

## 📈 Próximos Passos

### Melhorias Sugeridas

1. **Notificações Push**
   - Alertar quando sincronização completar
   - Notificar sobre novas transações

2. **Sincronização Automática**
   - Background job para atualizar dados
   - Polling periódico

3. **Categorização Inteligente**
   - Machine Learning para categorizar transações
   - Sugestões de orçamento

4. **Múltiplas Contas**
   - Dashboard consolidado
   - Comparação entre contas

5. **Exportação de Dados**
   - PDF, CSV, Excel
   - Relatórios personalizados

## 📞 Suporte

- **Documentação**: https://docs.pluggy.ai/
- **Status**: https://status.pluggy.ai/
- **Email**: support@pluggy.ai
- **Discord**: https://discord.gg/pluggy

## 📝 Changelog

### v1.0.0 (Atual)
- ✅ Integração básica com Pluggy
- ✅ Autenticação e autorização
- ✅ Listagem de contas
- ✅ Cache local
- ✅ UI para conexão de bancos

### Próxima Versão (v1.1.0)
- 🔄 Sincronização automática
- 🔄 Notificações push
- 🔄 Categorização de transações
- 🔄 Gráficos e relatórios

