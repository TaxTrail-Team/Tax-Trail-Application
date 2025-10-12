import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../store/useAuth';
import logo from '../assets/logo.png';
import google from '../assets/google.png'
import emailIcon from '../assets/email.png';
import passwordIcon from '../assets/password.png';
export default function Login({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onLogin() {
    try {
      setErr('');
      await login(email, password);
    } catch (e: any) {
      setErr(e?.message || 'Login failed');
    }
  }

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Your smart tax assistant</Text>

      <View style={styles.card}>
        <View style={styles.inputRow}>
           <Image source={emailIcon} style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={styles.input}
              />
        </View>

        <View style={styles.inputRow}>
          <Image source={passwordIcon} style={styles.inputIcon} />
    <TextInput
      placeholder="Password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      style={styles.input}
    />
        </View>

        {err ? <Text style={styles.error}>{err}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.divider}>──────── or ────────</Text>

        <TouchableOpacity style={styles.socialButton}>
          <Image source={google} style={styles.socialIcon} />
          <Text style={styles.socialText}>Login with Google</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginTop: 16 }}>
        <Text style={{ color: '#374151', textAlign: 'center' }}>
          New here? <Text style={{ fontWeight: '600' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', padding: 24, justifyContent: 'center' },
  logo: { width: 90, height: 90, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F4C81' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  button: {
    backgroundColor: '#0F4C81',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    textAlign: 'center',
    color: '#9ca3af',
    marginVertical: 16,
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
  },
  socialText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#374151',
  },
  socialIcon: {
  width: 20,
  height: 20,
  marginRight: 8,
  resizeMode: 'contain',
},
inputIcon: {
  width: 20,
  height: 20,
  marginRight: 8,
  resizeMode: 'contain',
},

});
