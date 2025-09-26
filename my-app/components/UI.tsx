// components/UI.tsx
import React from 'react';
import { Pressable, Text, TextInput, View, ViewStyle, TextStyle } from 'react-native';

export function Input(props: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
}) {
  return (
    <View style={[{ width: '100%', backgroundColor: '#E9EFEC', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }, props.style]}>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#16423C"
        secureTextEntry={props.secureTextEntry}
        autoCapitalize={props.autoCapitalize ?? 'none'}
        keyboardType={props.keyboardType ?? 'default'}
        style={[{ color: '#16423C', fontSize: 16 }, props.inputStyle]}
      />
    </View>
  );
}

export function Button(props: { title: string; onPress: () => void; style?: ViewStyle; textStyle?: TextStyle }) {
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        {
          backgroundColor: '#16423C',
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
          minWidth: 120,
          paddingHorizontal: 16,
        },
        props.style,
      ]}
    >
      <Text style={[{ color: '#fff', fontSize: 16, fontWeight: '700' }, props.textStyle]}>{props.title}</Text>
    </Pressable>
  );
}

export function LinkText(props: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress}>
      {({ pressed }) => (
        <Text style={{ color: '#16423C', textDecorationLine: 'underline', opacity: pressed ? 0.7 : 1 }}>
          {props.label}
        </Text>
      )}
    </Pressable>
  );
}

export const Screen = (props: { children: React.ReactNode }) => (
  <View style={{ flex: 1, backgroundColor: '#C4DAD2', paddingHorizontal: 20, paddingTop: 60 }}>{props.children}</View>
);

export const Title = (props: { children: React.ReactNode }) => (
  <Text style={{ color: '#16423C', fontSize: 28, fontWeight: '800', marginBottom: 6 }}>{props.children}</Text>
);

export const Subtitle = (props: { children: React.ReactNode }) => (
  <Text style={{ color: '#16423C', fontSize: 15, opacity: 0.9, marginBottom: 16 }}>{props.children}</Text>
);
