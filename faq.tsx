import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function FAQ() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Часто задаваемые вопросы (FAQ)</Text>
      <Text style={styles.question}>Вопрос 1: Как играть?</Text>
      <Text style={styles.answer}>Просто нажимайте на кнопку "Играть" и собирайте очки!</Text>
      <Text style={styles.question}>Вопрос 2: Как улучшать?</Text>
      <Text style={styles.answer}>Используйте очки для апгрейдов множителя.</Text>
      {/* Добавьте свои вопросы и ответы */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  question: { fontSize: 20, fontWeight: '600', marginTop: 15 },
  answer: { fontSize: 16, marginTop: 5, color: '#555' },
});
