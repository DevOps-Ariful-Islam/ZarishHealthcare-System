/**
 * ZarishCare Mobile - Main Dashboard Screen
 * Field operations dashboard for humanitarian healthcare workers
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import {
  Card,
  Avatar,
  Button,
  Chip,
  FAB,
  Portal,
  Snackbar,
  Badge,
  Surface,
  IconButton
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, startOfDay, endOfDay } from 'date-fns';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';

// Hooks and services
import { useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { apiService } from '../services/api';
import { syncService } from '../services/sync';
import { offlineService } from '../services/offline';
import { notificationService } from '../services/notifications';

// Components
import { NetworkStatusBanner } from '../components/NetworkStatusBanner';
import { SyncIndicator } from '../components/SyncIndicator';
import { EmergencyButton } from '../components/EmergencyButton';
import { QuickActionCard } from '../components/QuickActionCard';
import { PatientCountCard } from '../components/PatientCountCard';
import { OfflineBanner } from '../components/OfflineBanner';

// Types
interface DashboardStats {
  patients: {
    total: number;
    new_today: number;
    critical: number;
    scheduled_today: number;
  };
  clinical: {
    consultations_today: number;
    pending_follow_ups: number;
    medications_dispensed: number;
    vital_signs_recorded: number;
  };
  sync: {
    pending_uploads: number;
    last_sync: string;
    conflicts: number;
    queue_size: number;
  };
  alerts: {
    critical: number;
    warnings: number;
    reminders: number;
  };
}

const { width } = Dimensions.get('window');
const chartConfig = {
  backgroundColor: '#e26a00',
  backgroundGradientFrom: '#fb8c00',
  backgroundGradientTo: '#ffa726',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726'
  }
};

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const { user, isAuthenticated } = useAuth();
  const { syncStatus, isOnline, startSync } = useSync();
  const { getOfflineData, hasOfflineData } = useOfflineStorage();
  
  const [refreshing, setRefreshing] = useState(false);
  const [networkState, setNetworkState] = useState<any>(null);
  const [showEmergencyFAB, setShowEmergencyFAB] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Dashboard data query with offline fallback
  const {
    data: dashboardStats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-stats', user?.facility_id],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        if (isOnline) {
          const response = await apiService.get('/analytics/mobile-dashboard');
          // Cache data for offline use
          await offlineService.store('dashboard-stats', response.data);
          return response.data;
        } else {
          // Fallback to offline data
          const offlineData = await offlineService.get('dashboard-stats');
          if (offlineData) {
            return offlineData;
          }
          throw new Error('No offline data available');
        }
      } catch (err) {
        // Final fallback to cached data
        const cachedData = await getOfflineData('dashboard-stats');
        if (cachedData) {
          return cachedData;
        }
        throw err;
      }
    },
    refetchInterval: isOnline ? 60000 : false, // Refresh every minute when online
    staleTime: 30000,
    gcTime: 24 * 60 * 60 * 1000 // 24 hours
  });

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState(state);
      
      if (state.isConnected && !networkState?.isConnected) {
        // Just came back online
        setSnackbarMessage(t('dashboard.back_online'));
        setSnackbarVisible(true);
        
        // Trigger sync
        startSync();
        
        // Refetch data
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      } else if (!state.isConnected && networkState?.isConnected) {
        // Just went offline
        setSnackbarMessage(t('dashboard.offline_mode'));
        setSnackbarVisible(true);
      }
    });

    return () => unsubscribe();
  }, [networkState, startSync, queryClient, t]);

  // Focus effect for real-time updates
  useFocusEffect(
    useCallback(() => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }
    }, [isOnline, queryClient])
  );

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      if (isOnline) {
        await startSync();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('dashboard.refresh_error'),
        text2: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setRefreshing(false);
    }
  }, [refetch, isOnline, startSync, t]);

  // Emergency mode activation
  const handleEmergencyMode = () => {
    Alert.alert(
      t('dashboard.emergency_mode'),
      t('dashboard.emergency_mode_confirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('dashboard.activate'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.post('/emergency/activate', {
                facility_id: user?.facility_id,
                triggered_by: user?.id
              });
              
              Toast.show({
                type: 'success',
                text1: t('dashboard.emergency_activated'),
                visibilityTime: 5000
              });
              
              navigation.navigate('Emergency' as never);
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: t('dashboard.emergency_activation_failed')
              });
            }
          }
        }
      ]
    );
  };

  // Chart data for patient trends
  const patientTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 35, 28, 42, 31, 38, 45],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      strokeWidth: 3
    }]
  };

  // Quick actions configuration
  const quickActions = [
    {
      id: 'new_patient',
      title: t('dashboard.new_patient'),
      icon: 'account-plus',
      color: '#4CAF50',
      screen: 'NewPatient',
      badge: dashboardStats?.patients.new_today
    },
    {
      id: 'consultations',
      title: t('dashboard.consultations'),
      icon: 'stethoscope',
      color: '#2196F3',
      screen: 'Consultations',
      badge: dashboardStats?.clinical.pending_follow_ups
    },
    {
      id: 'lab_results',
      title: t('dashboard.lab_results'),
      icon: 'flask',
      color: '#FF9800',
      screen: 'LabResults',
      badge: 0 // Would come from lab service
    },
    {
      id: 'medications',
      title: t('dashboard.medications'),
      icon: 'pill',
      color: '#9C27B0',
      screen: 'Medications',
      badge: 0
    },
    {
      id: 'sync_data',
      title: t('dashboard.sync_data'),
      icon: 'sync',
      color: '#607D8B',
      screen: 'SyncManagement',
      badge: dashboardStats?.sync.pending_uploads
    },
    {
      id: 'reports',
      title: t('dashboard.reports'),
      icon: 'chart-line',
      color: '#795548',
      screen: 'Reports',
      badge: 0
    }
  ];

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1976d2" barStyle="light-content" />
      
      {/* Network Status Banner */}
      <NetworkStatusBanner 
        isOnline={isOnline} 
        networkType={networkState?.type}
        strength={networkState?.details?.strength}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1976d2']}
            tintColor="#1976d2"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>
                {t('dashboard.welcome')}, {user?.profile?.first_name}!
              </Text>
              <Text style={styles.facilityText}>
                {user?.profile?.facility_id} • {format(new Date(), 'MMM dd, yyyy')}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <SyncIndicator 
                status={syncStatus}
                pendingCount={dashboardStats?.sync.pending_uploads || 0}
                onPress={() => navigation.navigate('SyncManagement' as never)}
              />
              
              {(dashboardStats?.alerts.critical || 0) > 0 && (
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={() => navigation.navigate('Alerts' as never)}
                >
                  <Icon name="alert" size={24} color="#f44336" />
                  <Badge style={styles.alertBadge}>
                    {dashboardStats?.alerts.critical}
                  </Badge>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Offline Data Banner */}
        {!isOnline && hasOfflineData && (
          <OfflineBanner 
            message={t('dashboard.offline_data_available')}
            onSync={() => startSync()}
          />
        )}

        {/* Key Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <PatientCountCard
              title={t('dashboard.total_patients')}
              count={dashboardStats?.patients.total || 0}
              subtitle={`${dashboardStats?.patients.new_today || 0} ${t('dashboard.new_today')}`}
              icon="account-group"
              color="#4CAF50"
              onPress={() => navigation.navigate('Patients' as never)}
            />
            
            <PatientCountCard
              title={t('dashboard.consultations')}
              count={dashboardStats?.clinical.consultations_today || 0}
              subtitle={t('dashboard.today')}
              icon="stethoscope"
              color="#2196F3"
              onPress={() => navigation.navigate('Consultations' as never)}
            />
          </View>

          <View style={styles.statsRow}>
            <PatientCountCard
              title={t('dashboard.critical_cases')}
              count={dashboardStats?.patients.critical || 0}
              subtitle={t('dashboard.requires_attention')}
              icon="alert-circle"
              color="#f44336"
              onPress={() => navigation.navigate('CriticalCases' as never)}
            />
            
            <PatientCountCard
              title={t('dashboard.scheduled_today')}
              count={dashboardStats?.patients.scheduled_today || 0}
              subtitle={t('dashboard.appointments')}
              icon="calendar-clock"
              color="#FF9800"
              onPress={() => navigation.navigate('Schedule' as never)}
            />
          </View>
        </View>

        {/* Patient Trends Chart */}
        {isOnline && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>
                {t('dashboard.weekly_consultations')}
              </Text>
              <LineChart
                data={patientTrendData}
                width={width - 60}
                height={200}
                chartConfig={chartConfig}
                style={styles.chart}
                withHorizontalLines={false}
                withVerticalLines={false}
                withDots={true}
                withShadow={false}
              />
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>{t('dashboard.quick_actions')}</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              title={action.title}
              icon={action.icon}
              color={action.color}
              badge={action.badge}
              onPress={() => navigation.navigate(action.screen as never)}
            />
          ))}
        </View>

        {/* Recent Activity */}
        <Card style={styles.recentActivityCard}>
          <Card.Title
            title={t('dashboard.recent_activity')}
            right={(props) => (
              <IconButton
                {...props}
                icon="chevron-right"
                onPress={() => navigation.navigate('ActivityLog' as never)}
              />
            )}
          />
          <Card.Content>
            {isLoading ? (
              <ActivityIndicator size="small" color="#1976d2" />
            ) : (
              <View style={styles.activityList}>
                <Text style={styles.activityItem}>
                  • {t('dashboard.sample_activity_1')}
                </Text>
                <Text style={styles.activityItem}>
                  • {t('dashboard.sample_activity_2')}
                </Text>
                <Text style={styles.activityItem}>
                  • {t('dashboard.sample_activity_3')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Emergency FAB */}
      <FAB
        style={[styles.emergencyFab, { backgroundColor: '#f44336' }]}
        icon="emergency"
        label={t('dashboard.emergency')}
        onPress={handleEmergencyMode}
        visible={true}
        color="white"
      />

      {/* Snackbar for network status */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1976d2',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  facilityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  alertButton: {
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  chartCard: {
    margin: 15,
    marginTop: 0,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 15,
  },
  recentActivityCard: {
    margin: 15,
    marginTop: 25,
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  emergencyFab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
  },
  snackbar: {
    backgroundColor: '#333',
  },
});

export default DashboardScreen;