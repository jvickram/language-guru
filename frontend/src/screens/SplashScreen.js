import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { bootstrapSession } from '../redux/store';

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isBootstrapping } = useSelector((state) => state.auth);

  React.useEffect(() => {
    dispatch(bootstrapSession());
  }, [dispatch]);

  React.useEffect(() => {
    if (!isBootstrapping) {
      navigation.replace(user ? 'Home' : 'Login');
    }
  }, [isBootstrapping, navigation, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Language Guru</Text>
      <Text style={styles.tagline}>Learn smarter, one lesson at a time.</Text>
      <ActivityIndicator size="large" color="#2b6cb0" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7fb',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 34,
    fontWeight: '800',
    color: '#12355b',
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    color: '#3c556f',
    textAlign: 'center',
  },
  loader: {
    marginTop: 28,
  },
});

export default SplashScreen;