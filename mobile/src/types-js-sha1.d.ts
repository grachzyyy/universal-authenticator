declare module 'js-sha1' {
  export function sha1(message: string | Uint8Array): string;
  export function arrayBuffer(message: string | Uint8Array): ArrayBuffer;
}
