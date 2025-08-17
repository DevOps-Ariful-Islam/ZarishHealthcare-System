/**
 * ZarishCare Clinical Dashboard - Main Dashboard Page
 * Comprehensive overview for humanitarian healthcare operations
 */

import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  People,
  LocalHospital,
  Science,
  Assessment,
  Warning,
  Sync,
  Wifi,
  WifiOff,
  Emergency,
  Notifications,
  Language,
  Settings
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Import custom hooks and services
import { useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { apiClient } from '../services/api';
import { syncService } from '../services/sync';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { PatientQuickAccess } from '../components/patients/PatientQuickAccess';
import { EmergencyAlerts } from '../components/alerts/EmergencyAlerts';
import { SyncStatus } from '../components/sync/SyncStatus';
import { OfflineIndicator } from '../components/ui/OfflineIndicator';

// Types
interface DashboardMetrics {
  patients: {
    total: number;
    new_today: number;
    critical: number;
    follow_ups_due: number;
  };
  clinical: {
    consultations_today: number;
    admissions: number;
    discharges: number;
    pending_results: number;
  };
  laboratory: {
    tests_pending: number;
    tests_completed_today: number;
    critical_results: number;
    equipment_alerts: number;
  };
  operations: {
    active_emergencies: number;
    resource_alerts: number;
    partner_activities: number;
    sync_conflicts: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'patient' | 'clinical' | 'laboratory' | 'emergency';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  user: {
    name: string;
    avatar?: string;
  };
}

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { syncStatus, isOnline } = useSync();
  const { networkQuality } = useNetworkStatus();

  // Dashboard data queries
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/dashboard-metrics');
      return response.data as DashboardMetrics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000
  });

  const {
    data: recentActivity,
    isLoading: activityLoading
  } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await apiClient.get('/operations/recent-activity', {
        params: { limit: 10 }
      });
      return response.data as RecentActivity[];
    },
    refetchInterval: 60000
  });

  const {
    data: syncConflicts,
    isLoading: conflictsLoading
  } = useQuery({
    queryKey: ['sync-conflicts'],
    queryFn: async () => {
      const response = await apiClient.get('/sync/conflicts', {
        params: { status: 'pending', limit: 5 }
      });
      return response.data;
    },
    refetchInterval: 30000
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Handle emergency alerts
  const handleEmergencyAlert = (alert: any) => {
    toast.error(`Emergency Alert: ${alert.title}`, {
      duration: 10000,
      position: 'top-center'
    });
  };

  // Chart data for patient trends
  const patientTrendData = {
    labels: Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 6 - i), 'MMM dd')
    ),
    datasets: [
      {
        label: t('dashboard.consultations'),
        data: [45, 52, 38, 67, 49, 58, 63],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
      },
      {
        label: t('dashboard.admissions'),
        data: [8, 12, 6, 15, 9, 11, 13],
        borderColor: '#ed6c02',
        backgroundColor: 'rgba(237, 108, 2, 0.1)',
        tension: 0.4,
      }
    ]
  };

  // Chart data for service distribution
  const serviceDistributionData = {
    labels: [
      t('dashboard.primary_care'),
      t('dashboard.emergency'),
      t('dashboard.ncd_management'),
      t('dashboard.maternal_health'),
      t('dashboard.mental_health')
    ],
    datasets: [
      {
        data: [45, 20, 15, 12, 8],
        backgroundColor: [
          '#1976d2',
          '#d32f2f',
          '#ed6c02',
          '#2e7d32',
          '#9c27b0'
        ],
        borderWidth: 0
      }
    ]
  };

  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              {t('dashboard.welcome')}, {user?.profile?.first_name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')} | {user?.profile?.facility_id}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1} alignItems="center">
            <OfflineIndicator isOnline={isOnline} networkQuality={networkQuality} />
            <SyncStatus status={syncStatus} />
            
            <Tooltip title={t('dashboard.emergency_mode')}>
              <IconButton color="error" sx={{ display: 'none' /* Show only in emergency */ }}>
                <Emergency />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('dashboard.settings')}>
              <IconButton onClick={() => router.push('/settings')}>
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Critical Alerts */}
        <EmergencyAlerts onAlert={handleEmergencyAlert} />

        {/* Sync Conflicts Alert */}
        {syncConflicts?.data?.length > 0 && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => router.push('/sync/conflicts')}
              >
                {t('dashboard.resolve')}
              </Button>
            }
          >
            {t('dashboard.sync_conflicts_detected', { count: syncConflicts.data.length })}
          </Alert>
        )}

        {/* Key Metrics Grid */}
        <Grid container spacing={3} mb={3}>
          {/* Patients Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <People />
                  </Avatar>
                  <Typography variant="h6">{t('dashboard.patients')}</Typography>
                </Box>
                
                {metricsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {metrics?.patients.total.toLocaleString() || '0'}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Chip 
                        label={`${metrics?.patients.new_today || 0} ${t('dashboard.new_today')}`}
                        size="small" 
                        color="success"
                      />
                      {metrics?.patients.critical > 0 && (
                        <Chip 
                          label={`${metrics.patients.critical} ${t('dashboard.critical')}`}
                          size="small" 
                          color="error"
                        />
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Clinical Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <LocalHospital />
                  </Avatar>
                  <Typography variant="h6">{t('dashboard.clinical')}</Typography>
                </Box>
                
                {metricsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h4" color="success.main" gutterBottom>
                      {metrics?.clinical.consultations_today || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.consultations_today')}
                    </Typography>
                    <Box mt={1}>
                      <Chip 
                        label={`${metrics?.clinical.admissions || 0} ${t('dashboard.admissions')}`}
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Laboratory Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <Science />
                  </Avatar>
                  <Typography variant="h6">{t('dashboard.laboratory')}</Typography>
                </Box>
                
                {metricsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h4" color="warning.main" gutterBottom>
                      {metrics?.laboratory.tests_pending || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.tests_pending')}
                    </Typography>
                    {metrics?.laboratory.critical_results > 0 && (
                      <Box mt={1}>
                        <Chip 
                          label={`${metrics.laboratory.critical_results} ${t('dashboard.critical_results')}`}
                          size="small" 
                          color="error"
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Operations Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <Assessment />
                  </Avatar>
                  <Typography variant="h6">{t('dashboard.operations')}</Typography>
                </Box>
                
                {metricsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h4" color="info.main" gutterBottom>
                      {metrics?.operations.partner_activities || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.active_activities')}
                    </Typography>
                    {metrics?.operations.active_emergencies > 0 && (
                      <Box mt={1}>
                        <Chip 
                          label={`${metrics.operations.active_emergencies} ${t('dashboard.emergencies')}`}
                          size="small" 
                          color="error"
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts and Analytics */}
        <Grid container spacing={3} mb={3}>
          {/* Patient Trend Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.patient_trends')}
                </Typography>
                <Box height={300}>
                  <Line 
                    data={patientTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Service Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.service_distribution')}
                </Typography>
                <Box height={300}>
                  <Doughnut
                    data={serviceDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions and Recent Activity */}
        <Grid container spacing={3}>
          {/* Quick Patient Access */}
          <Grid item xs={12} md={6}>
            <PatientQuickAccess />
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.recent_activity')}
                </Typography>
                
                {activityLoading ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {recentActivity?.slice(0, 5).map((activity) => (
                      <ListItem key={activity.id} divider>
                        <ListItemAvatar>
                          <Avatar 
                            src={activity.user.avatar}
                            sx={{ 
                              bgcolor: 
                                activity.priority === 'critical' ? 'error.main' :
                                activity.priority === 'high' ? 'warning.main' :
                                'primary.main'
                            }}
                          >
                            {activity.user.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(activity.timestamp), 'MMM dd, HH:mm')} • {activity.user.name}
                              </Typography>
                            </Box>
                          }
                        />
                        {activity.priority === 'critical' && (
                          <Chip label={t('dashboard.critical')} color="error" size="small" />
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
                
                <Box mt={2} textAlign="center">
                  <Button onClick={() => router.push('/activity')}>
                    {t('dashboard.view_all_activity')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;