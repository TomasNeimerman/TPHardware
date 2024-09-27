import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { Alert, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Accelerometer } from 'expo-sensors'; 

import HomeScreen from './src/screens/HomeScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import TemperatureScreen from './src/screens/TemperatureScreen';
import AboutScreen from './src/screens/AboutScreen.js';
import showError from './src/helpers/errorHandler.js';


const Stack = createStackNavigator();

const EmergencyCall = () => {
  useEffect(() => {
    const sendEmergencyMessage = async () => {
      try {
        const emergencyContact = await AsyncStorage.getItem('emergencyNumber');
        if (emergencyContact) {
         showError('Sending emergency message...');
          Linking.openURL(`whatsapp://send?text=Prueba&phone=${emergencyContact}`);
        } else {
          showError('No emergency contact configured');
        }
      } catch (error) {
        showError('Error sending emergency message:', error);
      }
    };

    const subscription = Accelerometer.addListener((data) => {
      if (Math.abs(data.x) > 1.5 || Math.abs(data.y) > 1.5 || Math.abs(data.z) > 1.5) {
        sendEmergencyMessage();
      }
    });

    return () => subscription.remove();
  }, []);

  return null; 
};

export default function App() {
  return (
    <NavigationContainer>
      <EmergencyCall /> 
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="Temperature" component={TemperatureScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
