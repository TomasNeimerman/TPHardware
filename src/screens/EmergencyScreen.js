import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmergencyScreen() {
  const [emergencyNumber, setEmergencyNumber] = useState('');

  const saveEmergencyNumber = async () => {
  
    if (emergencyNumber) {
      try {
        await AsyncStorage.setItem('emergencyNumber', emergencyNumber);
        Alert.alert(`Número guardado correctamente ${emergencyNumber}`);
      } catch (error) {
        Alert.alert('Error guardando el número');
      }
    } else {
      Alert.alert('Por favor, ingresa un número válido');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración del Número de Emergencia</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="Ingresa el número de emergencia"
        value={emergencyNumber}
        onChangeText={setEmergencyNumber}
      />
      <Button title="Guardar Número" onPress={saveEmergencyNumber} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
});
