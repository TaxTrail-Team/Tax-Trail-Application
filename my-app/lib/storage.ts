// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setItem(key: string, value: any) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getItem<T = any>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) as T : null;
}

export async function removeItem(key: string) {
  await AsyncStorage.removeItem(key);
}
