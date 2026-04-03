import * as nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto';
import argon2 from 'argon2';

const AES_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function generateKeyPair() {
  const pair = nacl.sign.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: encodeBase64(pair.secretKey)
  };
}

export function signChallenge(secretKeyBase64: string, message: string) {
  const secretKey = decodeBase64(secretKeyBase64);
  const signed = nacl.sign(detachUtf8(message), secretKey);
  return encodeBase64(signed.slice(signed.length - nacl.sign.signatureLength));
}

export function verifySignature(publicKeyBase64: string, message: string, signatureBase64: string) {
  const publicKey = decodeBase64(publicKeyBase64);
  const signature = decodeBase64(signatureBase64);
  return nacl.sign.detached.verify(detachUtf8(message), signature, publicKey);
}

export async function deriveKey(password: string, salt: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    salt: Buffer.from(salt, 'base64'),
    hashLength: 32,
    raw: true
  });
}

export function deriveAesKey(password: string, salt: string) {
  return scryptSync(password, Buffer.from(salt, 'base64'), 32);
}

export function encryptAesGcm(plaintext: string, key: Buffer) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(AES_ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${ciphertext.toString('base64')}:${tag.toString('base64')}`;
}

export function decryptAesGcm(payload: string, key: Buffer) {
  const [ivB64, ciphertextB64, tagB64] = payload.split(':');
  if (!ivB64 || !ciphertextB64 || !tagB64) {
    throw new Error('Invalid encrypted payload');
  }
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = createDecipheriv(AES_ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
}

function detachUtf8(message: string) {
  return Buffer.from(message, 'utf8');
}
