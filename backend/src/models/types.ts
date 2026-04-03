export type RuleType = 'any' | 'selected' | 'threshold';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  publicKey: string;
  name: string;
  platform: string;
  trusted: boolean;
  lastSeen?: string;
  registeredAt: string;
}

export interface Service {
  id: string;
  userId: string;
  name: string;
  encryptedMetadata?: string;
  createdAt: string;
}

export interface Rule {
  id: string;
  serviceId: string;
  type: RuleType;
  threshold?: number;
  allowedDevices?: string[];
  createdAt: string;
}

export interface Challenge {
  id: string;
  userId: string;
  serviceId: string;
  challenge: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
}

export interface Approval {
  id: string;
  challengeId: string;
  deviceId: string;
  signature: string;
  approved: boolean;
  createdAt: string;
}

export interface SyncBlob {
  id: string;
  userId: string;
  encryptedBlob: string;
  version: number;
  updatedAt: string;
}

export interface RecoveryBackup {
  id: string;
  userId: string;
  encryptedBackup: string;
  createdAt: string;
}

export interface PairSession {
  sessionId: string;
  userId: string;
  devicePublicKey: string;
  createdAt: string;
}
