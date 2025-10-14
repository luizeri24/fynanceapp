import { User, Account, CreditCard, Transaction, Goal, Achievement } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  avatar: 'https://via.placeholder.com/100'
};

export const mockAccounts: Account[] = [
  {
    id: '1',
    userId: '1',
    name: 'Conta Corrente',
    type: 'checking',
    balance: 5430.50,
    currency: 'BRL',
    bankName: 'Banco do Brasil',
    accountNumber: '12345-6'
  },
  {
    id: '2',
    userId: '1',
    name: 'Poupança',
    type: 'savings',
    balance: 15230.75,
    currency: 'BRL',
    bankName: 'Banco do Brasil',
    accountNumber: '78910-1'
  }
];

export const mockCreditCards: CreditCard[] = [
  {
    id: '1',
    userId: '1',
    name: 'Nubank Mastercard',
    lastFourDigits: '1234',
    brand: 'mastercard',
    limit: 5000.00,
    availableLimit: 3200.00,
    currentBalance: 1800.00,
    dueDate: '2024-09-15',
    minimumPayment: 180.00,
    color: '#8A05BE'
  },
  {
    id: '2',
    userId: '1',
    name: 'Banco do Brasil Visa',
    lastFourDigits: '5678',
    brand: 'visa',
    limit: 3000.00,
    availableLimit: 2500.00,
    currentBalance: 500.00,
    dueDate: '2024-09-20',
    minimumPayment: 50.00,
    color: '#1565C0'
  }
];

export const mockTransactions: Transaction[] = [
  // Agosto 2024
  {
    id: '1',
    accountId: '1',
    amount: -87.50,
    description: 'Supermercado Extra',
    category: 'Alimentação',
    subcategory: 'Supermercado',
    date: '2024-08-18',
    type: 'expense',
    merchant: 'Extra Supermercados',
    location: 'São Paulo, SP'
  },
  {
    id: '2',
    accountId: '1',
    amount: -45.90,
    description: 'Posto Shell',
    category: 'Transporte',
    subcategory: 'Combustível',
    date: '2024-08-17',
    type: 'expense',
    merchant: 'Shell',
    location: 'São Paulo, SP'
  },
  {
    id: '3',
    creditCardId: '1',
    accountId: '1',
    amount: -120.00,
    description: 'Netflix',
    category: 'Entretenimento',
    subcategory: 'Streaming',
    date: '2024-08-16',
    type: 'expense',
    merchant: 'Netflix'
  },
  {
    id: '4',
    accountId: '1',
    amount: 4500.00,
    description: 'Salário',
    category: 'Renda',
    subcategory: 'Salário',
    date: '2024-08-15',
    type: 'income',
    merchant: 'Empresa XYZ'
  },
  {
    id: '5',
    creditCardId: '1',
    accountId: '1',
    amount: -89.90,
    description: 'Restaurante Italiano',
    category: 'Alimentação',
    subcategory: 'Restaurante',
    date: '2024-08-14',
    type: 'expense',
    merchant: 'Cantina da Nonna'
  },
  {
    id: '6',
    creditCardId: '2',
    accountId: '1',
    amount: -156.80,
    description: 'Farmácia São Paulo',
    category: 'Saúde',
    subcategory: 'Medicamentos',
    date: '2024-08-12',
    type: 'expense',
    merchant: 'Drogaria São Paulo'
  },
  {
    id: '7',
    accountId: '1',
    amount: -1200.00,
    description: 'Aluguel',
    category: 'Casa',
    subcategory: 'Aluguel',
    date: '2024-08-05',
    type: 'expense',
    merchant: 'Imobiliária Silva'
  },
  {
    id: '8',
    creditCardId: '1',
    accountId: '1',
    amount: -45.99,
    description: 'Spotify Premium',
    category: 'Entretenimento',
    subcategory: 'Streaming',
    date: '2024-08-03',
    type: 'expense',
    merchant: 'Spotify'
  },
  
  // Julho 2024
  {
    id: '9',
    accountId: '1',
    amount: 4500.00,
    description: 'Salário',
    category: 'Renda',
    subcategory: 'Salário',
    date: '2024-07-15',
    type: 'income',
    merchant: 'Empresa XYZ'
  },
  {
    id: '10',
    accountId: '1',
    amount: -1200.00,
    description: 'Aluguel',
    category: 'Casa',
    subcategory: 'Aluguel',
    date: '2024-07-05',
    type: 'expense',
    merchant: 'Imobiliária Silva'
  },
  {
    id: '11',
    creditCardId: '1',
    accountId: '1',
    amount: -234.56,
    description: 'Supermercado Pão de Açúcar',
    category: 'Alimentação',
    subcategory: 'Supermercado',
    date: '2024-07-20',
    type: 'expense',
    merchant: 'Pão de Açúcar'
  },
  {
    id: '12',
    accountId: '1',
    amount: -89.90,
    description: 'Uber',
    category: 'Transporte',
    subcategory: 'Transporte por app',
    date: '2024-07-18',
    type: 'expense',
    merchant: 'Uber'
  },
  {
    id: '13',
    creditCardId: '2',
    accountId: '1',
    amount: -299.90,
    description: 'Academia Smart Fit',
    category: 'Saúde',
    subcategory: 'Academia',
    date: '2024-07-10',
    type: 'expense',
    merchant: 'Smart Fit'
  },
  
  // Junho 2024
  {
    id: '14',
    accountId: '1',
    amount: 4500.00,
    description: 'Salário',
    category: 'Renda',
    subcategory: 'Salário',
    date: '2024-06-15',
    type: 'income',
    merchant: 'Empresa XYZ'
  },
  {
    id: '15',
    accountId: '1',
    amount: -1200.00,
    description: 'Aluguel',
    category: 'Casa',
    subcategory: 'Aluguel',
    date: '2024-06-05',
    type: 'expense',
    merchant: 'Imobiliária Silva'
  },
  {
    id: '16',
    creditCardId: '1',
    accountId: '1',
    amount: -567.89,
    description: 'Compras Online',
    category: 'Compras',
    subcategory: 'E-commerce',
    date: '2024-06-25',
    type: 'expense',
    merchant: 'Amazon'
  },
  {
    id: '17',
    accountId: '1',
    amount: -178.50,
    description: 'Conta de Luz',
    category: 'Casa',
    subcategory: 'Utilities',
    date: '2024-06-12',
    type: 'expense',
    merchant: 'Enel'
  },
  
  // Maio 2024
  {
    id: '18',
    accountId: '1',
    amount: 4500.00,
    description: 'Salário',
    category: 'Renda',
    subcategory: 'Salário',
    date: '2024-05-15',
    type: 'income',
    merchant: 'Empresa XYZ'
  },
  {
    id: '19',
    creditCardId: '1',
    accountId: '1',
    amount: -890.45,
    description: 'Jantar Romântico',
    category: 'Alimentação',
    subcategory: 'Restaurante',
    date: '2024-05-14',
    type: 'expense',
    merchant: 'Restaurante Fasano'
  },
  {
    id: '20',
    accountId: '1',
    amount: -356.78,
    description: 'Posto Ipiranga',
    category: 'Transporte',
    subcategory: 'Combustível',
    date: '2024-05-10',
    type: 'expense',
    merchant: 'Ipiranga'
  }
];

