import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Gerar últimos 6 meses
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthYear = date.toISOString().slice(0, 7); // YYYY-MM format
    const monthName = date.toLocaleDateString('pt-BR', { 
      month: 'short',
      year: '2-digit'
    });
    return {
      value: monthYear,
      label: monthName.charAt(0).toUpperCase() + monthName.slice(1)
    };
  });

  const buttons = months.map(month => ({
    value: month.value,
    label: month.label,
  }));

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={selectedMonth}
        onValueChange={onMonthChange}
        buttons={buttons}
        style={styles.segmentedButtons}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  segmentedButtons: {
    marginVertical: 8,
  },
});

export default MonthSelector;






