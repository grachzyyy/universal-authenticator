import axios from 'axios';

const backend = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const authRequest = (email: string, service: string) =>
  backend.post('/auth/request', { email, service });

export const authApprove = (challenge_id: string, device_id: string, signature: string) =>
  backend.post('/auth/approve', { challenge_id, device_id, signature });

export const registerDevice = (email: string, public_key: string, name: string, platform: string) =>
  backend.post('/devices/register', { email, public_key, name, platform });

export const listDevices = (email: string) =>
  backend.get('/devices', { params: { email } });

export const deleteDevice = (deviceId: string) =>
  backend.delete(`/devices/${deviceId}`);

export const getServices = (email: string) =>
  backend.get('/devices/services', { params: { email } });

export const createService = (email: string, name: string) =>
  backend.post('/devices/services', { email, name });

export const getRules = (serviceId: string) =>
  backend.get(`/devices/services/${serviceId}/rules`);

export const createRule = (serviceId: string, body: { type: string; threshold?: number; allowed_devices?: string[] }) =>
  backend.post(`/devices/services/${serviceId}/rules`, body);

export const deleteRule = (ruleId: string) =>
  backend.delete(`/devices/rules/${ruleId}`);

export const uploadSync = (email: string, encrypted_blob: string, version: number) =>
  backend.post('/sync/upload', { email, encrypted_blob, version });

export const downloadSync = (email: string) =>
  backend.get('/sync/download', { params: { email } });

export const requestSeed = (email: string) =>
  backend.post('/recovery/seed', { email });

export const backupRecovery = (email: string, encrypted_backup: string) =>
  backend.post('/recovery/backup', { email, encrypted_backup });

export const restoreRecovery = (email: string, seed_phrase?: string, password?: string) =>
  backend.post('/recovery/restore', { email, seed_phrase, password });
