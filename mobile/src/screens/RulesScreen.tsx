import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import PrimaryButton from '../components/PrimaryButton';
import { createRule, createService, getRules, getServices } from '../services/api';
import { ScreenName } from '../../App';

type Props = {
  onNavigate: (screen: ScreenName) => void;
};

export default function RulesScreen({ onNavigate }: Props) {
  const [email, setEmail] = useState('user@example.com');
  const [serviceName, setServiceName] = useState('github');
  const [serviceId, setServiceId] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [ruleType, setRuleType] = useState('any');
  const [threshold, setThreshold] = useState('2');
  const [allowedDevices, setAllowedDevices] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await getServices(email);
      setServices(response.data);
    } catch {
      setMessage('Failed to load services');
    }
  };

  const selectService = async (id: string, name: string) => {
    setServiceId(id);
    setServiceName(name);
    try {
      const response = await getRules(id);
      setRules(response.data);
      setMessage('Rules loaded');
    } catch {
      setRules([]);
      setMessage('Failed to load rules');
    }
  };

  const createNewRule = async () => {
    try {
      let selectedServiceId = serviceId;
      if (!selectedServiceId) {
        const serviceResponse = await createService(email, serviceName);
        selectedServiceId = serviceResponse.data.id;
        setServiceId(selectedServiceId);
        loadServices();
      }
      const body = {
        type: ruleType,
        threshold: ruleType === 'threshold' ? Number(threshold) : undefined,
        allowed_devices: ruleType === 'selected' ? allowedDevices.split(',').map(id => id.trim()).filter(Boolean) : undefined
      };
      const response = await createRule(selectedServiceId, body);
      setRules(current => [...current, response.data]);
      setMessage('Rule created successfully');
    } catch {
      setMessage('Failed to create rule');
    }
  };

  return (
    <ScreenLayout title="Rules" subtitle="Configure authentication policies for each service.">
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor="#94a3b8" />
      <Text style={styles.label}>Service name</Text>
      <TextInput style={styles.input} value={serviceName} onChangeText={setServiceName} placeholder="github" placeholderTextColor="#94a3b8" />
      <PrimaryButton title="Load services" onPress={loadServices} outline />
      <View style={styles.serviceRow}>
        {services.map(item => (
          <PrimaryButton
            key={item.id}
            title={item.name}
            onPress={() => selectService(item.id, item.name)}
            outline={item.id !== serviceId}
          />
        ))}
      </View>
      <Text style={styles.label}>Rule type</Text>
      <View style={styles.row}>
        {['any', 'selected', 'threshold'].map(type => (
          <PrimaryButton key={type} title={type} onPress={() => setRuleType(type)} outline={ruleType !== type} />
        ))}
      </View>
      {ruleType === 'threshold' ? (
        <TextInput style={styles.input} value={threshold} onChangeText={setThreshold} keyboardType="numeric" placeholder="Threshold" placeholderTextColor="#94a3b8" />
      ) : null}
      {ruleType === 'selected' ? (
        <TextInput style={styles.input} value={allowedDevices} onChangeText={setAllowedDevices} placeholder="Allowed device IDs, comma-separated" placeholderTextColor="#94a3b8" />
      ) : null}
      <PrimaryButton title="Create rule" onPress={createNewRule} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Text style={styles.sectionTitle}>Current rules for {serviceName}</Text>
      <FlatList
        data={rules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.type.toUpperCase()}</Text>
            <Text style={styles.cardMeta}>{item.threshold ? `Threshold: ${item.threshold}` : item.allowedDevices ? `Allowed: ${item.allowedDevices.join(', ')}` : 'Any device'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No rules configured yet.</Text>}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  serviceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  sectionTitle: {
    color: '#cbd5e1',
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700'
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
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700'
  },
  cardMeta: {
    color: '#94a3b8',
    marginTop: 6
  },
  empty: {
    color: '#94a3b8',
    marginBottom: 20
  },
  message: {
    color: '#cbd5e1',
    marginTop: 12
  }
});
