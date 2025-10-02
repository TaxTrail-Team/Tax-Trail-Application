import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/useAuth';

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <View style={{ flex: 1, padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>Profile</Text>
      <Text>{user?.email}</Text>
      <TouchableOpacity onPress={logout} style={{ backgroundColor: 'black', padding: 12, borderRadius: 8, marginTop: 12 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
