import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Chore } from '@/lib/graphql/types';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ChoreListItemProps {
  chore: Chore;
  onEdit: (chore: Chore) => void;
  onDelete: (choreId: string) => void;
  onAssign: (chore: Chore) => void;
}

const RECURRENCE_ICONS: Record<string, string> = {
  none: '📅',
  daily: '🌅',
  weekly: '📆',
  monthly: '🗓️',
};

const RECURRENCE_LABELS: Record<string, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function ChoreListItem({ chore, onEdit, onDelete, onAssign }: ChoreListItemProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Chore',
      `Are you sure you want to delete "${chore.title}"? This will also delete all assignments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(chore.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{chore.title}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onAssign(chore)} style={styles.actionButton}>
              <IconSymbol name="person.badge.plus" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onEdit(chore)} style={styles.actionButton}>
              <IconSymbol name="pencil" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <IconSymbol name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {chore.description && (
          <Text style={styles.description} numberOfLines={2}>
            {chore.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {RECURRENCE_ICONS[chore.recurrence]} {RECURRENCE_LABELS[chore.recurrence]}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ {chore.points} pts</Text>
            </View>
            {chore.requiresProof && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📸 Proof required</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
