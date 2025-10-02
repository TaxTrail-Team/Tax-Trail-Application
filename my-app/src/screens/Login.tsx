import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/useAuth';

export default function Login({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onLogin() {
    try { setErr(''); await login(email, password); }
    catch (e: any) { setErr(e?.message || 'Login failed'); }
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 12, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Login</Text>
      <TextInput placeholder="Email" autoCapitalize='none' value={email} onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }} />
      {err ? <Text style={{ color: 'red' }}>{err}</Text> : null}
      <TouchableOpacity onPress={onLogin} style={{ backgroundColor: 'black', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text>New here? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
