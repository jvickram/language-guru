import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../redux/store';
import { DEMO_CREDENTIALS } from '../config/api';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  const [isRegisterMode, setIsRegisterMode] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = React.useState(DEMO_CREDENTIALS.password);
  const [role, setRole] = React.useState('Software Engineer');

  React.useEffect(() => {
    if (user) {
      navigation.replace('Home');
    }
  }, [navigation, user]);

  const onSubmit = async () => {
    if (isRegisterMode) {
      await dispatch(
        registerUser({
          username: username.trim(),
          email: email.trim(),
          password,
          role: role.trim(),
        }),
      );
      return;
    }

    await dispatch(
      loginUser({
        email: email.trim(),
        password,
        role: role.trim(),
      }),
    );
  };

  const onDemoLogin = async () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setRole('Software Engineer');
    await dispatch(loginUser({ ...DEMO_CREDENTIALS, role: 'Software Engineer' }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Language Guru</Text>
        <Text style={styles.subtitle}>
          {isRegisterMode ? 'Create your learner account' : 'Sign in to continue your learning path'}
        </Text>

        {isRegisterMode ? (
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#7d8ea3"
            autoCapitalize="none"
          />
        ) : null}

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#7d8ea3"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#7d8ea3"
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          value={role}
          onChangeText={setRole}
          placeholder="Target role (e.g., Software Engineer)"
          placeholderTextColor="#7d8ea3"
        />

        <View style={styles.roleRow}>
          {['Software Engineer', 'Product Manager', 'Data Analyst'].map((preset) => (
            <Pressable
              key={preset}
              style={[styles.roleChip, role === preset ? styles.roleChipActive : null]}
              onPress={() => setRole(preset)}
            >
              <Text style={[styles.roleChipText, role === preset ? styles.roleChipTextActive : null]}>
                {preset}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryText}>{isRegisterMode ? 'Create Account' : 'Login'}</Text>
          )}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onDemoLogin} disabled={isLoading}>
          <Text style={styles.secondaryText}>Use Demo Account</Text>
        </Pressable>

        <Pressable onPress={() => setIsRegisterMode((v) => !v)}>
          <Text style={styles.switchText}>
            {isRegisterMode ? 'Already have an account? Login' : 'New learner? Create an account'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#edf2f7',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#0f2d4f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f2d4f',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    color: '#4b6077',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e1ea',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 12,
    backgroundColor: '#f8fbff',
  },
  error: {
    color: '#c53030',
    marginBottom: 10,
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#c9d7e7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryText: {
    color: '#1f4c7a',
    fontWeight: '600',
  },
  switchText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#1f6feb',
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  roleChip: {
    borderWidth: 1,
    borderColor: '#c9d7e7',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  roleChipActive: {
    borderColor: '#1f6feb',
    backgroundColor: '#eaf2ff',
  },
  roleChipText: {
    color: '#355070',
    fontSize: 12,
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: '#1f4c9c',
  },
});

export default LoginScreen;