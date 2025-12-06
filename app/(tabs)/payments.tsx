import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { fetchPayments } from '../../src/services/payments.service';
import { useAuthStore } from '../../src/store/useAuthStore';
import { MOCK_PAYMENTS, MOCK_MEMBERS } from '../../src/utils/mockData';
import { colors, spacing, typography, shadows } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';
import { Payment } from '../../src/types';

export default function PaymentsScreen() {
  const user = useAuthStore((s) => s.user);
  const [payments, setPayments] = useState<
    (Payment & { member_name: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const memberMap = new Map(MOCK_MEMBERS.map((m) => [m.id, m.name]));

  async function loadPayments() {
    setLoading(true);
    try {
      const gymId = user?.gym_id || 'gym_mock';
      const { data } = await fetchPayments(gymId, 50, 0);
      if (data) {
        const enriched = data.map((p) => ({
          ...p,
          member_name: memberMap.get(p.member_id) || 'Unknown',
        }));
        setPayments(enriched);
      } else {
        const enriched = MOCK_PAYMENTS.map((p) => ({
          ...p,
          member_name: memberMap.get(p.member_id) || 'Unknown',
        }));
        setPayments(enriched);
      }
    } catch (err) {
      const enriched = MOCK_PAYMENTS.map((p) => ({
        ...p,
        member_name: memberMap.get(p.member_id) || 'Unknown',
      }));
      setPayments(enriched);
    } finally {
      setLoading(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadPayments().then(() => setRefreshing(false));
  }

  useEffect(() => {
    loadPayments();
  }, [user]);

  function renderPaymentItem({
    item,
  }: {
    item: Payment & { member_name: string };
  }) {
    const date = new Date(item.paid_at).toLocaleDateString('en-IN');
    return (
      <View style={styles.paymentCard}>
        <View style={styles.cardContent}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.member_name}</Text>
            <Text style={styles.paymentDate}>{date}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              {item.currency} {item.amount.toFixed(2)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                item.status === 'paid' && styles.statusPaid,
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>
            Total Revenue: {MOCK_PAYMENTS[0]?.currency || 'INR'}{' '}
            {totalRevenue.toFixed(2)}
          </Text>
        </View>
        <Button
          title="Add Payment"
          onPress={() => {
            alert('Add payment form coming soon');
          }}
        />
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments yet</Text>
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
  paymentCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 12,
    ...shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  paymentDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.success,
  },
  statusPaid: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
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
