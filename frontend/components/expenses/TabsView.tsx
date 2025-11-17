import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface TabsViewProps {
  viewMode: 'owe' | 'owed';
  oweCount: number;
  owedCount: number;
  onViewModeChange: (mode: 'owe' | 'owed') => void;
}

export default function TabsView({ viewMode, oweCount, owedCount, onViewModeChange }: TabsViewProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, viewMode === 'owe' && styles.tabActive]}
        onPress={() => onViewModeChange('owe')}
      >
        <ThemedText style={[styles.tabText, viewMode === 'owe' && styles.tabTextActive]}>
          I Owe ({oweCount})
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, viewMode === 'owed' && styles.tabActive]}
        onPress={() => onViewModeChange('owed')}
      >
        <ThemedText style={[styles.tabText, viewMode === 'owed' && styles.tabTextActive]}>
          Owed to Me ({owedCount})
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FFC125',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFC125',
  },
});
