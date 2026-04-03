import { Router } from 'express';
import { randomBytes } from 'crypto';
import {
  getOrCreateUser,
  findService,
  saveService,
  saveChallenge,
  getChallengeById,
  saveApproval,
  listRules,
  listApprovals,
  updateChallenge,
  findDeviceById
} from '../services/db';
import { verifySignature } from '../services/crypto';

const router = Router();

function generateChallengeText() {
  return randomBytes(24).toString('base64url');
}

function evaluateRules(serviceId: string, deviceId: string, challengeId: string) {
  const rules = listRules(serviceId);
  if (rules.length === 0) {
    return { pass: true, reason: 'default any-device rule' };
  }

  const rule = rules[0];
  if (rule.type === 'any') {
    return { pass: true, reason: 'any device allowed' };
  }

  if (rule.type === 'selected') {
    const allowed = rule.allowedDevices?.includes(deviceId) ?? false;
    return { pass: allowed, reason: allowed ? 'selected device approved' : 'selected device denied' };
  }

  if (rule.type === 'threshold') {
    const approvals = listApprovals(challengeId).filter(a => a.approved);
    const count = approvals.length;
    const threshold = rule.threshold ?? 1;
    return {
      pass: count >= threshold,
      reason: `threshold rule ${count}/${threshold}`
    };
  }

  return { pass: true, reason: 'default allow' };
}

router.post('/request', (req, res) => {
  const { email, service } = req.body;
  if (!email || !service) {
    return res.status(400).json({ error: 'email and service are required' });
  }
  const user = getOrCreateUser(email);
  let serviceEntity = findService(user.id, service);
  if (!serviceEntity) {
    serviceEntity = saveService({ userId: user.id, name: service });
  }
  const challengeText = generateChallengeText();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
  const challenge = saveChallenge({
    userId: user.id,
    serviceId: serviceEntity.id,
    challenge: challengeText,
    expiresAt,
    status: 'pending'
  });
  console.log(`PUSH: login request for ${email} service=${service} challenge=${challengeText}`);
  return res.json({ challengeId: challenge.id, expiresAt, service: serviceEntity.name });
});

router.post('/approve', (req, res) => {
  const { challenge_id, device_id, signature } = req.body;
  if (!challenge_id || !device_id || !signature) {
    return res.status(400).json({ error: 'challenge_id, device_id, signature required' });
  }
  const challenge = getChallengeById(challenge_id);
  if (!challenge) {
    return res.status(404).json({ error: 'challenge not found' });
  }
  if (challenge.status !== 'pending') {
    return res.status(400).json({ error: 'challenge is not pending' });
  }
  if (new Date(challenge.expiresAt) < new Date()) {
    updateChallenge(challenge.id, { status: 'expired' });
    return res.status(400).json({ error: 'challenge expired' });
  }
  const device = findDeviceById(device_id);
  if (!device) {
    return res.status(404).json({ error: 'device not found' });
  }
  const valid = verifySignature(device.publicKey, challenge.challenge, signature);
  if (!valid) {
    saveApproval({ challengeId: challenge.id, deviceId: device.id, signature, approved: false });
    return res.status(403).json({ error: 'invalid signature' });
  }
  saveApproval({ challengeId: challenge.id, deviceId: device.id, signature, approved: true });
  const result = evaluateRules(challenge.serviceId, device.id, challenge.id);
  updateChallenge(challenge.id, { status: result.pass ? 'approved' : 'denied' });
  return res.json({ status: result.pass ? 'approved' : 'denied', detail: result.reason });
});

router.get('/challenge/:id', (req, res) => {
  const challenge = getChallengeById(req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'challenge not found' });
  }
  return res.json(challenge);
});

export default router;
