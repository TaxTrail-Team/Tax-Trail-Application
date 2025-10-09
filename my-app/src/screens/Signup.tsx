import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../store/useAuth';
import logo from '../assets/logo.png';
import secureIcon from '../assets/secure.png';
import analyticsIcon from '../assets/analytics.png';
import convertIcon from '../assets/convert.png';
import emailIcon from '../assets/email.png';
import passwordIcon from '../assets/password.png';



export default function Signup({ navigation }: any) {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSignup() {
    try {
      setErr('');
      await signup(email, password);
    } catch (e: any) {
      setErr(e?.message || 'Signup failed');
    }
  }

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Start tracking smarter, today.</Text>

      <View style={styles.benefits}>
  <View style={styles.benefits}>
  <View style={styles.benefitItem}>
    <Image source={secureIcon} style={styles.benefitImage} />
    <Text style={styles.benefitText}>Secure, private access</Text>
  </View>
  <View style={styles.benefitItem}>
    <Image source={analyticsIcon} style={styles.benefitImage} />
    <Text style={styles.benefitText}>Real-time tax insights</Text>
  </View>
  <View style={styles.benefitItem}>
    <Image source={convertIcon} style={styles.benefitImage} />
    <Text style={styles.benefitText}>Currency auto-conversion</Text>
  </View>
</View>
</View>


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

        <TouchableOpacity style={styles.button} onPress={onSignup}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }}>
        <Text style={{ color: '#374151', textAlign: 'center' }}>
          Already have an account? <Text style={{ fontWeight: '600' }}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    padding: 24,
    justifyContent: 'center',
  },
  logo: { width: 90, height: 90, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F4C81' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  benefits: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  benefitText: {
  fontSize: 14,
  color: '#374151',
},
benefitImage: {
  width: 20,
  height: 20,
  marginRight: 8,
  resizeMode: 'contain',
},
  benefitItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
},
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
  inputIcon: {
  width: 20,
  height: 20,
  marginRight: 8,
  resizeMode: 'contain',
},

});
