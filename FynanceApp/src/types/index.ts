export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: string;
  bankName: string;
  accountNumber: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  lastFourDigits: string;
  brand: 'visa' | 'mastercard' | 'american_express' | 'elo';
  limit: number;
  availableLimit: number;
  currentBalance: number;
  dueDate: string;
  minimumPayment: number;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  creditCardId?: string;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  date: string;
  type: 'income' | 'expense';
  merchant?: string;
  location?: string;
  notes?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  criteria: string;
}

// Open Finance Types
export interface OpenFinanceConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  isProduction: boolean;
}


export interface OpenFinanceAccount {
  accountId: string;
  accountType: 'CACC' | 'SVGS' | 'TRAN' | 'LOAN' | 'INVE';
  accountSubType: string;
  currency: string;
  nickname?: string;
  account: {
    schemeName: string;
    identification: string;
    name: string;
    secondaryIdentification?: string;
  };
  servicer: {
    schemeName: string;
    identification: string;
  };
  balances: Array<{
    balanceType: string;
    balanceAmount: {
      amount: string;
      currency: string;
    };
    balanceCreditDebitIndicator: string;
    lastChangeDateTime: string;
    referenceDateTime: string;
  }>;
}

export interface OpenFinanceTransaction {
  transactionId: string;
  transactionReference: string;
  bookingDateTime: string;
  valueDateTime: string;
  transactionAmount: {
    amount: string;
    currency: string;
  };
  transactionInformation: string;
  proprietaryBankTransactionCode: {
    code: string;
    issuer: string;
  };
  balance: {
    balanceAmount: {
      amount: string;
      currency: string;
    };
    balanceCreditDebitIndicator: string;
    balanceType: string;
    lastChangeDateTime: string;
    referenceDateTime: string;
  };
}

export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  Auth: undefined;
  
  // Main Stack
  MainTabs: undefined;
  
  // Tab Stack
  Dashboard: undefined;
  Cards: undefined;
  'Cartões': undefined;
  'Relatórios': undefined;
  Metas: undefined;
  Contas: undefined;
  
  // Modal/Detail Screens
  CardDetails: { cardId: string };
  Achievements: undefined;
  GoalsMain: undefined;
  CreateGoal: undefined;
  AddFunds: undefined;
  AddTransaction: undefined;
  Accounts: undefined;
  
  // Open Finance Screens
  ConnectBank: undefined;
  Backup: undefined;
  Notifications: undefined;
  Profile: undefined;
  SmartAnalysis: undefined;
};
