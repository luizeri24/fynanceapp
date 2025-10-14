import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Usuário de teste
const TEST_USER: User = {
  id: '1',
  name: 'João Silva',
  email: 'teste@fynance.com',
  phone: '(11) 99999-9999',
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Senha do usuário de teste
const TEST_PASSWORD = '123456';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  // Debug: Force logout for testing
  const forceLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['@fynance:user', '@fynance:token']);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout forçado:', error);
    }
  };

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      
      // TEMPORARY: Clear all auth data for debugging
      // Comment this out in production
      // await AsyncStorage.multiRemove(['@fynance:user', '@fynance:token']);
      // console.log('🔑 Auth data cleared for testing login screen');
      
      const storedUser = await AsyncStorage.getItem('@fynance:user');
      const storedToken = await AsyncStorage.getItem('@fynance:token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar credenciais do usuário de teste
      if (email === TEST_USER.email && password === TEST_PASSWORD) {
        // Simular token JWT
        const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ userId: TEST_USER.id, email: TEST_USER.email }))}`;
        
        // Salvar no AsyncStorage
        await AsyncStorage.setItem('@fynance:user', JSON.stringify(TEST_USER));
        await AsyncStorage.setItem('@fynance:token', token);
        
        setUser(TEST_USER);
        setIsAuthenticated(true);
        return true;
      }
      
      // Verificar outros usuários cadastrados
      const storedUsers = await AsyncStorage.getItem('@fynance:users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const foundUser = users.find((u: any) => u.email === email && u.password === password);
        
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ userId: userWithoutPassword.id, email: userWithoutPassword.email }))}`;
          
          await AsyncStorage.setItem('@fynance:user', JSON.stringify(userWithoutPassword));
          await AsyncStorage.setItem('@fynance:token', token);
          
          setUser(userWithoutPassword);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se email já existe
      const storedUsers = await AsyncStorage.getItem('@fynance:users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      if (users.find((u: any) => u.email === userData.email) || userData.email === TEST_USER.email) {
        return false; // Email já existe
      }
      
      // Criar novo usuário
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Salvar usuário na lista
      const userWithPassword = { ...newUser, password: userData.password };
      users.push(userWithPassword);
      await AsyncStorage.setItem('@fynance:users', JSON.stringify(users));
      
      // Fazer login automático
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ userId: newUser.id, email: newUser.email }))}`;
      await AsyncStorage.setItem('@fynance:user', JSON.stringify(newUser));
      await AsyncStorage.setItem('@fynance:token', token);
      
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Remover dados do AsyncStorage
      await AsyncStorage.removeItem('@fynance:user');
      await AsyncStorage.removeItem('@fynance:token');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!user) return;
      
      const updatedUser = {
        ...user,
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('@fynance:user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Dados do usuário de teste para referência
export const TEST_USER_CREDENTIALS = {
  email: 'teste@fynance.com',
  password: '123456',
  user: TEST_USER
};
