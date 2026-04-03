import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  User,
  Device,
  Service,
  Rule,
  Challenge,
  Approval,
  SyncBlob,
  RecoveryBackup,
  PairSession
} from '../models/types';

const DATA_PATH = path.resolve(__dirname, '../../data.json');

interface DBSchema {
  users: User[];
  devices: Device[];
  services: Service[];
  rules: Rule[];
  challenges: Challenge[];
  approvals: Approval[];
  syncBlobs: SyncBlob[];
  recoveryBackups: RecoveryBackup[];
  pairSessions: PairSession[];
}

const defaultData: DBSchema = {
  users: [],
  devices: [],
  services: [],
  rules: [],
  challenges: [],
  approvals: [],
  syncBlobs: [],
  recoveryBackups: [],
  pairSessions: []
};

let state: DBSchema = defaultData;

function persist() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function load() {
  if (fs.existsSync(DATA_PATH)) {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    state = JSON.parse(raw) as DBSchema;
  } else {
    persist();
  }
}

load();

export function createUser(email: string): User {
  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    email,
    createdAt: now
  };
  state.users.push(user);
  persist();
  return user;
}

export function findUserByEmail(email: string) {
  return state.users.find(user => user.email === email);
}

export function getOrCreateUser(email: string) {
  const existing = findUserByEmail(email);
  return existing ?? createUser(email);
}

export function saveDevice(device: Omit<Device, 'id' | 'registeredAt' | 'lastSeen'>) {
  const now = new Date().toISOString();
  const entity: Device = {
    id: randomUUID(),
    ...device,
    trusted: true,
    registeredAt: now,
    lastSeen: now
  };
  state.devices.push(entity);
  persist();
  return entity;
}

export function listDevices(userId: string) {
  return state.devices.filter(device => device.userId === userId);
}

export function findDeviceById(id: string) {
  return state.devices.find(device => device.id === id);
}

export function updateDevice(id: string, patch: Partial<Device>) {
  const device = findDeviceById(id);
  if (!device) return null;
  Object.assign(device, patch);
  device.lastSeen = new Date().toISOString();
  persist();
  return device;
}

export function removeDevice(id: string) {
  state.devices = state.devices.filter(device => device.id !== id);
  persist();
}

export function saveService(service: Omit<Service, 'id' | 'createdAt'>) {
  const now = new Date().toISOString();
  const entity: Service = {
    id: randomUUID(),
    ...service,
    createdAt: now
  };
  state.services.push(entity);
  persist();
  return entity;
}

export function findService(userId: string, name: string) {
  return state.services.find(service => service.userId === userId && service.name === name);
}

export function getServiceById(id: string) {
  return state.services.find(service => service.id === id);
}

export function listServices(userId: string) {
  return state.services.filter(service => service.userId === userId);
}

export function saveRule(rule: Omit<Rule, 'id' | 'createdAt'>) {
  const now = new Date().toISOString();
  const entity: Rule = {
    id: randomUUID(),
    ...rule,
    createdAt: now
  };
  state.rules.push(entity);
  persist();
  return entity;
}

export function listRules(serviceId: string) {
  return state.rules.filter(rule => rule.serviceId === serviceId);
}

export function getRuleById(id: string) {
  return state.rules.find(rule => rule.id === id);
}

export function updateRule(id: string, patch: Partial<Rule>) {
  const rule = getRuleById(id);
  if (!rule) return null;
  Object.assign(rule, patch);
  persist();
  return rule;
}

export function removeRule(id: string) {
  state.rules = state.rules.filter(rule => rule.id !== id);
  persist();
}

export function saveChallenge(challenge: Omit<Challenge, 'id'>) {
  const entity: Challenge = {
    id: randomUUID(),
    ...challenge
  };
  state.challenges.push(entity);
  persist();
  return entity;
}

export function getChallengeById(id: string) {
  return state.challenges.find(challenge => challenge.id === id);
}

export function updateChallenge(id: string, patch: Partial<Challenge>) {
  const challenge = getChallengeById(id);
  if (!challenge) return null;
  Object.assign(challenge, patch);
  persist();
  return challenge;
}

export function saveApproval(approval: Omit<Approval, 'id' | 'createdAt'>) {
  const now = new Date().toISOString();
  const entity: Approval = {
    id: randomUUID(),
    createdAt: now,
    ...approval
  };
  state.approvals.push(entity);
  persist();
  return entity;
}

export function listApprovals(challengeId: string) {
  return state.approvals.filter(a => a.challengeId === challengeId);
}

export function saveSyncBlob(blob: Omit<SyncBlob, 'id' | 'updatedAt'>) {
  const existing = state.syncBlobs.find(item => item.userId === blob.userId);
  const now = new Date().toISOString();
  if (existing) {
    existing.encryptedBlob = blob.encryptedBlob;
    existing.version = blob.version;
    existing.updatedAt = now;
    persist();
    return existing;
  }
  const entity: SyncBlob = {
    id: randomUUID(),
    ...blob,
    updatedAt: now
  };
  state.syncBlobs.push(entity);
  persist();
  return entity;
}

export function getSyncBlob(userId: string) {
  return state.syncBlobs.find(blob => blob.userId === userId);
}

export function saveRecoveryBackup(backup: Omit<RecoveryBackup, 'id' | 'createdAt'>) {
  const now = new Date().toISOString();
  const entity: RecoveryBackup = {
    id: randomUUID(),
    ...backup,
    createdAt: now
  };
  state.recoveryBackups.push(entity);
  persist();
  return entity;
}

export function getRecoveryBackup(userId: string) {
  return state.recoveryBackups.find(item => item.userId === userId);
}

export function savePairSession(session: Omit<PairSession, 'sessionId' | 'createdAt'>) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const entity: PairSession = {
    sessionId: id,
    createdAt: now,
    ...session
  };
  state.pairSessions.push(entity);
  persist();
  return entity;
}

export function getPairSession(sessionId: string) {
  return state.pairSessions.find(session => session.sessionId === sessionId);
}

export function removePairSession(sessionId: string) {
  state.pairSessions = state.pairSessions.filter(session => session.sessionId !== sessionId);
  persist();
}
