import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import showError from '../helpers/errorHandler.js';

export default function TemperatureScreen() {
  const [location, setLocation] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale] = useState(new Animated.Value(1)); // Animación de escala

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
      setDateTime({ date: now.toLocaleDateString('es-ES', optionsDate), time: now.toLocaleTimeString('es-ES', optionsTime) });
    };

    const intervalId = setInterval(updateDateTime, 1000);

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permiso de ubicación denegado');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const { latitude, longitude } = loc.coords;
      const apiKey = '989614a8f5ad010e430304b554547c1b'; // Reemplaza con tu propia clave
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      try {
        const response = await axios.get(url);
        setTemperature(response.data.main.temp);
        // Activar la animación cuando cambie la temperatura
        Animated.spring(scale, {
          toValue: 1.2, // Escalar la temperatura para resaltarla
          friction: 2,
          useNativeDriver: true,
        }).start(() => {
          Animated.spring(scale, {
            toValue: 1, // Volver a su tamaño original
            friction: 2,
            useNativeDriver: true,
          }).start();
        });
      } catch (error) {
        showError('Error obteniendo la temperatura');
      }
      setLoading(false);
    })();

    return () => clearInterval(intervalId);
  }, []);

  const getTemperatureColor = (temp) => {
    if (temp <= 0) return '#00bcd4'; // Azul frío
    if (temp <= 15) return '#03a9f4'; // Azul claro
    if (temp <= 30) return '#ffeb3b'; // Amarillo
    return '#f44336'; // Rojo caliente
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#00bcd4" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temperatura Actual</Text>
      {location ? (
        <Text style={styles.text}>Ubicación: {location.coords.latitude.toFixed(2)}, {location.coords.longitude.toFixed(2)}</Text>
      ) : (
        <Text style={styles.text}>Ubicación no disponible</Text>
      )}
      {temperature !== null ? (
        <Animated.Text style={[styles.temperature, { color: getTemperatureColor(temperature), transform: [{ scale }] }]}>
          {temperature.toFixed(1)}°C
        </Animated.Text>
      ) : (
        <Text style={styles.text}>Temperatura no disponible</Text>
      )}
      {dateTime ? (
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>Fecha: {dateTime.date}</Text>
          <Text style={styles.time}>Hora: {dateTime.time}</Text>
        </View>
      ) : (
        <Text style={styles.text}>Fecha y Hora no disponible</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  loader: {
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3902d0',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#004d40',
    marginBottom: 10,
    textAlign: 'center',
  },
  temperature: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateTimeContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  date: {
    fontSize: 18,
    fontWeight: '500',
    color: '#004d40',
    marginBottom: 5,
  },
  time: {
    fontSize: 18,
    fontWeight: '500',
    color: '#004d40',
  },
});
