import nacl from 'tweetnacl';
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

export function buildKeyPair() {
  const pair = nacl.sign.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: encodeBase64(pair.secretKey)
  };
}

export function signMessage(secretKeyBase64: string, message: string) {
  const secretKey = decodeBase64(secretKeyBase64);
  const signed = nacl.sign.detached(decodeUTF8(message), secretKey);
  return encodeBase64(signed);
}

export function verifyMessage(publicKeyBase64: string, message: string, signatureBase64: string) {
  const publicKey = decodeBase64(publicKeyBase64);
  const signature = decodeBase64(signatureBase64);
  return nacl.sign.detached.verify(decodeUTF8(message), signature, publicKey);
}

export function generateSeedPhrase(words = 12) {
  const tokens = 'apple basic cable drive eagle flame glass honey iris jelly koala laser magic nova omega pearl quartz rally solar tango ultra vivid whale xenon yacht zebra'.split(' ');
  return Array.from({ length: words }, () => tokens[Math.floor(Math.random() * tokens.length)]).join(' ');
}
