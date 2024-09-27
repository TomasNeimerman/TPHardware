import { Alert, Vibration } from 'react-native';

const errorHandler = (message) => {
  Vibration.vibrate();
  Alert.alert('Error', message, [{ text: 'OK' }]);
};

export default errorHandler