# FynanceApp

Aplicativo de finanças pessoais com integração Open Finance via Pluggy.

## 🚀 Funcionalidades

- ✅ **Autenticação** - Sistema de login e registro
- ✅ **Dashboard** - Visão geral das finanças
- ✅ **Cartões** - Gerenciamento de cartões de crédito
- ✅ **Metas** - Definição e acompanhamento de metas financeiras
- ✅ **Contas** - Visualização de contas bancárias
- ✅ **Relatórios** - Análises e gráficos financeiros
- ✅ **Open Finance** - Conexão com bancos via Pluggy

## 📱 Tecnologias

- **React Native** 0.81
- **TypeScript**
- **React Navigation** - Navegação entre telas
- **React Native Paper** - Componentes UI
- **Pluggy Connect** - Integração Open Finance
- **AsyncStorage** - Armazenamento local
- **Axios** - Requisições HTTP

## 🔧 Instalação

### Pré-requisitos

- Node.js >= 18
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/luizeri24/fynanceapp.git
cd fynanceapp/FynanceApp
```

2. Instale as dependências:
```bash
npm install
```

3. Para Android:
```bash
npm run android
```

4. Para iOS:
```bash
cd ios && pod install && cd ..
npm run ios
```

## 🔐 Configuração Pluggy

O app já está configurado com as credenciais do Pluggy. Para conectar um banco:

1. Faça login no app (use as credenciais de teste)
2. Vá para **Perfil** → **Conectar Banco**
3. Clique em **Conectar Banco**
4. Selecione o banco desejado
5. Insira suas credenciais bancárias

### Credenciais de Teste

**Login:**
- Email: `test@example.com`
- Senha: `password123`

### Pluggy Sandbox

Para testes, use o **MeuPluggy** (banco sandbox):
- Usuário: qualquer CPF válido
- Senha: qualquer senha

## 📁 Estrutura do Projeto

```
FynanceApp/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── charts/       # Gráficos
│   │   ├── common/       # Componentes comuns
│   │   └── dashboard/    # Componentes do dashboard
│   ├── contexts/         # Contextos React
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── data/             # Dados mockados
│   ├── hooks/            # Custom hooks
│   ├── navigation/       # Configuração de navegação
│   ├── screens/          # Telas do app
│   ├── services/         # Serviços e APIs
│   │   ├── authService.ts
│   │   ├── pluggyService.ts
│   │   └── ...
│   ├── styles/           # Temas e estilos
│   └── types/            # Tipos TypeScript
├── android/              # Código nativo Android
├── ios/                  # Código nativo iOS
└── package.json
```

## 🔑 Serviços

### AuthService
Gerencia autenticação de usuários:
- Login
- Registro
- Logout
- Atualização de perfil

### PluggyService
Integração com Pluggy API:
- Autenticação
- Criação de connect token
- Listagem de items/contas
- Busca de transações
- Cache local

## 🎨 Temas

O app suporta tema claro/escuro configurável em `src/styles/theme.ts`.

## 📝 Scripts Disponíveis

- `npm start` - Inicia o Metro bundler
- `npm run android` - Roda no Android
- `npm run ios` - Roda no iOS
- `npm run lint` - Executa o linter
- `npm test` - Executa os testes

## 🐛 Troubleshooting

### Metro Bundler não inicia
```bash
npm start -- --reset-cache
```

### Erro de build Android
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

### Erro de build iOS
```bash
cd ios && pod install && cd ..
npm run ios
```

## 📚 Recursos

- [Documentação Pluggy](https://docs.pluggy.ai/)
- [Pluggy Quickstart](https://github.com/pluggyai/quickstart)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## 📄 Licença

Este projeto é privado e de uso exclusivo.

## 👥 Autor

Desenvolvido por [luizeri24](https://github.com/luizeri24)

