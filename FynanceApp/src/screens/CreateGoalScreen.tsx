import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  useTheme,
  Chip,
  List,
  Divider,
  IconButton,
  Snackbar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type CreateGoalScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  suggestedAmount: number;
  category: string;
  icon: string;
  tips: string[];
}

const CreateGoalScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<CreateGoalScreenNavigationProp>();
  
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const goalTemplates: GoalTemplate[] = [
    {
      id: '1',
      title: 'Reserva de Emergência',
      description: '6 meses de gastos essenciais',
      suggestedAmount: 12000,
      category: 'Segurança',
      icon: '🛡️',
      tips: ['Comece com 1 salário', 'Guarde 10% da renda mensalmente', 'Use apenas em emergências reais']
    },
    {
      id: '2',
      title: 'Viagem dos Sonhos',
      description: 'Aquela viagem especial',
      suggestedAmount: 8000,
      category: 'Lazer',
      icon: '✈️',
      tips: ['Pesquise destinos baratos', 'Compre com antecedência', 'Considere baixa temporada']
    },
    {
      id: '3',
      title: 'Casa Própria',
      description: 'Entrada para financiamento',
      suggestedAmount: 50000,
      category: 'Investimento',
      icon: '🏠',
      tips: ['Entrada de 20-30%', 'FGTS pode ajudar', 'Compare financiamentos']
    },
    {
      id: '4',
      title: 'Carro Novo',
      description: 'Veículo ou entrada',
      suggestedAmount: 25000,
      category: 'Transporte',
      icon: '🚗',
      tips: ['Considere seminovos', 'Pesquise financiamentos', 'Avalie custo-benefício']
    },
    {
      id: '5',
      title: 'Curso/Faculdade',
      description: 'Investimento em educação',
      suggestedAmount: 15000,
      category: 'Educação',
      icon: '🎓',
      tips: ['Bolsas de estudo', 'Cursos online', 'ProUni/FIES']
    },
    {
      id: '6',
      title: 'Aposentadoria',
      description: 'Futuro tranquilo',
      suggestedAmount: 100000,
      category: 'Previdência',
      icon: '🏖️',
      tips: ['Comece cedo', 'Invista consistentemente', 'Diversifique aplicações']
    }
  ];

  const categories = [
    { key: 'Segurança', label: 'Segurança', icon: '🛡️' },
    { key: 'Lazer', label: 'Lazer', icon: '🎉' },
    { key: 'Investimento', label: 'Investimento', icon: '📈' },
    { key: 'Transporte', label: 'Transporte', icon: '🚗' },
    { key: 'Educação', label: 'Educação', icon: '🎓' },
    { key: 'Previdência', label: 'Previdência', icon: '🏖️' },
    { key: 'Outros', label: 'Outros', icon: '🎯' }
  ];

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const useTemplate = (template: GoalTemplate) => {
    setTitle(template.title);
    setTargetAmount(template.suggestedAmount.toString());
    setDescription(template.description);
    setSelectedCategory(template.category);
    showMessage(`Template "${template.title}" aplicado!`);
  };

  const handleCreateGoal = async () => {
    // Validations
    if (!title.trim()) {
      showMessage('Título é obrigatório');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      showMessage('Valor da meta deve ser maior que zero');
      return;
    }

    if (!selectedCategory) {
      showMessage('Selecione uma categoria');
      return;
    }

    const currentAmountNum = parseFloat(currentAmount) || 0;
    const targetAmountNum = parseFloat(targetAmount);

    if (currentAmountNum > targetAmountNum) {
      showMessage('Valor atual não pode ser maior que a meta');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newGoal = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim() || `Meta de ${selectedCategory}`,
        targetAmount: targetAmountNum,
        currentAmount: currentAmountNum,
        category: selectedCategory,
        targetDate: targetDate || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Nova meta criada:', newGoal);
      
      showMessage('Meta criada com sucesso!');
      
      // Navigate back to goals screen
      setTimeout(() => {
        navigation.goBack();
      }, 1000);

    } catch (error) {
      showMessage('Erro ao criar meta');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^\d]/g, '')) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number / 100);
  };

  const handleAmountChange = (value: string, setter: (val: string) => void) => {
    const numbers = value.replace(/[^\d]/g, '');
    setter(numbers);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          🎯 Nova Meta Financeira
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.outline }]}>
          Defina seus objetivos e conquiste seus sonhos!
        </Text>
      </View>

      {/* Templates */}
      <Card style={styles.templatesCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            💡 Modelos Prontos
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
            {goalTemplates.map(template => (
              <Card key={template.id} style={styles.templateCard} onPress={() => useTemplate(template)}>
                <Card.Content style={styles.templateContent}>
                  <Text style={styles.templateIcon}>{template.icon}</Text>
                  <Text variant="bodyMedium" style={styles.templateTitle} numberOfLines={2}>
                    {template.title}
                  </Text>
                  <Text variant="bodySmall" style={[styles.templateAmount, { color: theme.colors.primary }]}>
                    {formatCurrency(template.suggestedAmount.toString())}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Goal Form */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📝 Detalhes da Meta
          </Text>

          <TextInput
            label="Título da meta *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Viagem para Europa"
            left={<TextInput.Icon icon="target" />}
          />

          <TextInput
            label="Valor da meta *"
            value={formatCurrency(targetAmount)}
            onChangeText={(value) => handleAmountChange(value, setTargetAmount)}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="R$ 0,00"
            left={<TextInput.Icon icon="currency-usd" />}
          />

          <TextInput
            label="Valor já economizado"
            value={formatCurrency(currentAmount)}
            onChangeText={(value) => handleAmountChange(value, setCurrentAmount)}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="R$ 0,00"
            left={<TextInput.Icon icon="piggy-bank" />}
          />

          <TextInput
            label="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Descreva sua meta..."
            left={<TextInput.Icon icon="text" />}
          />

          <TextInput
            label="Data limite (opcional)"
            value={targetDate}
            onChangeText={setTargetDate}
            mode="outlined"
            style={styles.input}
            placeholder="dd/mm/aaaa"
            left={<TextInput.Icon icon="calendar" />}
          />
        </Card.Content>
      </Card>

      {/* Category Selection */}
      <Card style={styles.categoryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🏷️ Categoria *
          </Text>
          
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <Chip
                key={category.key}
                mode={selectedCategory === category.key ? 'flat' : 'outlined'}
                selected={selectedCategory === category.key}
                onPress={() => setSelectedCategory(category.key)}
                style={styles.categoryChip}
                icon={() => <Text>{category.icon}</Text>}
              >
                {category.label}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Tips */}
      {selectedCategory && (
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              💡 Dicas para sua Meta
            </Text>
            
            {goalTemplates
              .find(t => t.category === selectedCategory)
              ?.tips.map((tip, index) => (
                <List.Item
                  key={index}
                  title={tip}
                  left={() => <Text style={styles.tipIcon}>💡</Text>}
                  titleNumberOfLines={2}
                />
              ))}
          </Card.Content>
        </Card>
      )}

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
          onPress={handleCreateGoal}
          style={styles.createButton}
          loading={loading}
          disabled={loading}
        >
          Criar Meta
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 20,
  },
  templatesCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  templatesScroll: {
    marginHorizontal: -8,
  },
  templateCard: {
    width: 140,
    marginHorizontal: 8,
    elevation: 2,
  },
  templateContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  templateTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
    height: 40,
  },
  templateAmount: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  formCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  categoryCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 8,
  },
  tipsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#e8f5e8',
  },
  tipIcon: {
    fontSize: 16,
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
  createButton: {
    flex: 2,
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default CreateGoalScreen;






