import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  useTheme,
  ProgressBar,
  Snackbar,
  List,
  Divider
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useNotifications } from '../hooks/useNotifications';

type AddFundsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const AddFundsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AddFundsScreenNavigationProp>();
  const route = useRoute();
  const { notifyGoalProgress } = useNotifications();
  
  // Mock goal data - in real app would come from route params or context
  const goal = {
    id: '1',
    title: 'Viagem dos Sonhos',
    targetAmount: 8000,
    currentAmount: 2500,
    category: 'Lazer',
    description: 'Viagem para Europa'
  };

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const quickAmounts = [50, 100, 200, 500, 1000];

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAmountChange = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    setAmount(numbers);
  };

  const setQuickAmount = (value: number) => {
    setAmount((value * 100).toString());
  };

  const getFormattedAmount = () => {
    const number = parseFloat(amount) || 0;
    return formatCurrency(number / 100);
  };

  const handleAddFunds = async () => {
    const amountNumber = parseFloat(amount) / 100;

    if (!amountNumber || amountNumber <= 0) {
      showMessage('Valor deve ser maior que zero');
      return;
    }

    if (goal.currentAmount + amountNumber > goal.targetAmount) {
      showMessage('Valor excede a meta. Considere criar uma nova meta!');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newAmount = goal.currentAmount + amountNumber;
      const percentage = (newAmount / goal.targetAmount * 100).toFixed(1);

      console.log('Fundos adicionados:', {
        goalId: goal.id,
        amount: amountNumber,
        newTotal: newAmount,
        description
      });

      // Notify progress
      notifyGoalProgress(goal, amountNumber);

      showMessage(`Parabéns! Você está ${percentage}% da meta!`);
      
      // Navigate back after success
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      showMessage('Erro ao adicionar fundos');
    } finally {
      setLoading(false);
    }
  };

  const currentProgress = goal.currentAmount / goal.targetAmount;
  const newProgress = Math.min((goal.currentAmount + (parseFloat(amount) / 100 || 0)) / goal.targetAmount, 1);
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <ScrollView style={styles.container}>
      {/* Goal Info */}
      <Card style={styles.goalCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.goalTitle}>
            🎯 {goal.title}
          </Text>
          <Text variant="bodyMedium" style={[styles.goalDescription, { color: theme.colors.outline }]}>
            {goal.description}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text variant="bodyLarge" style={styles.progressCurrent}>
                {formatCurrency(goal.currentAmount)}
              </Text>
              <Text variant="bodyLarge" style={styles.progressTarget}>
                {formatCurrency(goal.targetAmount)}
              </Text>
            </View>
            
            <ProgressBar 
              progress={currentProgress} 
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            
            <Text variant="bodySmall" style={[styles.progressPercent, { color: theme.colors.outline }]}>
              {(currentProgress * 100).toFixed(1)}% conquistado
            </Text>
          </View>

          <View style={styles.remainingSection}>
            <Text variant="titleMedium" style={[styles.remainingText, { color: theme.colors.primary }]}>
              Faltam {formatCurrency(remaining)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Add Funds Form */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            💰 Adicionar Fundos
          </Text>

          <TextInput
            label="Valor a adicionar"
            value={getFormattedAmount()}
            onChangeText={handleAmountChange}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="R$ 0,00"
            left={<TextInput.Icon icon="currency-usd" />}
          />

          {/* Quick Amount Buttons */}
          <Text variant="bodyMedium" style={styles.quickAmountLabel}>
            Valores rápidos:
          </Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map(value => (
              <Button
                key={value}
                mode="outlined"
                onPress={() => setQuickAmount(value)}
                style={styles.quickAmountButton}
                compact
              >
                {formatCurrency(value)}
              </Button>
            ))}
          </View>

          <TextInput
            label="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Mesada do mês, bônus..."
            left={<TextInput.Icon icon="text" />}
          />

          {/* Preview */}
          {parseFloat(amount) > 0 && (
            <Card style={styles.previewCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.previewTitle}>
                  📊 Prévia do Progresso
                </Text>
                
                <View style={styles.previewProgress}>
                  <View style={styles.progressHeader}>
                    <Text variant="bodyMedium" style={styles.previewCurrent}>
                      {formatCurrency(goal.currentAmount + (parseFloat(amount) / 100))}
                    </Text>
                    <Text variant="bodyMedium" style={styles.previewTarget}>
                      {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>
                  
                  <ProgressBar 
                    progress={newProgress} 
                    color={theme.colors.secondary}
                    style={styles.progressBar}
                  />
                  
                  <Text variant="bodySmall" style={[styles.previewPercent, { color: theme.colors.secondary }]}>
                    {(newProgress * 100).toFixed(1)}% da meta
                  </Text>
                </View>

                {newProgress >= 1 && (
                  <View style={styles.completedBanner}>
                    <Text variant="titleMedium" style={styles.completedText}>
                      🎉 Meta Completa!
                    </Text>
                    <Text variant="bodyMedium" style={styles.completedSubtext}>
                      Parabéns! Você alcançou seu objetivo!
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}
        </Card.Content>
      </Card>

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            💡 Dicas para Poupar
          </Text>
          
          <List.Item
            title="Automatize sua poupança"
            description="Configure transferências automáticas para sua meta"
            left={() => <Text style={styles.tipIcon}>🔄</Text>}
          />
          
          <Divider />
          
          <List.Item
            title="Comemore pequenas vitórias"
            description="A cada 25% da meta, se dê uma recompensa pequena"
            left={() => <Text style={styles.tipIcon}>🎉</Text>}
          />
          
          <Divider />
          
          <List.Item
            title="Monitore seu progresso"
            description="Acompanhe semanalmente para manter a motivação"
            left={() => <Text style={styles.tipIcon}>📈</Text>}
          />
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          mode="contained"
          onPress={handleAddFunds}
          style={styles.addButton}
          loading={loading}
          disabled={loading || !parseFloat(amount)}
        >
          Adicionar Fundos
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={[styles.snackbar, { backgroundColor: theme.colors.surface }]}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  goalCard: {
    margin: 16,
    marginBottom: 8,
  },
  goalTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalDescription: {
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressCurrent: {
    fontWeight: 'bold',
  },
  progressTarget: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  progressPercent: {
    textAlign: 'center',
  },
  remainingSection: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  remainingText: {
    fontWeight: 'bold',
  },
  formCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  quickAmountLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickAmountButton: {
    minWidth: 80,
  },
  previewCard: {
    backgroundColor: '#f0f7ff',
    marginTop: 8,
  },
  previewTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  previewProgress: {
    marginBottom: 8,
  },
  previewCurrent: {
    fontWeight: 'bold',
  },
  previewTarget: {
    fontWeight: 'bold',
  },
  previewPercent: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  completedBanner: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    marginTop: 12,
  },
  completedText: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  completedSubtext: {
    color: '#2e7d32',
    textAlign: 'center',
  },
  tipsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#fff8e1',
  },
  tipIcon: {
    fontSize: 20,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 2,
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default AddFundsScreen;






