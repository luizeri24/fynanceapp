import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: string;
}

class BiometricService {
  private readonly STORAGE_KEY = '@fynance:biometric_enabled';
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
  }

  /**
   * Verifica se o dispositivo suporta biometria
   */
  async isBiometricSupported(): Promise<BiometricResult> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      return {
        success: available,
        biometryType: biometryType || undefined,
        error: available ? undefined : 'Biometria não disponível neste dispositivo'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao verificar suporte à biometria'
      };
    }
  }

  /**
   * Solicita autenticação biométrica
   */
  async authenticateWithBiometrics(promptMessage: string = 'Confirme sua identidade'): Promise<BiometricResult> {
    try {
      const supportResult = await this.isBiometricSupported();
      if (!supportResult.success) {
        return supportResult;
      }

      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancelar',
      });

      return {
        success,
        error: success ? undefined : 'Autenticação biométrica cancelada ou falhou'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro durante a autenticação biométrica'
      };
    }
  }

  /**
   * Habilita/desabilita autenticação biométrica
   */
  async setBiometricEnabled(enabled: boolean): Promise<boolean> {
    try {
      if (enabled) {
        // Verifica se biometria está disponível antes de habilitar
        const supportResult = await this.isBiometricSupported();
        if (!supportResult.success) {
          return false;
        }

        // Testa autenticação para confirmar que funciona
        const authResult = await this.authenticateWithBiometrics(
          'Confirme para habilitar autenticação biométrica'
        );
        
        if (!authResult.success) {
          return false;
        }
      }

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(enabled));
      return true;
    } catch (error) {
      console.error('Erro ao configurar biometria:', error);
      return false;
    }
  }

  /**
   * Verifica se autenticação biométrica está habilitada
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.STORAGE_KEY);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Erro ao verificar configuração de biometria:', error);
      return false;
    }
  }

  /**
   * Obtém o tipo de biometria disponível de forma legível
   */
  getBiometryTypeLabel(biometryType: string | undefined): string {
    switch (biometryType) {
      case 'TouchID':
        return 'Touch ID';
      case 'FaceID':
        return 'Face ID';
      case 'Biometrics':
        return 'Impressão Digital';
      default:
        return 'Biometria';
    }
  }

  /**
   * Simula autenticação biométrica para teste (fallback)
   */
  async simulateBiometricAuth(): Promise<BiometricResult> {
    // Simulação para desenvolvimento/teste
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simula 80% de sucesso
        const success = Math.random() > 0.2;
        resolve({
          success,
          error: success ? undefined : 'Falha na simulação de biometria'
        });
      }, 1500);
    });
  }

  /**
   * Autenticação biométrica com fallback para simulação
   */
  async authenticateWithFallback(promptMessage?: string): Promise<BiometricResult> {
    try {
      const supportResult = await this.isBiometricSupported();
      
      if (supportResult.success) {
        return await this.authenticateWithBiometrics(promptMessage);
      } else {
        // Em dispositivos sem biometria, usa simulação
        console.log('Usando simulação de biometria para desenvolvimento');
        return await this.simulateBiometricAuth();
      }
    } catch (error) {
      console.log('Erro na autenticação, usando simulação:', error);
      return await this.simulateBiometricAuth();
    }
  }
}

export const biometricService = new BiometricService();






