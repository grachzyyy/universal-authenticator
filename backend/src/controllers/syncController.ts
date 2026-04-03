import { Router } from 'express';
import { getOrCreateUser, saveSyncBlob, getSyncBlob } from '../services/db';

const router = Router();

router.post('/upload', (req, res) => {
  const { email, encrypted_blob, version } = req.body;
  if (!email || !encrypted_blob || typeof version !== 'number') {
    return res.status(400).json({ error: 'email, encrypted_blob and version are required' });
  }
  const user = getOrCreateUser(email);
  const blob = saveSyncBlob({ userId: user.id, encryptedBlob: encrypted_blob, version });
  return res.json(blob);
});

router.get('/download', (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email query required' });
  }
  const user = getOrCreateUser(email);
  const blob = getSyncBlob(user.id);
  if (!blob) {
    return res.status(404).json({ error: 'no sync blob found' });
  }
  return res.json(blob);
});

export default router;
