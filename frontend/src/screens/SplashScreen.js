import React from 'react';
import { View, Text } from 'react-native';

const SplashScreen = ({ navigation }) => {
  React.useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Language Guru</Text>
    </View>
  );
};

export default SplashScreen;