export const mockGoals: Goal[] = [
  {
    id: '1',
    userId: '1',
    title: 'Viagem para Europa',
    description: 'Economizar para uma viagem de 15 dias pela Europa',
    targetAmount: 12000.00,
    currentAmount: 3500.00,
    targetDate: '2025-06-01',
    category: 'Viagem',
    priority: 'high',
    isActive: true
  },
  {
    id: '2',
    userId: '1',
    title: 'Reserva de Emergência',
    description: 'Formar uma reserva equivalente a 6 meses de gastos',
    targetAmount: 18000.00,
    currentAmount: 8200.00,
    targetDate: '2025-03-01',
    category: 'Emergência',
    priority: 'high',
    isActive: true
  },
  {
    id: '3',
    userId: '1',
    title: 'Notebook Novo',
    description: 'Comprar um MacBook Pro para trabalho',
    targetAmount: 8000.00,
    currentAmount: 2100.00,
    targetDate: '2024-12-01',
    category: 'Eletrônicos',
    priority: 'medium',
    isActive: true
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Primeiro Passo',
    description: 'Realizou sua primeira transação',
    icon: '🎯',
    isUnlocked: true,
    unlockedAt: '2024-01-15',
    criteria: 'Primeira transação registrada'
  },
  {
    id: '2',
    title: 'Economizador',
    description: 'Economizou R$ 1.000 em um mês',
    icon: '💰',
    isUnlocked: true,
    unlockedAt: '2024-02-28',
    criteria: 'Economia mensal >= R$ 1.000'
  },
  {
    id: '3',
    title: 'Planejador',
    description: 'Criou sua primeira meta financeira',
    icon: '📋',
    isUnlocked: true,
    unlockedAt: '2024-01-20',
    criteria: 'Primeira meta criada'
  },
  {
    id: '4',
    title: 'Milionário',
    description: 'Acumulou R$ 100.000 em patrimônio',
    icon: '💎',
    isUnlocked: false,
    criteria: 'Patrimônio total >= R$ 100.000'
  },
  {
    id: '5',
    title: 'Disciplinado',
    description: 'Ficou 3 meses sem estourar o orçamento',
    icon: '🏆',
    isUnlocked: false,
    criteria: '3 meses consecutivos dentro do orçamento'
  }
];
