/**
 * Utilitários para transações
 */

/**
 * Detectar categoria da transação baseada na descrição e valor
 */
export const getTransactionCategory = (description: string, amount: number): string => {
  const desc = description.toLowerCase();
  
  if (desc.includes('shopping') || desc.includes('loja') || desc.includes('store')) {
    return 'shopping';
  }
  if (desc.includes('restaurante') || desc.includes('restaurant') || desc.includes('comida') || desc.includes('food')) {
    return 'comida';
  }
  if (desc.includes('combustível') || desc.includes('gasolina') || desc.includes('posto')) {
    return 'combustível';
  }
  if (desc.includes('transferência') || desc.includes('transfer') || desc.includes('pix')) {
    return amount < 0 ? 'transferência' : 'recebido';
  }
  if (desc.includes('pagamento') || desc.includes('payment') || desc.includes('boleto')) {
    return 'pagamento';
  }
  if (desc.includes('saque') || desc.includes('atm')) {
    return 'saque';
  }
  if (desc.includes('estacionamento') || desc.includes('parking')) {
    return 'estacionamento';
  }
  if (desc.includes('uber') || desc.includes('taxi') || desc.includes('transporte')) {
    return 'transporte';
  }
  if (desc.includes('farmacia') || desc.includes('farmácia') || desc.includes('medicamento')) {
    return 'saúde';
  }
  if (desc.includes('supermercado') || desc.includes('mercado') || desc.includes('grocery')) {
    return 'supermercado';
  }
  if (desc.includes('girogio') || desc.includes('burger') || desc.includes('restaurant')) {
    return 'comida';
  }
  if (desc.includes('eskina') || desc.includes('evento')) {
    return 'entretenimento';
  }
  
  return amount < 0 ? 'compra' : 'recebido';
};

/**
 * Obter ícone da transação baseado na descrição
 */
export const getTransactionIcon = (description: string, amount: number): string => {
  const desc = description.toLowerCase();
  
  if (desc.includes('transfer')) return 'swap-horizontal';
  if (desc.includes('shopping') || desc.includes('compra') || desc.includes('loja')) return 'shopping';
  if (desc.includes('pix')) return 'flash';
  if (desc.includes('saque')) return 'cash';
  if (desc.includes('restaurante') || desc.includes('comida')) return 'food';
  if (desc.includes('uber') || desc.includes('taxi')) return 'car';
  if (desc.includes('estacionamento')) return 'parking';
  if (desc.includes('farmacia') || desc.includes('saúde')) return 'medical-bag';
  if (desc.includes('supermercado') || desc.includes('mercado')) return 'cart';
  
  return amount < 0 ? 'arrow-down' : 'arrow-up';
};
