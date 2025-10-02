import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getOnboardedFlag() {
  const v = await AsyncStorage.getItem('onboarded');
  return v === '1';
}
export async function setOnboardedFlag(v: boolean) {
  await AsyncStorage.setItem('onboarded', v ? '1' : '0');
}
