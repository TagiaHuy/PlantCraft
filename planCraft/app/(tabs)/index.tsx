import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [backendMessage] = useState('');
  const [apiText, setApiText] = useState('');

  const fetchJson = async () => {
    try {
      const response = await fetch('https://plancraft-production.up.railway.app/json');
      const data = await response.json();
      setApiText(data.message);
    } catch (error) {
      console.error('Error fetching JSON:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PlantCraft</Text>
        <Text style={styles.subtitle}>Welcome to PlantCraft!</Text>
      </View>
      <View style={styles.messageContainer}>
        <View style={{ padding: 24 }}>
          <Text style={{ color: '#333' }}>Backend says: {apiText}</Text>
          <Text style={{ color: '#007700', marginTop: 4 }}>{backendMessage}</Text>
          <TouchableOpacity style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' }} onPress={() => fetchJson()}>
            <Text style={{ color: '#fff', fontSize: 16 }}>get message from server</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  messageContainer: {
    padding: 24,
  },
  messageText: {
    color: '#333',
  },
  backendMessage: {
    color: '#007700',
    marginTop: 4,
  }
});

export default App;
