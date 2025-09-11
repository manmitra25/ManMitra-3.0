import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Calendar } from '../ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Calendar as CalendarIcon, Clock, Users, MessageSquare, Video, Phone, Star,
  AlertTriangle, TrendingUp, FileText, Settings, Bell, Plus, Edit, Eye,
  CheckCircle, XCircle, User, Heart, Brain, Activity, Timer, Award
} from 'lucide-react';

interface CounselorDashboardProps {
  language?: string;
}

// Sample data
const upcomingSessions = [
  {
    id: '1',
    studentId: 'Anonymous_Student_1',
    time: '10:00 AM',
    date: 'Today',
    type: 'video',
    duration: 50,
    isFirstSession: false,
    notes: 'Follow-up on anxiety management techniques'
  },
  {
    id: '2',
    studentId: 'Anonymous_Student_2',
    time: '2:00 PM',
    date: 'Today',
    type: 'video',
    duration: 50,
    isFirstSession: true,
    notes: 'Initial assessment - academic stress'
  },
  {
    id: '3',
    studentId: 'Anonymous_Student_3',
    time: '4:00 PM',
    date: 'Tomorrow',
    type: 'audio',
    duration: 30,
    isFirstSession: false,
    notes: 'Crisis intervention follow-up'
  }
];

const recentSessions = [
  {
    id: '1',
    studentId: 'Anonymous_Student_4',
    date: 'Yesterday',
    duration: 45,
    type: 'completed',
    rating: 5,
    notes: 'Good progress on CBT techniques'
  },
  {
    id: '2',
    studentId: 'Anonymous_Student_5',
    date: '2 days ago',
    duration: 50,
    type: 'completed',
    rating: 4,
    notes: 'Working on sleep hygiene'
  }
];

const crisisAlerts = [
  {
    id: '1',
    studentId: 'Anonymous_Student_6',
    severity: 'high',
    trigger: 'PHQ-9 Score: 18',
    timestamp: '30 min ago',
    status: 'assigned'
  },
  {
    id: '2',
    studentId: 'Anonymous_Student_7',
    severity: 'critical',
    trigger: 'Suicidal ideation detected',
    timestamp: '2 hours ago',
    status: 'contacted'
  }
];

const performanceData = [
  { month: 'Jan', sessions: 42, rating: 4.6, utilization: 85 },
  { month: 'Feb', sessions: 48, rating: 4.7, utilization: 90 },
  { month: 'Mar', sessions: 45, rating: 4.8, utilization: 88 },
  { month: 'Apr', sessions: 52, rating: 4.9, utilization: 95 },
  { month: 'May', sessions: 49, rating: 4.8, utilization: 92 },
  { month: 'Jun', sessions: 55, rating: 4.9, utilization: 98 }
];

const studentOutcomes = [
  { category: 'Anxiety Improved', count: 28 },
  { category: 'Depression Reduced', count: 22 },
  { category: 'Stress Management', count: 35 },
  { category: 'Sleep Quality', count: 18 },
  { category: 'Academic Performance', count: 31 }
];

