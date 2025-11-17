import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { ChoreAssignment } from '@/lib/graphql/types';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ChoreAssignmentItemProps {
  assignment: ChoreAssignment;
  onComplete: (assignmentId: string) => void;
  onDelete: (assignmentId: string) => void;
  isOwnAssignment: boolean;
}

export function ChoreAssignmentItem({
  assignment,
  onComplete,
  onDelete,
  isOwnAssignment,
}: ChoreAssignmentItemProps) {
  const handleComplete = () => {
    if (assignment.chore.requiresProof) {
      Alert.alert(
        'Proof Required',
        'This chore requires photo proof. Please upload a photo of completion.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload Photo',
            onPress: () => {
              // For now, just mark as complete without proof
              // In a real app, you'd open image picker here
              Alert.alert('Info', 'Photo upload feature coming soon. Marking as complete anyway.');
              onComplete(assignment.id);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Complete Chore',
        `Mark "${assignment.chore.title}" as complete?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            style: 'default',
            onPress: () => onComplete(assignment.id),
          },
        ]
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Assignment',
      `Remove this assignment of "${assignment.chore.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(assignment.id),
        },
      ]
    );
  };

  const dueDate = new Date(assignment.dueDate);
  const today = new Date();
  // Reset time components to compare just the dates
  today.setHours(0, 0, 0, 0);
  const dueDateOnly = new Date(dueDate);
  dueDateOnly.setHours(0, 0, 0, 0);
  
  const isOverdue = !assignment.isComplete && dueDateOnly < today;

  return (
    <View style={[styles.container, assignment.isComplete && styles.containerCompleted]}>
      <View style={styles.header}>
        <View style={styles.choreInfo}>
          {assignment.isComplete && (
            <View style={styles.completeBadge}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#FFC125" />
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                assignment.isComplete && styles.titleCompleted,
              ]}
            >
              {assignment.chore.title}
            </Text>
            {assignment.chore.description && (
              <Text style={styles.description} numberOfLines={1}>
                {assignment.chore.description}
              </Text>
            )}
          </View>
        </View>

        {!assignment.isComplete && isOwnAssignment && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton} activeOpacity={0.7}>
            <IconSymbol name="xmark.circle.fill" size={20} color="#CD853F" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.meta}>
        <View style={styles.assignee}>
          {assignment.user.avatarUrl ? (
            <Image source={{ uri: assignment.user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {assignment.user.fullName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.assigneeName}>{assignment.user.fullName || 'Unknown'}</Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <IconSymbol name="star.fill" size={12} color="#FFC125" />
            <Text style={styles.badgeText}>{assignment.chore.points} pts</Text>
          </View>
          <View style={[styles.badge, isOverdue && styles.badgeOverdue]}>
            <IconSymbol
              name={isOverdue ? 'exclamationmark.triangle.fill' : 'calendar'}
              size={12}
              color={isOverdue ? '#CD853F' : '#FFC125'}
            />
            <Text style={[styles.badgeText, isOverdue && styles.badgeTextOverdue]}>
              {isOverdue ? 'Overdue' : dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>

      {isOwnAssignment && !assignment.isComplete && (
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.8}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#000000" />
          <Text style={styles.completeButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}

      {assignment.isComplete && assignment.completedAt && (
        <View style={styles.completedInfo}>
          <IconSymbol name="checkmark.circle.fill" size={16} color="#FFC125" />
          <Text style={styles.completedText}>
            Completed{' '}
            {new Date(assignment.completedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      )}
    </View>
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
  containerCompleted: {
    backgroundColor: '#0A0A0A',
    opacity: 0.7,
    borderColor: 'rgba(255, 193, 37, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  choreInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  completeBadge: {
    marginTop: 2,
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
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8B8B8B',
  },
  description: {
    fontSize: 13,
    color: '#D4AF37',
    lineHeight: 18,
  },
  deleteButton: {
    padding: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC125',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFC125',
  },
  assigneeName: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
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
  badgeOverdue: {
    backgroundColor: 'rgba(205, 133, 63, 0.1)',
    borderColor: 'rgba(205, 133, 63, 0.4)',
  },
  badgeText: {
    fontSize: 12,
    color: '#FFC125',
    fontWeight: '600',
  },
  badgeTextOverdue: {
    color: '#CD853F',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC125',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 193, 37, 0.2)',
    marginTop: 4,
  },
  completedText: {
    fontSize: 14,
    color: '#FFC125',
    fontWeight: '600',
  },
});
