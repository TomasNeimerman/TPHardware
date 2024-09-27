import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Asegúrate de tener AsyncStorage instalado
import { MaterialIcons } from '@expo/vector-icons'; // Para íconos visuales

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmergencyNumber = async () => {
      try {
        const number = await AsyncStorage.getItem('emergencyNumber');
        if (number) {
          setEmergencyNumber(formatPhoneNumber(number));
        }
      } catch (error) {
        console.error('Error al obtener el número de emergencia:', error);
      }
    };

    fetchEmergencyNumber();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers], // Solo obtener contactos con números
        });
        setContacts(data.length > 0 ? data : []);
        if (data.length === 0) {
          Alert.alert('No se encontraron contactos');
        }
      } else {
        Alert.alert('Permiso para acceder a los contactos denegado');
      }
    } catch (error) {
      console.error('Error al obtener los contactos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return digitsOnly.slice(-8);
  };

  const renderItem = ({ item }) => {
    const originalPhoneNumber = item.phoneNumbers ? item.phoneNumbers[0].number : 'Sin número';
    const formattedPhoneNumber = item.phoneNumbers ? formatPhoneNumber(item.phoneNumbers[0].number) : '';
    const isEmergencyContact = formattedPhoneNumber === emergencyNumber;

    return (
      <View style={styles.contactItem}>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={[styles.contactNumber, isEmergencyContact && styles.emergencyNumber]}>
            {originalPhoneNumber}
          </Text>
        </View>
        {isEmergencyContact && (
          <MaterialIcons name="error" size={24} color="red" style={styles.emergencyIcon} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : contacts.length === 0 ? (
        <Text style={styles.noContactsText}>No hay contactos disponibles</Text>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.contactList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  contactList: {
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contactNumber: {
    fontSize: 16,
    color: '#666',
  },
  emergencyNumber: {
    color: 'red',
    fontWeight: 'bold',
  },
  emergencyIcon: {
    marginLeft: 10,
  },
  noContactsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
