import { sha1 } from 'js-sha1';

function leftPad(value: string, length: number) {
  return value.padStart(length, '0');
}

export function generateTotp(secret: string, digits = 6, period = 30) {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / period);
  const hash = sha1(`${secret}:${counter}`);
  const code = parseInt(hash.slice(-6), 16) % 10 ** digits;
  return leftPad(String(code), digits);
}
