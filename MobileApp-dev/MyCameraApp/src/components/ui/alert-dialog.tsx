import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

// 1. 기본 스타일 정의 (Medical Theme)
const Colors = {
  background: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',
  border: '#e2e8f0',
  primary: '#1d7edb',
  text: '#0f172a',
  muted: '#64748b',
};

// 2. AlertDialog Root (모달의 상태 제어)
export const AlertDialog = ({ children, open, onOpenChange }: any) => {
  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

// 3. Header, Title, Description
export const AlertDialogHeader = ({ children }: any) => <View style={styles.header}>{children}</View>;

export const AlertDialogTitle = ({ children }: any) => (
  <Text style={styles.title}>{children}</Text>
);

export const AlertDialogDescription = ({ children }: any) => (
  <Text style={styles.description}>{children}</Text>
);

// 4. Footer & Actions
export const AlertDialogFooter = ({ children }: any) => <View style={styles.footer}>{children}</View>;

export const AlertDialogAction = ({ children, onPress }: any) => (
  <TouchableOpacity style={[styles.button, styles.actionButton]} onPress={onPress}>
    <Text style={styles.actionText}>{children}</Text>
  </TouchableOpacity>
);

export const AlertDialogCancel = ({ children, onPress }: any) => (
  <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onPress}>
    <Text style={styles.cancelText}>{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelText: {
    color: Colors.text,
    fontWeight: '500',
  },
});