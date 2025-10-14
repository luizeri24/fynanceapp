import AsyncStorage from '@react-native-async-storage/async-storage';

// Funções auxiliares para base64 simples
const base64Encode = (str: string): string => {
  // Implementação simples de base64 para React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  return result;
};

const base64Decode = (str: string): string => {
  // Implementação simples de base64 decode para React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  str = str.replace(/[^A-Za-z0-9+/]/g, '');
  
  while (i < str.length) {
    const encoded1 = chars.indexOf(str.charAt(i++));
    const encoded2 = chars.indexOf(str.charAt(i++));
    const encoded3 = chars.indexOf(str.charAt(i++));
    const encoded4 = chars.indexOf(str.charAt(i++));
    
    const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
    
    result += String.fromCharCode((bitmap >> 16) & 255);
    if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
    if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
  }
  
  return result;
};
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

class AuthService {
  private readonly STORAGE_KEYS = {
    USER: '@fynance:user',
    TOKEN: '@fynance:token',
    USERS: '@fynance:users'
  };

  // Usuário de teste pré-definido
  private readonly TEST_USER: User = {
    id: '1',
    name: 'João Silva',
    email: 'teste@fynance.com',
    phone: '(11) 99999-9999',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  private readonly TEST_PASSWORD = '123456';

  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Simular delay de rede
      await this.delay(800);

      // Verificar usuário de teste
      if (credentials.email === this.TEST_USER.email && credentials.password === this.TEST_PASSWORD) {
        const token = this.generateToken(this.TEST_USER);
        
        await this.storeAuthData(this.TEST_USER, token);
        
        return {
          success: true,
          user: this.TEST_USER,
          token,
          message: 'Login realizado com sucesso!'
        };
      }

      // Verificar usuários cadastrados
      const storedUsers = await this.getStoredUsers();
      const user = storedUsers.find(u => 
        u.email === credentials.email && u.password === credentials.password
      );

      if (user) {
        const { password, ...userWithoutPassword } = user;
        const token = this.generateToken(userWithoutPassword);
        
        await this.storeAuthData(userWithoutPassword, token);
        
        return {
          success: true,
          user: userWithoutPassword,
          token,
          message: 'Login realizado com sucesso!'
        };
      }

      return {
        success: false,
        message: 'Email ou senha incorretos'
      };

    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro interno. Tente novamente.'
      };
    }
  }

  /**
   * Registra novo usuário
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Simular delay de rede
      await this.delay(1000);

      // Verificar se email já existe
      if (userData.email === this.TEST_USER.email) {
        return {
          success: false,
          message: 'Este email já está em uso'
        };
      }

      const storedUsers = await this.getStoredUsers();
      const existingUser = storedUsers.find(u => u.email === userData.email);

      if (existingUser) {
        return {
          success: false,
          message: 'Este email já está em uso'
        };
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

      // Salvar usuário com senha
      const userWithPassword = { ...newUser, password: userData.password };
      storedUsers.push(userWithPassword);
      await AsyncStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(storedUsers));

      // Gerar token e salvar sessão
      const token = this.generateToken(newUser);
      await this.storeAuthData(newUser, token);

      return {
        success: true,
        user: newUser,
        token,
        message: 'Conta criada com sucesso!'
      };

    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        message: 'Erro interno. Tente novamente.'
      };
    }
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.USER,
        this.STORAGE_KEYS.TOKEN
      ]);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  /**
   * Verifica se existe sessão válida
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER);
      const token = await AsyncStorage.getItem(this.STORAGE_KEYS.TOKEN);

      if (userData && token && this.isValidToken(token)) {
        return JSON.parse(userData);
      }

      return null;
    } catch (error) {
      console.error('Erro ao verificar usuário atual:', error);
      return null;
    }
  }

  /**
   * Atualiza dados do perfil
   */
  async updateProfile(userId: string, userData: Partial<User>): Promise<AuthResponse> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return {
          success: false,
          message: 'Usuário não autorizado'
        };
      }

      const updatedUser = {
        ...currentUser,
        ...userData,
        updatedAt: new Date().toISOString()
      };

      // Atualizar na lista de usuários se não for o usuário de teste
      if (userId !== this.TEST_USER.id) {
        const storedUsers = await this.getStoredUsers();
        const userIndex = storedUsers.findIndex(u => u.id === userId);
        
        if (userIndex >= 0) {
          storedUsers[userIndex] = { ...storedUsers[userIndex], ...userData, updatedAt: updatedUser.updatedAt };
          await AsyncStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(storedUsers));
        }
      }

      // Atualizar sessão atual
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser,
        message: 'Perfil atualizado com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        message: 'Erro interno. Tente novamente.'
      };
    }
  }

  /**
   * Validação de email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validação de senha
   */
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      };
    }

    return { isValid: true };
  }

  // Métodos privados

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      iat: Date.now(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
    };

    const base64Payload = base64Encode(JSON.stringify(payload));
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}`;
  }

  private isValidToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return false;

      const decodedPayload = base64Decode(parts[1]);
      const payload = JSON.parse(decodedPayload);
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }

  private async storeAuthData(user: User, token: string): Promise<void> {
    await AsyncStorage.multiSet([
      [this.STORAGE_KEYS.USER, JSON.stringify(user)],
      [this.STORAGE_KEYS.TOKEN, token]
    ]);
  }

  private async getStoredUsers(): Promise<any[]> {
    try {
      const users = await AsyncStorage.getItem(this.STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  // Getter para credenciais de teste (apenas para desenvolvimento)
  get testCredentials() {
    return {
      email: this.TEST_USER.email,
      password: this.TEST_PASSWORD,
      user: this.TEST_USER
    };
  }
}

export const authService = new AuthService();






