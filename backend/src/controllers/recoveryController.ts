import { Router } from 'express';
import { getOrCreateUser, saveRecoveryBackup, getRecoveryBackup } from '../services/db';

const wordlist = [
  'apple', 'basic', 'cable', 'drive', 'eagle', 'flame', 'glass', 'honey', 'iris', 'jelly',
  'koala', 'laser', 'magic', 'nova', 'omega', 'pearl', 'quartz', 'rally', 'solar', 'tango',
  'ultra', 'vivid', 'whale', 'xenon', 'yacht', 'zebra'
];

function generateSeedPhrase(words = 12) {
  return Array.from({ length: words }, () => wordlist[Math.floor(Math.random() * wordlist.length)]).join(' ');
}

const router = Router();

router.post('/seed', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }
  const user = getOrCreateUser(email);
  const phrase = generateSeedPhrase(12);
  return res.json({ userId: user.id, seedPhrase: phrase });
});

router.post('/backup', (req, res) => {
  const { email, encrypted_backup } = req.body;
  if (!email || !encrypted_backup) {
    return res.status(400).json({ error: 'email and encrypted_backup required' });
  }
  const user = getOrCreateUser(email);
  const backup = saveRecoveryBackup({ userId: user.id, encryptedBackup: encrypted_backup });
  return res.json(backup);
});

router.post('/restore', (req, res) => {
  const { email, seed_phrase, password } = req.body;
  if (!email || (!seed_phrase && !password)) {
    return res.status(400).json({ error: 'email and seed_phrase or password required' });
  }
  const user = getOrCreateUser(email);
  const backup = getRecoveryBackup(user.id);
  if (!backup) {
    return res.status(404).json({ error: 'no backup found' });
  }
  return res.json({ restored: true, backup: backup.encryptedBackup });
});

export default router;
