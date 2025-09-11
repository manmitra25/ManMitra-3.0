import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar, Users, AlertTriangle, FileText, Clock, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface CrisisAlert {
  id: string;
  type: 'crisis' | 'severe_mood';
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  user_id: string;
  description: string;
}

interface Appointment {
  id: string;
  student_name: string;
  date: string;
  time: string;
  topic: string;
  status: string;
  share_chat_summary: boolean;
}

export function CounselorDashboard() {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
      // Set up periodic refresh for alerts
      const interval = setInterval(loadAlerts, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        loadAlerts(),
        loadAppointments()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      // Mock crisis alerts data
      const mockAlerts: CrisisAlert[] = [
        {
          id: 'alert-1',
          type: 'crisis',
          severity: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          user_id: 'user-123',
          description: 'Student expressing self-harm thoughts during chat session'
        },
        {
          id: 'alert-2',
          type: 'severe_mood',
          severity: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          user_id: 'user-456',
          description: 'Consistent severe depression indicators over past week'
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      // Mock appointments data
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const mockAppointments: Appointment[] = [
        {
          id: 'apt-1',
          student_name: 'Rahul S.',
          date: today.toISOString(),
          time: '14:00',
          topic: 'Academic Stress',
          status: 'confirmed',
          share_chat_summary: true
        },
        {
          id: 'apt-2',
          student_name: 'Priya M.',
          date: today.toISOString(),
          time: '15:30',
          topic: 'Relationship Issues',
          status: 'confirmed',
          share_chat_summary: false
        },
        {
          id: 'apt-3',
          student_name: 'Arjun K.',
          date: tomorrow.toISOString(),
          time: '10:00',
          topic: 'Career Anxiety',
          status: 'pending',
          share_chat_summary: true
        }
      ];
      
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const handleAlert = async (alertId: string, action: string) => {
    try {
      // Mock handling alert by removing it from the list
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      console.log(`Alert ${alertId} handled with action: ${action}`);
    } catch (error) {
      console.error('Failed to handle alert:', error);
      setError('Failed to handle alert');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'crisis':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'severe_mood':
        return <MessageSquare className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.date).toDateString();
    return today === aptDate;
  });

  const pendingAlerts = alerts.filter(alert => alert.type === 'crisis' || alert.severity === 'high');

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Counselor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your overview for today.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {appointments.length} total this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12m</div>
            <p className="text-xs text-muted-foreground">
              Average response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Crisis Alerts */}
      {pendingAlerts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Crisis Alerts
            </CardTitle>
            <CardDescription>
              These require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingAlerts.slice(0, 3).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20"
              >
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{alert.user_id}</span>
                      <Badge variant={getAlertBadgeVariant(alert.severity) as any}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(alert.timestamp)} at {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAlert(alert.id, 'schedule')}
                  >
                    Schedule
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAlert(alert.id, 'escalate')}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Escalate
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Appointments
          </CardTitle>
          <CardDescription>
            {todayAppointments.length} sessions scheduled for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {appointment.time}
                        </span>
                        {appointment.share_chat_summary && (
                          <Badge variant="secondary" className="text-xs">
                            Chat Summary Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Notes
                    </Button>
                    <Button size="sm">
                      Start Session
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest interactions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert, index) => (
              <div key={alert.id} className="flex items-center gap-3 py-2">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{alert.user_id}</span>
                    <Badge variant="outline" className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(alert.timestamp)} at {formatTime(alert.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}