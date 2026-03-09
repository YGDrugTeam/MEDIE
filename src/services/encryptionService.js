// services/encryptionService.js
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

const SECURE_KEY_NAME = 'MY_PILL_AES_KEY';

export const getOrCreateAESKey = async () => {
  let key = await SecureStore.getItemAsync(SECURE_KEY_NAME);
  if (!key) {
    key = CryptoJS.lib.WordArray.random(32).toString();
    await SecureStore.setItemAsync(SECURE_KEY_NAME, key);
  }
  return key;
};

export const encryptData = async (data) => {
  const key = await getOrCreateAESKey();
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    key
  ).toString();
};

export const decryptData = async (cipher) => {
  const key = await getOrCreateAESKey();
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};