export function ComprehensiveCounselorDashboard({ language = 'en' }: CounselorDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showSessionNotes, setShowSessionNotes] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const texts = {
    dashboard: 'Dashboard',
    schedule: 'Schedule',
    students: 'Students',
    crisis: 'Crisis',
    resources: 'Resources',
    profile: 'Profile',
    todaySessions: "Today's Sessions",
    upcomingAppointments: 'Upcoming Appointments',
    recentSessions: 'Recent Sessions',
    crisisAlerts: 'Crisis Alerts',
    performance: 'Performance Overview',
    joinSession: 'Join Session',
    startSession: 'Start Session',
    viewNotes: 'View Notes',
    addNotes: 'Add Notes',
    firstSession: 'First Session',
    followUp: 'Follow-up',
    crisis: 'Crisis',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noShow: 'No Show',
    high: 'High Priority',
    medium: 'Medium Priority',
    critical: 'Critical',
    respond: 'Respond',
    contact: 'Contact',
    escalate: 'Escalate',
    thisMonth: 'This Month',
    totalSessions: 'Total Sessions',
    avgRating: 'Average Rating',
    utilization: 'Utilization Rate',
    responseTime: 'Avg Response Time',
    studentProgress: 'Student Progress',
    improvementAreas: 'Improvement Areas',
    sessionType: 'Session Type',
    video: 'Video Call',
    audio: 'Audio Call',
    chat: 'Text Chat',
    duration: 'Duration',
    minutes: 'minutes',
    saveNotes: 'Save Notes',
    cancel: 'Cancel',
    reschedule: 'Reschedule',
    markComplete: 'Mark Complete'
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const handleSessionAction = (sessionId: string, action: string) => {
    console.log(`${action} session:`, sessionId);
    // In a real app, this would call the backend API
  };

  const handleCrisisResponse = (alertId: string, action: string) => {
    console.log(`${action} crisis alert:`, alertId);
    // In a real app, this would call the backend API
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl mb-2">Counselor Dashboard</h1>
            <p className="text-muted-foreground text-lg">Welcome back, Dr. Priya Sharma</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Crisis Alert Banner */}
        {crisisAlerts.filter(alert => alert.severity === 'critical').length > 0 && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <h3 className="font-medium text-destructive">Critical Alert</h3>
                  <p className="text-sm text-destructive/80">Student requires immediate attention</p>
                </div>
              </div>
              <Button variant="destructive" onClick={() => setSelectedTab('crisis')}>
                View Crisis Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {texts.dashboard}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {texts.schedule}
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {texts.students}
          </TabsTrigger>
          <TabsTrigger value="crisis" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {texts.crisis}
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {texts.resources}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{texts.totalSessions}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">55</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">+12%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{texts.avgRating}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.9</div>
                  <p className="text-xs text-muted-foreground">
                    Based on 45 reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{texts.utilization}</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-xs text-muted-foreground">
                    Above average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{texts.responseTime}</CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8 min</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">-2 min</span> improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Sessions and Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{texts.todaySessions}</CardTitle>
                    <Badge variant="secondary">3 sessions</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.filter(s => s.date === 'Today').map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getSessionTypeIcon(session.type)}
                              <span className="font-medium">{session.time}</span>
                            </div>
                            {session.isFirstSession && (
                              <Badge variant="outline">First Session</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm">
                              {texts.joinSession}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          Student: {session.studentId} • {session.duration} minutes
                        </div>
                        
                        {session.notes && (
                          <p className="text-sm bg-muted/50 p-2 rounded">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{texts.recentSessions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-success" />
                            <div>
                              <p className="font-medium">{session.studentId}</p>
                              <p className="text-sm text-muted-foreground">{session.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < session.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          Duration: {session.duration} minutes
                        </p>
                        
                        {session.notes && (
                          <p className="text-sm bg-muted/50 p-2 rounded">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{texts.performance}</CardTitle>
                <CardDescription>Your performance metrics over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sessions" stroke="#3A86FF" strokeWidth={2} name="Sessions" />
                    <Line type="monotone" dataKey="rating" stroke="#2ECC71" strokeWidth={2} name="Rating" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle>{texts.studentProgress}</CardTitle>
                <CardDescription>Positive outcomes achieved with your students</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentOutcomes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2ECC71" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Schedule for {selectedDate?.toDateString()}</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Block Time
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getSessionTypeIcon(session.type)}
                            <span className="font-medium">{session.time}</span>
                          </div>
                          <Badge variant={session.isFirstSession ? "default" : "secondary"}>
                            {session.isFirstSession ? texts.firstSession : texts.followUp}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            {texts.reschedule}
                          </Button>
                          <Button size="sm">
                            {texts.joinSession}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div>Student: {session.studentId}</div>
                        <div>Duration: {session.duration} minutes</div>
                      </div>
                      
                      {session.notes && (
                        <div className="bg-muted/50 p-3 rounded">
                          <Label className="text-sm font-medium">Session Notes:</Label>
                          <p className="text-sm mt-1">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crisis">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Crisis Management</h2>
                <p className="text-muted-foreground">Students requiring immediate attention</p>
              </div>
              <Button variant="destructive">
                Emergency Protocols
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Active Crisis Alerts</CardTitle>
                <CardDescription>Students flagged by the system for immediate intervention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crisisAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <div>
                            <p className="font-medium">{alert.studentId}</p>
                            <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {alert.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <Label className="text-sm font-medium">Trigger:</Label>
                        <p className="text-sm text-muted-foreground">{alert.trigger}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCrisisResponse(alert.id, 'contact')}
                        >
                          {texts.contact}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCrisisResponse(alert.id, 'escalate')}
                        >
                          {texts.escalate}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleCrisisResponse(alert.id, 'schedule')}
                        >
                          Schedule Emergency Session
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Crisis Response Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Crisis Response Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-destructive mb-2">Critical Level</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Contact within 15 minutes</li>
                      <li>• Notify emergency contacts</li>
                      <li>• Escalate to Tele-MANAS if needed</li>
                      <li>• Document all interventions</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-warning mb-2">High Priority</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Contact within 2 hours</li>
                      <li>• Schedule session within 24 hours</li>
                      <li>• Provide immediate resources</li>
                      <li>• Follow up within 48 hours</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-primary mb-2">Medium Priority</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Schedule session within 72 hours</li>
                      <li>• Provide relevant resources</li>
                      <li>• Monitor mood tracking</li>
                      <li>• Follow up weekly</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Student Management</h2>
                <p className="text-muted-foreground">View and manage your assigned students</p>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Search students..." className="w-64" />
                <Button variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample student data */}
                  {[1, 2, 3, 4, 5].map((student) => (
                    <div key={student} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>AS</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Anonymous_Student_{student}</p>
                            <p className="text-sm text-muted-foreground">Last session: 3 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Active</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label>Progress</Label>
                          <Progress value={65} className="mt-1" />
                        </div>
                        <div>
                          <Label>Sessions</Label>
                          <p className="font-medium">8 completed</p>
                        </div>
                        <div>
                          <Label>Last PHQ-9</Label>
                          <p className="font-medium">Score: 12</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Resources & Tools</h2>
                <p className="text-muted-foreground">Clinical resources and assessment tools</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Assessment Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">PHQ-9 Questionnaire</Button>
                    <Button variant="outline" className="w-full justify-start">GAD-7 Assessment</Button>
                    <Button variant="outline" className="w-full justify-start">Beck Depression Inventory</Button>
                    <Button variant="outline" className="w-full justify-start">Stress Scale</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Therapy Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">CBT Worksheets</Button>
                    <Button variant="outline" className="w-full justify-start">Mindfulness Exercises</Button>
                    <Button variant="outline" className="w-full justify-start">Relaxation Techniques</Button>
                    <Button variant="outline" className="w-full justify-start">Coping Strategies</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">Session Notes Template</Button>
                    <Button variant="outline" className="w-full justify-start">Treatment Plans</Button>
                    <Button variant="outline" className="w-full justify-start">Progress Reports</Button>
                    <Button variant="outline" className="w-full justify-start">Crisis Protocols</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Session Notes Dialog */}
      <Dialog open={!!showSessionNotes} onOpenChange={() => setShowSessionNotes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Notes</DialogTitle>
            <DialogDescription>
              Add notes for this counseling session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter session notes..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={6}
            />
            <div className="flex gap-2">
              <Button onClick={() => setShowSessionNotes(null)} className="flex-1">
                {texts.saveNotes}
              </Button>
              <Button variant="outline" onClick={() => setShowSessionNotes(null)}>
                {texts.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}