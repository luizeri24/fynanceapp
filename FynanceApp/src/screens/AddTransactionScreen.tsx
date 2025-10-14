import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  useTheme,
  SegmentedButtons,
  Menu,
  Divider,
  Chip
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { mockAccounts, mockCreditCards } from '../data/mockData';

type AddTransactionScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface TransactionForm {
  type: 'income' | 'expense';
  amount: string;
  description: string;
  category: string;
  subcategory: string;
  accountId: string;
  creditCardId?: string;
  date: string;
  merchant: string;
  notes: string;
}

const AddTransactionScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  
  const [formData, setFormData] = useState<TransactionForm>({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    subcategory: '',
    accountId: mockAccounts[0]?.id || '',
    creditCardId: '',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [cardMenuVisible, setCardMenuVisible] = useState(false);

  // Categorias disponíveis
  const categories = {
    expense: [
      'Alimentação',
      'Transporte',
      'Casa',
      'Saúde',
      'Entretenimento',
      'Educação',
      'Compras',
      'Serviços',
      'Outros'
    ],
    income: [
      'Salário',
      'Freelance',
      'Investimentos',
      'Vendas',
      'Presente',
      'Outros'
    ]
  };

  const updateField = (field: keyof TransactionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { amount, description, category } = formData;

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erro', 'Por favor, informe um valor válido');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, informe uma descrição');
      return false;
    }

    if (!category) {
      Alert.alert('Erro', 'Por favor, selecione uma categoria');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // TODO: Implementar salvamento real
      const newTransaction = {
        id: Date.now().toString(),
        ...formData,
        amount: formData.type === 'expense' 
          ? -parseFloat(formData.amount) 
          : parseFloat(formData.amount),
      };

      console.log('Nova transação:', newTransaction);
      
      Alert.alert(
        'Sucesso!', 
        'Transação adicionada com sucesso!',
        [
          {
            text: 'Adicionar outra',
            onPress: () => {
              setFormData({
                ...formData,
                amount: '',
                description: '',
                merchant: '',
                notes: '',
              });
            }
          },
          {
            text: 'Voltar',
            onPress: () => navigation.goBack(),
            style: 'default'
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar transação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAccount = () => {
    return mockAccounts.find(acc => acc.id === formData.accountId);
  };

  const getSelectedCard = () => {
    return mockCreditCards.find(card => card.id === formData.creditCardId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <Text variant="headlineSmall" style={styles.title}>
        Nova Transação
      </Text>

      {/* Type Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Tipo de Transação
          </Text>
          
          <SegmentedButtons
            value={formData.type}
            onValueChange={(value) => {
              updateField('type', value as 'income' | 'expense');
              updateField('category', ''); // Reset category when type changes
            }}
            buttons={[
              {
                value: 'expense',
                label: '💸 Despesa',
                icon: 'minus'
              },
              {
                value: 'income',
                label: '💰 Receita',
                icon: 'plus'
              }
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      {/* Amount and Description */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Informações Básicas
          </Text>
          
          <TextInput
            label={`Valor ${formData.type === 'expense' ? '(R$)' : '(R$)'}`}
            value={formData.amount}
            onChangeText={(value) => updateField('amount', value.replace(/[^0-9.,]/g, ''))}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            left={<TextInput.Icon icon={formData.type === 'expense' ? 'minus' : 'plus'} />}
            placeholder="0,00"
          />

          <TextInput
            label="Descrição"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="text" />}
            placeholder="Ex: Almoço no restaurante"
          />

          <TextInput
            label="Data"
            value={formData.date}
            onChangeText={(value) => updateField('date', value)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
          />
        </Card.Content>
      </Card>

      {/* Category */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Categoria
          </Text>
          
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.menuButton}
                icon="tag"
              >
                {formData.category || 'Selecionar categoria'}
              </Button>
            }
          >
            {categories[formData.type].map((category) => (
              <Menu.Item
                key={category}
                onPress={() => {
                  updateField('category', category);
                  setCategoryMenuVisible(false);
                }}
                title={category}
              />
            ))}
          </Menu>

          {formData.category && (
            <Chip
              style={styles.categoryChip}
              icon="tag"
              onClose={() => updateField('category', '')}
            >
              {formData.category}
            </Chip>
          )}
        </Card.Content>
      </Card>

      {/* Account Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Conta e Pagamento
          </Text>
          
          <Menu
            visible={accountMenuVisible}
            onDismiss={() => setAccountMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setAccountMenuVisible(true)}
                style={styles.menuButton}
                icon="bank"
              >
                {getSelectedAccount()?.name || 'Selecionar conta'}
              </Button>
            }
          >
            {mockAccounts.map((account) => (
              <Menu.Item
                key={account.id}
                onPress={() => {
                  updateField('accountId', account.id);
                  setAccountMenuVisible(false);
                }}
                title={`${account.name} - ${account.bankName}`}
              />
            ))}
          </Menu>

          {formData.type === 'expense' && (
            <>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.optionalLabel}>
                Cartão de Crédito (opcional)
              </Text>
              
              <Menu
                visible={cardMenuVisible}
                onDismiss={() => setCardMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setCardMenuVisible(true)}
                    style={styles.menuButton}
                    icon="credit-card"
                  >
                    {getSelectedCard()?.name || 'Nenhum cartão'}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    updateField('creditCardId', '');
                    setCardMenuVisible(false);
                  }}
                  title="Nenhum cartão"
                />
                {mockCreditCards.map((card) => (
                  <Menu.Item
                    key={card.id}
                    onPress={() => {
                      updateField('creditCardId', card.id);
                      setCardMenuVisible(false);
                    }}
                    title={`${card.name} (•••• ${card.lastFourDigits})`}
                  />
                ))}
              </Menu>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Additional Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Informações Adicionais
          </Text>
          
          <TextInput
            label="Estabelecimento/Origem"
            value={formData.merchant}
            onChangeText={(value) => updateField('merchant', value)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="store" />}
            placeholder="Ex: Restaurante do João"
          />

          <TextInput
            label="Observações"
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="note" />}
            placeholder="Observações adicionais..."
          />
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancelar
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
        >
          {loading ? 'Salvando...' : 'Salvar Transação'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    marginVertical: 8,
  },
  input: {
    marginBottom: 16,
  },
  menuButton: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  optionalLabel: {
    marginBottom: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 4,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddTransactionScreen;






