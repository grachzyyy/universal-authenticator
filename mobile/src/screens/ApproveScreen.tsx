import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import PrimaryButton from '../components/PrimaryButton';
import { authApprove, authRequest } from '../services/api';
import { loadValue } from '../services/storage';
import { signMessage } from '../services/crypto';
import { ScreenName } from '../../App';

type Props = {
  onNavigate: (screen: ScreenName) => void;
};

export default function ApproveScreen({ onNavigate }: Props) {
  const [email, setEmail] = useState('user@example.com');
  const [service, setService] = useState('github');
  const [challengeId, setChallengeId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [signature, setSignature] = useState('');
  const [secret, setSecret] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    loadValue('device_secret_key').then(setSecret).catch(() => null);
  }, []);

  const requestChallenge = async () => {
    try {
      const response = await authRequest(email, service);
      setChallengeId(response.data.challengeId);
      setResult('Challenge requested. Sign and approve it.');
    } catch (error) {
      setResult('Failed to request challenge.');
    }
  };

  const signChallenge = async () => {
    if (!secret || !challengeId) {
      setResult('No secret key or challenge available');
      return;
    }
    const sig = signMessage(secret, challengeId);
    setSignature(sig);
    setResult('Challenge signed. Ready to approve.');
  };

  const approve = async () => {
    if (!challengeId || !deviceId || !signature) {
      setResult('Please fill challenge, device ID and signature.');
      return;
    }
    try {
      const response = await authApprove(challengeId, deviceId, signature);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('Approval failed.');
    }
  };

  return (
    <ScreenLayout title="Approve" subtitle="Sign login requests with your registered device.">
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor="#94a3b8" />
      <Text style={styles.label}>Service</Text>
      <TextInput style={styles.input} value={service} onChangeText={setService} placeholder="github" placeholderTextColor="#94a3b8" />
      <PrimaryButton title="Request Challenge" onPress={requestChallenge} />
      <Text style={styles.label}>Challenge ID</Text>
      <TextInput style={styles.input} value={challengeId} onChangeText={setChallengeId} placeholder="challenge id" placeholderTextColor="#94a3b8" />
      <PrimaryButton title="Sign Challenge" onPress={signChallenge} outline />
      <Text style={styles.label}>Device ID</Text>
      <TextInput style={styles.input} value={deviceId} onChangeText={setDeviceId} placeholder="device id" placeholderTextColor="#94a3b8" />
      <Text style={styles.label}>Signature</Text>
      <TextInput style={[styles.input, styles.multiline]} value={signature} onChangeText={setSignature} placeholder="signature" placeholderTextColor="#94a3b8" multiline />
      <PrimaryButton title="Approve" onPress={approve} />
      <Text style={styles.result}>{result}</Text>
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
    minHeight: 100,
    textAlignVertical: 'top'
  },
  result: {
    marginTop: 16,
    color: '#94a3b8'
  }
});
