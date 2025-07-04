import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, GRADIENTS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useGuru } from '../contexts/GuruContext';
import { Contact, Deal, Task } from '../services/supabase';

const DashboardScreen = () => {
  const { user, profile } = useAuth();
  const { insights, generateInsights, isLoading } = useGuru();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalDeals: 0,
    totalTasks: 0,
    activeDeals: 0,
    pipelineValue: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Simulated data loading
    setStats({
      totalContacts: 156,
      totalDeals: 23,
      totalTasks: 45,
      activeDeals: 18,
      pipelineValue: 125000,
    });

    // Generate AI insights
    await generateInsights({
      contacts: [], // Will be populated with real data
      deals: [],
      tasks: [],
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, icon, color }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );

  const InsightCard = ({ insight }: { insight: any }) => (
    <TouchableOpacity style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons 
          name={insight.type === 'tip' ? 'bulb' : insight.type === 'warning' ? 'warning' : 'trending-up'} 
          size={20} 
          color={insight.priority === 'high' ? COLORS.error : COLORS.primary} 
        />
        <Text style={styles.insightTitle}>{insight.title}</Text>
      </View>
      <Text style={styles.insightMessage}>{insight.message}</Text>
      {insight.actionable && (
        <TouchableOpacity style={styles.insightAction}>
          <Text style={styles.insightActionText}>{insight.actionText}</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.primary}
        style={styles.header}
      >
        <Text style={styles.welcomeText}>
          Welcome back, {profile?.first_name || 'Sales Pro'}! 👋
        </Text>
        <Text style={styles.subtitleText}>
          Here's what's happening with your sales today
        </Text>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts.toString()}
          icon="people"
          color={COLORS.primary}
        />
        <StatCard
          title="Active Deals"
          value={stats.activeDeals.toString()}
          subtitle={`$${stats.pipelineValue.toLocaleString()}`}
          icon="trending-up"
          color={COLORS.success}
        />
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks.toString()}
          icon="checkmark-circle"
          color={COLORS.warning}
        />
        <StatCard
          title="Pipeline Value"
          value={`$${(stats.pipelineValue / 1000).toFixed(0)}k`}
          icon="cash"
          color={COLORS.secondary}
        />
      </View>

      {/* AI Insights */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saletoru Guru Insights</Text>
          <TouchableOpacity>
            <Ionicons name="sparkles" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {insights.slice(0, 3).map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Add Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="trending-up" size={24} color={COLORS.success} />
            <Text style={styles.quickActionText}>New Deal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.warning} />
            <Text style={styles.quickActionText}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="mail" size={24} color={COLORS.secondary} />
            <Text style={styles.quickActionText}>Send Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.xl,
  },
  welcomeText: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  subtitleText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.md,
  },
  statCard: {
    width: '47%',
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  statGradient: {
    padding: SIZES.spacing.md,
    minHeight: 100,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  statTitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SIZES.spacing.xs,
  },
  statValue: {
    fontSize: SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  statSubtitle: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
  },
  section: {
    padding: SIZES.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  insightTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SIZES.spacing.sm,
    flex: 1,
  },
  insightMessage: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.spacing.sm,
  },
  insightActionText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SIZES.spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    flex: 1,
    marginHorizontal: SIZES.spacing.xs,
  },
  quickActionText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.xs,
    textAlign: 'center',
  },
});

export default DashboardScreen; 