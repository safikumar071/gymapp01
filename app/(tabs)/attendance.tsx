import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { getAttendanceWithMemberNames } from '../../src/services/attendance.service';
import { useAuthStore } from '../../src/store/useAuthStore';
import { MOCK_ATTENDANCE, MOCK_MEMBERS } from '../../src/utils/mockData';
import { colors, spacing, typography, shadows } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';
import { Attendance } from '../../src/types';
import { Camera } from 'lucide-react-native';

type AttendanceWithName = Attendance & { member_name: string };

export default function AttendanceScreen() {
  const user = useAuthStore((s) => s.user);
  const [attendance, setAttendance] = useState<AttendanceWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const memberMap = new Map(MOCK_MEMBERS.map((m) => [m.id, m.name]));

  async function loadAttendance() {
    setLoading(true);
    try {
      const gymId = user?.gym_id || 'gym_mock';
      const { data } = await getAttendanceWithMemberNames(gymId, 50, 0);
      if (data) {
        setAttendance(data);
      } else {
        const enriched = MOCK_ATTENDANCE.map((a) => ({
          ...a,
          member_name: memberMap.get(a.member_id) || 'Unknown Member',
        }));
        setAttendance(enriched);
      }
    } catch (err) {
      const enriched = MOCK_ATTENDANCE.map((a) => ({
        ...a,
        member_name: memberMap.get(a.member_id) || 'Unknown Member',
      }));
      setAttendance(enriched);
    } finally {
      setLoading(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadAttendance().then(() => setRefreshing(false));
  }

  useEffect(() => {
    loadAttendance();
  }, [user]);

  function getTimeSinceCheckIn(checkinAt: string): string {
    const now = new Date();
    const checkInTime = new Date(checkinAt);
    const diffMs = now.getTime() - checkInTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  function renderAttendanceItem({ item }: { item: AttendanceWithName }) {
    const time = new Date(item.checkin_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const timeSince = getTimeSinceCheckIn(item.checkin_at);
    const isQR = item.checkin_type === 'qr';

    return (
      <View style={styles.attendanceCard}>
        <View style={styles.cardContent}>
          <View style={styles.checkInIcon}>
            <View
              style={[
                styles.iconCircle,
                isQR && styles.iconQR,
                !isQR && styles.iconManual,
              ]}
            >
              <Text style={styles.iconText}>{isQR ? '⚡' : '✋'}</Text>
            </View>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.member_name}</Text>
            <View style={styles.timeRow}>
              <Text style={styles.time}>{time}</Text>
              <Text style={styles.timeSince}>{timeSince}</Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.typeBadge,
                isQR && styles.typeBadgeQR,
                !isQR && styles.typeBadgeManual,
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {isQR ? 'QR' : 'Manual'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const todayCount = attendance.filter((a) => {
    const date = new Date(a.checkin_at);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.subtitle}>Today: {todayCount} check-ins</Text>
        </View>
        <Button
          title="Scan QR"
          onPress={() => {
            alert('QR scanner coming soon');
          }}
        />
      </View>

      <FlatList
        data={attendance}
        keyExtractor={(item) => item.id}
        renderItem={renderAttendanceItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No check-ins yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    ...shadows.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  attendanceCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 12,
    ...shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  checkInIcon: {
    marginRight: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconQR: {
    backgroundColor: '#dbeafe',
  },
  iconManual: {
    backgroundColor: '#fef3c7',
  },
  iconText: {
    fontSize: 20,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  time: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  timeSince: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    fontStyle: 'italic',
  },
  badgeContainer: {
    marginLeft: spacing.md,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  typeBadgeQR: {
    backgroundColor: '#dbeafe',
  },
  typeBadgeManual: {
    backgroundColor: '#fef3c7',
  },
  typeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
});
