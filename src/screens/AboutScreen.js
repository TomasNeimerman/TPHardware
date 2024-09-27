import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { BarCodeScanner } from 'expo-barcode-scanner';

const AboutScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Solicitar permiso para usar la cámara
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handler para el escaneo del código QR
  const handleBarCodeScanned = ({ data }) => {
    setScannedData(data);
    setScanning(false);
    setModalVisible(true);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso para acceder a la cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Permiso denegado para acceder a la cámara.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Información de la Aplicación</Text>

      <View style={styles.qrContainer}>
        <QRCode
          value="Tomas Neimerman"
          size={220}
          backgroundColor="transparent"
          color="#3902d0"
        />
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setScanning(true)}
      >
        <Text style={styles.buttonText}>Escanear otra App</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Integrantes de la aplicación escaneada:</Text>
          <Text style={styles.scannedText}>{scannedData ? scannedData : 'No se escaneó ningún código'}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {scanning && (
        <BarCodeScanner
          onBarCodeScanned={scannedData ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3902d0',
    marginBottom: 15,
  },
  version: {
    fontSize: 16,
    color: '#004D40',
    marginBottom: 10,
  },
  qrContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  scanButton: {
    backgroundColor: '#3902d0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }});
  export default AboutScreen;
