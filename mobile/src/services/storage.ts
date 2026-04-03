import * as SecureStore from 'expo-secure-store';

export async function saveValue(key: string, value: string) {
  await SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
}

export async function loadValue(key: string) {
  return SecureStore.getItemAsync(key);
}

export async function deleteValue(key: string) {
  await SecureStore.deleteItemAsync(key);
}
