import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import PrimaryButton from '../components/PrimaryButton';
import { downloadSync, uploadSync } from '../services/api';
import { ScreenName } from '../../App';

type Props = {
  onNavigate: (screen: ScreenName) => void;
};

export default function SettingsScreen({ onNavigate }: Props) {
  const [email, setEmail] = useState('user@example.com');
  const [syncStatus, setSyncStatus] = useState('');

  const upload = async () => {
    try {
      const response = await uploadSync(email, 'encrypted-sync-placeholder', 1);
      setSyncStatus(`Uploaded version ${response.data.version}`);
    } catch {
      setSyncStatus('Upload failed');
    }
  };

  const download = async () => {
    try {
      const response = await downloadSync(email);
      setSyncStatus(`Downloaded blob: ${response.data.encryptedBlob}`);
    } catch {
      setSyncStatus('Download failed');
    }
  };

  return (
    <ScreenLayout title="Settings" subtitle="Sync, recovery и app configuration.">
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor="#94a3b8" />
      <PrimaryButton title="Upload Sync" onPress={upload} />
      <PrimaryButton title="Download Sync" onPress={download} outline />
      {syncStatus ? <Text style={styles.message}>{syncStatus}</Text> : null}
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
  message: {
    marginTop: 12,
    color: '#94a3b8'
  }
});
