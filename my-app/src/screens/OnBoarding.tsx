import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const slides = [
    { title: 'Welcome', body: 'Track & convert taxes across currencies.' },
    { title: 'Secure', body: 'Login with Appwrite. Your data stays private.' },
    { title: 'Smart', body: 'LangChain-powered conversions with live FX.' },
  ];
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
      <View />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>{slides[i].title}</Text>
        <Text style={{ fontSize: 16, marginTop: 12, textAlign: 'center' }}>{slides[i].body}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={onDone}><Text>Skip</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => last ? onDone() : setI(i + 1)}>
          <Text style={{ fontWeight: '700' }}>{last ? 'Done' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
