import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import DashboardScreen from './src/screens/DashboardScreen';
import ApproveScreen from './src/screens/ApproveScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import RulesScreen from './src/screens/RulesScreen';
import RecoveryScreen from './src/screens/RecoveryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type ScreenName = 'Dashboard' | 'Approve' | 'Devices' | 'Rules' | 'Recovery' | 'Settings';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('Dashboard');

  const renderScreen = () => {
    switch (screen) {
      case 'Approve':
        return <ApproveScreen onNavigate={setScreen} />;
      case 'Devices':
        return <DevicesScreen onNavigate={setScreen} />;
      case 'Rules':
        return <RulesScreen onNavigate={setScreen} />;
      case 'Recovery':
        return <RecoveryScreen onNavigate={setScreen} />;
      case 'Settings':
        return <SettingsScreen onNavigate={setScreen} />;
      case 'Dashboard':
      default:
        return <DashboardScreen onNavigate={setScreen} />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="auto" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a'
  }
});
