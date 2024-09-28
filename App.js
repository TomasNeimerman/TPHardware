import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button, FlatList, Alert, Vibration, TextInput, StyleSheet } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import axios from 'axios';
import { BarCodeScanner } from 'expo-barcode-scanner';

const Stack = createStackNavigator();

// Emergency Number Configuration Screen
const EmergencyNumberScreen = ({ navigation }) => {
  const [emergencyNumber, setEmergencyNumber] = useState('');

  useEffect(() => {
    loadEmergencyNumber();
  }, []);

  const loadEmergencyNumber = async () => {
    try {
      const storedNumber = await AsyncStorage.getItem('emergencyNumber');
      if (storedNumber) setEmergencyNumber(storedNumber);
    } catch (error) {
      showError('Failed to load emergency number');
    }
  };

  const saveEmergencyNumber = async () => {
    try {
      await AsyncStorage.setItem('emergencyNumber', emergencyNumber);
      showMessage('Emergency number saved successfully');
    } catch (error) {
      showError('Failed to save emergency number');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={emergencyNumber}
        onChangeText={setEmergencyNumber}
        placeholder="Enter emergency number"
        keyboardType="phone-pad"
      />
      <Button title="Save" onPress={saveEmergencyNumber} />
      <View style={styles.navigationButtons}>
        <Button
          title="Go to Contacts"
          onPress={() => navigation.navigate('Contacts')}
        />
        <Button
          title="Go to Weather and Time"
          onPress={() => navigation.navigate('Weather and Time')}
        />
        <Button
          title="Go to About"
          onPress={() => navigation.navigate('About')}
        />
      </View>
    </View>
  );
};

// Contacts Screen
const ContactsScreen = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        setContacts(data);
      } else {
        showError('Contacts permission denied');
      }
    } catch (error) {
      showError('Failed to load contacts');
    }
  };

  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.contactItem}>
          <Text>{`${item.firstName} ${item.lastName}`}</Text>
          <Text>{item.phoneNumbers && item.phoneNumbers[0] && item.phoneNumbers[0].number}</Text>
        </View>
      )}
    />
  );
};

// Weather and Time Screen
const WeatherTimeScreen = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [temperature, setTemperature] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    loadWeatherAndLocation();
    return () => clearInterval(timer);
  }, []);

  const loadWeatherAndLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=YOUR_API_KEY`);
      setTemperature(response.data.main.temp);
    } catch (error) {
      showError('Failed to load weather data');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{dateTime.toLocaleString()}</Text>
      {temperature && <Text style={styles.text}>{`Temperature: ${temperature}°C`}</Text>}
      {location && (
        <Text style={styles.text}>{`Location: ${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}`}</Text>
      )}
    </View>
  );
};

// About Screen (QR Code)
const AboutScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert('Scanned App Info', data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Scan QR Code of another app</Text>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  navigationButtons: {
    marginTop: 20,
  },
});

// Main App component
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Emergency Number" 
          component={EmergencyNumberScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <Button
                onPress={() => navigation.navigate('About')}
                title="About"
              />
            ),
          })}
        />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="Weather and Time" component={WeatherTimeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;