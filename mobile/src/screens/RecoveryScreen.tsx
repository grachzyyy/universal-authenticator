import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import PrimaryButton from '../components/PrimaryButton';
import { backupRecovery, requestSeed, restoreRecovery } from '../services/api';
import { ScreenName } from '../../App';

type Props = {
  onNavigate: (screen: ScreenName) => void;
};

export default function RecoveryScreen({ onNavigate }: Props) {
  const [email, setEmail] = useState('user@example.com');
  const [seed, setSeed] = useState('');
  const [backup, setBackup] = useState('');
  const [message, setMessage] = useState('');

  const createSeed = async () => {
    try {
      const response = await requestSeed(email);
      setSeed(response.data.seedPhrase);
      setMessage('Seed phrase generated on server. Save it securely.');
    } catch (error) {
      setMessage('Failed to generate seed phrase.');
    }
  };

  const saveBackup = async () => {
    if (!seed) {
      setMessage('Generate or enter a seed first.');
      return;
    }
    try {
      const response = await backupRecovery(email, seed);
      setBackup(response.data.encryptedBackup);
      setMessage('Encrypted backup registered.');
    } catch (error) {
      setMessage('Backup failed.');
    }
  };

  const restore = async () => {
    try {
      const response = await restoreRecovery(email, seed, 'password123');
      setMessage('Restore response: ' + JSON.stringify(response.data));
    } catch (error) {
      setMessage('Restore failed.');
    }
  };

  return (
    <ScreenLayout title="Recovery" subtitle="Seed phrase и backup для восстановления доступа.">
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor="#94a3b8" />
      <Text style={styles.label}>Seed phrase</Text>
      <TextInput style={[styles.input, styles.multiline]} value={seed} onChangeText={setSeed} placeholder="Seed phrase" placeholderTextColor="#94a3b8" multiline />
      <PrimaryButton title="Generate seed phrase" onPress={createSeed} />
      <PrimaryButton title="Store encrypted backup" onPress={saveBackup} outline />
      {backup ? <Text style={styles.value}>Backup stored</Text> : null}
      <PrimaryButton title="Restore from seed" onPress={restore} />
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton title="Back" onPress={() => onNavigate('Dashboard')} outline />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#cbd5e1',
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#020617',
    color: '#f8fafc'
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  value: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#020617',
    color: '#f8fafc'
  },
  message: {
    marginTop: 14,
    color: '#94a3b8'
  }
});
