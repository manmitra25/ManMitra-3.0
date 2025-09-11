import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Brain,
  Heart,
  Shield,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Settings,
  FileText,
  Globe,
  UserPlus,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ForumModeration } from '../ForumModeration';
import { useAuth } from '../auth/AuthProvider';

interface CounselorProfile {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  bio: string;
  availability: Record<string, string[]>;
  rating: number;
  sessions_count: number;
  status: 'active' | 'inactive';
}

interface ContentItem {
  id: string;
  title: string;
  type: 'article' | 'video' | 'audio' | 'exercise';
  category: string;
  language: string;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

const MOCK_COUNSELORS: CounselorProfile[] = [
  {
    id: 'counselor-1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@manmitra.app',
    specialties: ['Anxiety', 'Depression', 'Academic Stress'],
    bio: 'Clinical psychologist with 8 years of experience in youth mental health.',
    availability: {
      'monday': ['09:00', '14:00'],
      'tuesday': ['10:00', '16:00'],
      'wednesday': ['09:00', '15:00']
    },
    rating: 4.8,
    sessions_count: 156,
    status: 'active'
  },
  {
    id: 'counselor-2',
    name: 'Dr. Arjun Patel',
    email: 'arjun.patel@manmitra.app',
    specialties: ['LGBTQ+ Support', 'Family Therapy', 'Trauma'],
    bio: 'Licensed clinical social worker specializing in diverse communities.',
    availability: {
      'monday': ['11:00', '17:00'],
      'thursday': ['09:00', '15:00'],
      'friday': ['10:00', '14:00']
    },
    rating: 4.9,
    sessions_count: 203,
    status: 'active'
  }
];

const MOCK_CONTENT: ContentItem[] = [
  {
    id: 'content-1',
    title: 'Managing Exam Anxiety',
    type: 'article',
    category: 'Academic Stress',
    language: 'en',
    status: 'published',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'content-2',
    title: 'Breathing Exercises for Stress',
    type: 'video',
    category: 'Mindfulness',
    language: 'hi',
    status: 'published',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  }
];

export function ComprehensiveAdminDashboard() {
  const [counselors, setCounselors] = useState<CounselorProfile[]>(MOCK_COUNSELORS);
  const [content, setContent] = useState<ContentItem[]>(MOCK_CONTENT);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [newCounselor, setNewCounselor] = useState<Partial<CounselorProfile>>({});
  const [newContent, setNewContent] = useState<Partial<ContentItem>>({});
  const [showAddCounselor, setShowAddCounselor] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data
      const mockAnalytics = {
        overview: {
          total_users: 1247,
          total_chat_sessions: 8934,
          total_appointments: 456,
          crisis_incidents: 7
        },
        mood_trends: {
          minimal: 32,
          mild: 45,
          moderate: 18,
          severe: 5
        },
        top_topics: {
          'Academic Stress': 145,
          'Relationship Issues': 98,
          'Family Problems': 76,
          'Career Anxiety': 62,
          'Social Anxiety': 54
        }
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCounselor = async () => {
    if (!newCounselor.name || !newCounselor.email) return;

    const counselor: CounselorProfile = {
      id: `counselor-${Date.now()}`,
      name: newCounselor.name,
      email: newCounselor.email,
      specialties: newCounselor.specialties || [],
      bio: newCounselor.bio || '',
      availability: newCounselor.availability || {},
      rating: 0,
      sessions_count: 0,
      status: 'active'
    };

    setCounselors(prev => [...prev, counselor]);
    setNewCounselor({});
    setShowAddCounselor(false);
  };

  const handleDeleteCounselor = (id: string) => {
    setCounselors(prev => prev.filter(c => c.id !== id));
  };

  const handleAddContent = () => {
    if (!newContent.title || !newContent.type) return;

    const contentItem: ContentItem = {
      id: `content-${Date.now()}`,
      title: newContent.title,
      type: newContent.type as ContentItem['type'],
      category: newContent.category || 'General',
      language: newContent.language || 'en',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setContent(prev => [...prev, contentItem]);
    setNewContent({});
    setShowAddContent(false);
  };

  const handleDeleteContent = (id: string) => {
    setContent(prev => prev.filter(c => c.id !== id));
  };

  const exportAnalytics = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      generated_by: user?.email,
      platform: 'ManMitra',
      ...analytics
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manmitra-admin-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !analytics) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive platform management and oversight
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAnalytics} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="counselors">Counselors</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18,394</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,249</div>
                <p className="text-xs text-muted-foreground">
                  Professional sessions
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crisis Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">23</div>
                <p className="text-xs text-muted-foreground">
                  All resolved appropriately
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Crisis Alerts</CardTitle>
                <CardDescription>Latest mental health emergencies handled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { severity: 'high', time: '2 hours ago', status: 'resolved' },
                  { severity: 'medium', time: '5 hours ago', status: 'monitoring' },
                  { severity: 'high', time: '1 day ago', status: 'resolved' }
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        alert.severity === 'high' ? 'bg-destructive' : 'bg-warning'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Priority Alert
                        </p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                    <Badge variant={alert.status === 'resolved' ? 'default' : 'outline'}>
                      {alert.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm font-medium text-success">124ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Health</span>
                    <span className="text-sm font-medium text-success">Optimal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <span className="text-sm font-medium">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="text-sm font-medium text-success">0.02%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Monthly platform engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', chats: 1200, assessments: 450 },
                    { month: 'Feb', chats: 1400, assessments: 520 },
                    { month: 'Mar', chats: 1600, assessments: 580 },
                    { month: 'Apr', chats: 1800, assessments: 640 },
                    { month: 'May', chats: 2000, assessments: 720 },
                    { month: 'Jun', chats: 2200, assessments: 800 }
                  ]}>
                    <CartesianGrid strokeDashArray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="chats" stroke="#3A86FF" strokeWidth={2} />
                    <Line type="monotone" dataKey="assessments" stroke="#2ECC71" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mental Health Distribution</CardTitle>
                <CardDescription>Severity levels from assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Minimal', value: 45, color: '#2ECC71' },
                        { name: 'Mild', value: 30, color: '#F59E0B' },
                        { name: 'Moderate', value: 20, color: '#FF8C00' },
                        { name: 'Severe', value: 5, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {[
                        { name: 'Minimal', value: 45, color: '#2ECC71' },
                        { name: 'Mild', value: 30, color: '#F59E0B' },
                        { name: 'Moderate', value: 20, color: '#FF8C00' },
                        { name: 'Severe', value: 5, color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>Data-driven insights for platform improvement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Academic Stress Workshop Recommended:</strong> 45% of conversations relate to exam anxiety. 
                  Consider organizing campus-wide stress management sessions during peak exam periods.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  <strong>Peer Support Expansion:</strong> High engagement in community features suggests students 
                  want more peer-to-peer connections. Consider adding group therapy sessions.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Counselor Capacity:</strong> Booking demand is up 25%. Consider adding 2-3 more 
                  counselors specialized in anxiety and depression.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Counselors Tab */}
        <TabsContent value="counselors" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Counselor Management</h3>
            <Button onClick={() => setShowAddCounselor(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Counselor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counselors.map((counselor) => (
              <Card key={counselor.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{counselor.name}</CardTitle>
                      <CardDescription>{counselor.email}</CardDescription>
                    </div>
                    <Badge variant={counselor.status === 'active' ? 'default' : 'secondary'}>
                      {counselor.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {counselor.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Rating: {counselor.rating}/5</span>
                    <span>{counselor.sessions_count} sessions</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteCounselor(counselor.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Counselor Form */}
          {showAddCounselor && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Counselor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={newCounselor.name || ''}
                    onChange={(e) => setNewCounselor(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={newCounselor.email || ''}
                    onChange={(e) => setNewCounselor(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <Textarea
                  placeholder="Bio and qualifications"
                  value={newCounselor.bio || ''}
                  onChange={(e) => setNewCounselor(prev => ({ ...prev, bio: e.target.value }))}
                />
                
                <div className="flex gap-2">
                  <Button onClick={handleAddCounselor}>Add Counselor</Button>
                  <Button variant="outline" onClick={() => setShowAddCounselor(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Content Management</h3>
            <Button onClick={() => setShowAddContent(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>

          <div className="space-y-4">
            {content.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge variant="secondary">{item.language}</Badge>
                        <Badge variant={item.status === 'published' ? 'default' : 'outline'}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Category: {item.category} • Created: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Content Form */}
          {showAddContent && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Content Title"
                    value={newContent.title || ''}
                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Select 
                    value={newContent.type || ''} 
                    onValueChange={(value) => setNewContent(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Category"
                    value={newContent.category || ''}
                    onChange={(e) => setNewContent(prev => ({ ...prev, category: e.target.value }))}
                  />
                  <Select 
                    value={newContent.language || 'en'} 
                    onValueChange={(value) => setNewContent(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ur">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddContent}>Add Content</Button>
                  <Button variant="outline" onClick={() => setShowAddContent(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation">
          <ForumModeration />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>Manage platform-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Crisis Detection</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically detect crisis indicators in conversations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tele-MANAS Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable direct connection to Tele-MANAS helpline
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Anonymous Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Collect anonymized usage data for platform improvement
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Forum Moderation</h4>
                    <p className="text-sm text-muted-foreground">
                      Auto-moderate peer support forum posts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Emergency Contacts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Tele-MANAS: 14416</span>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Emergency: 112</span>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}