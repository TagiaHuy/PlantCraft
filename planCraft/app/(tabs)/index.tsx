import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [backendMessage, setBackendMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/')
      .then((response) => response.text())
      .then((data) => setBackendMessage(data))
      .catch((error) => setBackendMessage('Error connecting to backend'));
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PlantCraft</Text>
        <Text style={styles.subtitle}>Welcome to PlantCraft!</Text>
      </View>
      <View style={{ padding: 24 }}>
        <Text style={{ color: '#333' }}>Backend says:</Text>
        <Text style={{ color: '#007700', marginTop: 4 }}>{backendMessage}</Text>
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
});

export default App;
