import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  outline?: boolean;
};

export default function PrimaryButton({ title, onPress, disabled, outline }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        outline ? styles.outline : styles.primary,
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
    >
      <Text style={[styles.text, outline && styles.outlineText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: '#2563eb'
  },
  outline: {
    borderWidth: 1,
    borderColor: '#60a5fa',
    backgroundColor: 'transparent'
  },
  pressed: {
    opacity: 0.75
  },
  disabled: {
    opacity: 0.5
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  outlineText: {
    color: '#60a5fa'
  }
});
