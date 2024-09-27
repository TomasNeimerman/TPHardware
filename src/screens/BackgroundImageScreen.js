import React, { useState, useEffect } from 'react';
import { View, Button, ImageBackground, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveToStorage, getFromStorage } from '../helpers/storageHelper';
import { errorHandler } from '../helpers/errorHandler';

const BackgroundImageScreen = () => {
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    const loadBackgroundImage = async () => {
      try {
        const storedImage = await getFromStorage('backgroundImage');
        if (storedImage) {
          setBackgroundImage(storedImage);
        }
      } catch (error) {
        errorHandler(error.message);
      }
    };
    loadBackgroundImage();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.cancelled) {
        setBackgroundImage(result.uri);
        await saveToStorage('backgroundImage', result.uri);
      }
    } catch (error) {
      errorHandler('Error picking image');
    }
  };

  return (
    <ImageBackground source={{ uri: backgroundImage }} style={styles.background}>
      <View style={styles.container}>
        <Button title="Select Background Image" onPress={pickImage} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
});

export default BackgroundImageScreen;
