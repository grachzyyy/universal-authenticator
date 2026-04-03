import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import PrimaryButton from '../components/PrimaryButton';
import { listDevices, registerDevice } from '../services/api';
import { buildKeyPair } from '../services/crypto';
import { loadValue, saveValue } from '../services/storage';
import { ScreenName } from '../../App';

type Props = {
  onNavigate: (screen: ScreenName) => void;
};

export default function DevicesScreen({ onNavigate }: Props) {
  const [email, setEmail] = useState('user@example.com');
  const [name, setName] = useState('My iPhone');
  const [platform, setPlatform] = useState('ios');
  const [publicKey, setPublicKey] = useState('');
  const [devices, setDevices] = useState<any[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadValue('device_public_key').then(value => {
      if (value) setPublicKey(value);
    });
  }, []);

  const loadDevices = async () => {
    try {
      const response = await listDevices(email);
      setDevices(response.data);
      setStatus(`Loaded ${response.data.length} devices`);
    } catch (error) {
      setStatus('Не удалось загрузить устройства');
    }
  };

  const register = async () => {
    try {
      let key = await loadValue('device_public_key');
      let secret = await loadValue('device_secret_key');
      if (!key || !secret) {
        const pair = buildKeyPair();
        key = pair.publicKey;
        secret = pair.secretKey;
        await saveValue('device_public_key', key);
        await saveValue('device_secret_key', secret);
        setPublicKey(key);
      }
      const response = await registerDevice(email, key, name, platform);
      setDevices(current => [...current, response.data]);
      setStatus('Device registered');
    } catch (error) {
      setStatus('Registration failed');
    }
  };

  return (
    <ScreenLayout title="Devices" subtitle="Register and manage your trusted hardware.">
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor="#94a3b8" />
      <Text style={styles.label}>Device name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="My iPhone" placeholderTextColor="#94a3b8" />
      <Text style={styles.label}>Platform</Text>
      <TextInput style={styles.input} value={platform} onChangeText={setPlatform} placeholder="ios" placeholderTextColor="#94a3b8" />
      <PrimaryButton title="Register Device" onPress={register} />
      <PrimaryButton title="Load Devices" onPress={loadDevices} outline />
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.platform}</Text>
            <Text style={styles.cardText}>{item.publicKey}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Devices not found. Register your first device.</Text>}
      />
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
  list: {
    marginTop: 12
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc'
  },
  cardMeta: {
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 6
  },
  cardText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18
  },
  empty: {
    marginTop: 24,
    color: '#94a3b8'
  },
  status: {
    color: '#94a3b8',
    marginVertical: 10
  }
});
