import { Router } from 'express';
import {
  getOrCreateUser,
  saveDevice,
  listDevices,
  findDeviceById,
  updateDevice,
  removeDevice,
  saveRule,
  listRules,
  getRuleById,
  updateRule,
  removeRule,
  getServiceById,
  findService,
  listServices,
  saveService,
  savePairSession,
  getPairSession,
  removePairSession
} from '../services/db';

const router = Router();

router.post('/register', (req, res) => {
  const { email, public_key, name, platform } = req.body;
  if (!email || !public_key || !name || !platform) {
    return res.status(400).json({ error: 'email, public_key, name and platform required' });
  }
  const user = getOrCreateUser(email);
  const device = saveDevice({
    userId: user.id,
    publicKey: public_key,
    name,
    platform,
    trusted: true
  });
  return res.status(201).json(device);
});

router.get('/', (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email query is required' });
  }
  const user = getOrCreateUser(email);
  const devices = listDevices(user.id);
  return res.json(devices);
});

router.get('/services', (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email query is required' });
  }
  const user = getOrCreateUser(email);
  return res.json(listServices(user.id));
});

router.post('/services', (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'email and name are required' });
  }
  const user = getOrCreateUser(email);
  const service = findService(user.id, name) || saveService({ userId: user.id, name });
  return res.status(201).json(service);
});

router.patch('/:id', (req, res) => {
  const updated = updateDevice(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'device not found' });
  }
  return res.json(updated);
});

router.delete('/:id', (req, res) => {
  const existing = findDeviceById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'device not found' });
  }
  removeDevice(req.params.id);
  return res.status(204).send();
});

router.get('/services/:serviceId/rules', (req, res) => {
  const service = getServiceById(req.params.serviceId);
  if (!service) {
    return res.status(404).json({ error: 'service not found' });
  }
  return res.json(listRules(service.id));
});

router.post('/services/:serviceId/rules', (req, res) => {
  const service = getServiceById(req.params.serviceId);
  if (!service) {
    return res.status(404).json({ error: 'service not found' });
  }
  const { type, threshold, allowed_devices } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'rule type is required' });
  }
  const rule = saveRule({
    serviceId: service.id,
    type,
    threshold,
    allowedDevices: allowed_devices,
  });
  return res.status(201).json(rule);
});

router.patch('/rules/:id', (req, res) => {
  const updated = updateRule(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'rule not found' });
  }
  return res.json(updated);
});

router.delete('/rules/:id', (req, res) => {
  const rule = getRuleById(req.params.id);
  if (!rule) {
    return res.status(404).json({ error: 'rule not found' });
  }
  removeRule(req.params.id);
  return res.status(204).send();
});

router.post('/handshake/init', (req, res) => {
  const { email, device_public_key } = req.body;
  if (!email || !device_public_key) {
    return res.status(400).json({ error: 'email and device_public_key are required' });
  }
  const user = getOrCreateUser(email);
  const session = savePairSession({ userId: user.id, devicePublicKey: device_public_key });
  return res.json({ session_id: session.sessionId, device_public_key });
});

router.post('/handshake/complete', (req, res) => {
  const { email, session_id, encrypted_master_key, name, platform, public_key } = req.body;
  if (!email || !session_id || !encrypted_master_key) {
    return res.status(400).json({ error: 'email, session_id, encrypted_master_key required' });
  }
  const user = getOrCreateUser(email);
  const session = getPairSession(session_id);
  if (!session || session.userId !== user.id) {
    return res.status(404).json({ error: 'session not found' });
  }
  if (!name || !platform || !public_key) {
    return res.status(400).json({ error: 'name, platform and public_key required to complete onboarding' });
  }
  saveDevice({
    userId: user.id,
    publicKey: public_key,
    name,
    platform,
    trusted: true
  });
  removePairSession(session_id);
  return res.json({ restored: true, encrypted_master_key });
});

export default router;
