import React, { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function ScreenLayout({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 10
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800'
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20
  }
});
