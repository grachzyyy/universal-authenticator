import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import PrimaryButton from '../components/PrimaryButton';
import { authRequest } from '../services/api';
import { loadValue } from '../services/storage';
import { ScreenName } from '../../App';

type Props = {
  onNavigate: (screen: ScreenName) => void;
};

export default function DashboardScreen({ onNavigate }: Props) {
  const [email, setEmail] = useState('user@example.com');
  const [service, setService] = useState('github');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadValue('device_public_key').then(setFingerprint).catch(() => null);
  }, []);

  const onRequest = async () => {
    try {
      const response = await authRequest(email, service);
      setChallengeId(response.data.challengeId);
      setStatus('Challenge created. Use Approve screen to sign and approve.');
    } catch (error) {
      setStatus('Не удалось создать запрос.');
    }
  };

  return (
    <ScreenLayout title="Universal Authenticator" subtitle="Tap-to-approve auth, device management и правила доступа">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My device key</Text>
        <Text style={styles.cardText}>{fingerprint ?? 'Device not registered yet'}</Text>
      </View>
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor="#94a3b8" />
      <Text style={styles.label}>Service</Text>
      <TextInput style={styles.input} value={service} onChangeText={setService} placeholder="github" placeholderTextColor="#94a3b8" />
      <PrimaryButton title="Request Login" onPress={onRequest} />
      {challengeId ? (
        <View style={styles.cardSmall}>
          <Text style={styles.cardTitle}>Challenge ID</Text>
          <Text style={styles.cardText}>{challengeId}</Text>
        </View>
      ) : null}
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <View style={styles.buttonRow}>
        <PrimaryButton title="Devices" onPress={() => onNavigate('Devices')} />
        <PrimaryButton title="Rules" onPress={() => onNavigate('Rules')} />
      </View>
      <View style={styles.buttonRow}>
        <PrimaryButton title="Recovery" onPress={() => onNavigate('Recovery')} />
        <PrimaryButton title="Approve" onPress={() => onNavigate('Approve')} />
      </View>
      <PrimaryButton title="Settings" onPress={() => onNavigate('Settings')} outline />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#cbd5e1',
    marginTop: 12,
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
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardSmall: {
    backgroundColor: '#020617',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10
  },
  cardTitle: {
    color: '#60a5fa',
    fontWeight: '700',
    marginBottom: 4
  },
  cardText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20
  },
  status: {
    color: '#94a3b8',
    marginTop: 10
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
