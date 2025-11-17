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
  none: 'calendar',
  daily: 'sun.max.fill',
  weekly: 'calendar.badge.clock',
  monthly: 'calendar',
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
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onAssign(chore)}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{chore.title}</Text>
            {chore.description && (
              <Text style={styles.description} numberOfLines={1}>
                {chore.description}
              </Text>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onAssign(chore);
              }}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <IconSymbol name="person.badge.plus" size={18} color="#FFC125" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onEdit(chore);
              }}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <IconSymbol name="pencil" size={18} color="#FFC125" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <IconSymbol name="trash" size={18} color="#CD853F" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <IconSymbol
                name={RECURRENCE_ICONS[chore.recurrence] as any}
                size={14}
                color="#FFC125"
              />
              <Text style={styles.badgeText}>
                {RECURRENCE_LABELS[chore.recurrence]}
              </Text>
            </View>
            <View style={styles.badge}>
              <IconSymbol name="star.fill" size={14} color="#FFC125" />
              <Text style={styles.badgeText}>{chore.points} pts</Text>
            </View>
            {chore.requiresProof && (
              <View style={styles.badge}>
                <IconSymbol name="camera.fill" size={14} color="#FFC125" />
                <Text style={styles.badgeText}>Proof</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#FFC125',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFC125',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#D4AF37',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 37, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.2)',
  },
  footer: {
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 193, 37, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 37, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    color: '#FFC125',
    fontWeight: '600',
  },
});
