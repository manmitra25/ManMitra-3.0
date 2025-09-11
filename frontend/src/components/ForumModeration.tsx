import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  AlertTriangle, 
  Flag, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Shield,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  category: string;
  replies: number;
  flagged: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'escalated';
  toxicityScore: number;
  reasons: string[];
  reportCount: number;
}

interface ModerationAction {
  id: string;
  postId: string;
  action: 'approve' | 'reject' | 'escalate' | 'edit';
  reason: string;
  moderator: string;
  timestamp: string;
}

// Toxicity detection keywords for different languages
const TOXICITY_PATTERNS = {
  en: {
    high: ['suicide', 'kill myself', 'harm myself', 'end it all', 'worthless'],
    medium: ['hate', 'stupid', 'pathetic', 'loser', 'failure'],
    low: ['annoying', 'weird', 'strange']
  },
  hi: {
    high: ['खुदकुशी', 'मौत', 'खुद को नुकसान'],
    medium: ['बेवकूफ', 'नालायक', 'असफल'],
    low: ['अजीब', 'परेशान']
  },
  ur: {
    high: ['خودکشی', 'موت', 'نقصان'],
    medium: ['بیوقوف', 'ناکام', 'غلط'],
    low: ['عجیب', 'پریشان']
  }
};

const MODERATION_REASONS = [
  'Inappropriate content',
  'Spam or promotional',
  'Personal attacks',
  'Self-harm content',
  'Misinformation',
  'Off-topic discussion',
  'Privacy violations',
  'Cultural insensitivity'
];

// Mock forum posts for demonstration
const MOCK_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    title: 'Dealing with exam stress',
    content: 'Has anyone found good ways to manage the pressure during exam season? I feel overwhelmed...',
    author: 'Student_A',
    timestamp: '2024-01-15T10:30:00Z',
    category: 'Academic Stress',
    replies: 12,
    flagged: false,
    moderationStatus: 'approved',
    toxicityScore: 0.1,
    reasons: [],
    reportCount: 0
  },
  {
    id: 'post-2',
    title: 'Family pressure is too much',
    content: 'Sometimes I think everyone would be better off without me. The expectations are crushing and I cannot take it anymore.',
    author: 'Student_B',
    timestamp: '2024-01-15T11:45:00Z',
    category: 'Family Issues',
    replies: 5,
    flagged: true,
    moderationStatus: 'escalated',
    toxicityScore: 0.8,
    reasons: ['Self-harm indicators', 'Crisis language'],
    reportCount: 3
  },
  {
    id: 'post-3',
    title: 'LGBTQ+ support groups',
    content: 'Are there any LGBTQ+ friendly support groups on campus? Looking for a safe space to connect.',
    author: 'Student_C',
    timestamp: '2024-01-15T14:20:00Z',
    category: 'LGBTQ+ Support',
    replies: 8,
    flagged: false,
    moderationStatus: 'approved',
    toxicityScore: 0.05,
    reasons: [],
    reportCount: 0
  }
];

export function ForumModeration() {
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_POSTS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [moderationNotes, setModerationNotes] = useState<Record<string, string>>({});

  // Toxicity detection function
  const detectToxicity = (text: string, language: 'en' | 'hi' | 'ur' = 'en'): { score: number; reasons: string[] } => {
    const patterns = TOXICITY_PATTERNS[language];
    const reasons: string[] = [];
    let score = 0;

    const lowerText = text.toLowerCase();

    // Check high-risk patterns
    patterns.high.forEach(pattern => {
      if (lowerText.includes(pattern.toLowerCase())) {
        score += 0.3;
        reasons.push('High-risk language detected');
      }
    });

    // Check medium-risk patterns
    patterns.medium.forEach(pattern => {
      if (lowerText.includes(pattern.toLowerCase())) {
        score += 0.2;
        reasons.push('Potentially harmful language');
      }
    });

    // Check low-risk patterns
    patterns.low.forEach(pattern => {
      if (lowerText.includes(pattern.toLowerCase())) {
        score += 0.1;
        reasons.push('Mild concern');
      }
    });

    return { score: Math.min(score, 1), reasons };
  };

  const handleModerationAction = (postId: string, action: 'approve' | 'reject' | 'escalate', reason: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, moderationStatus: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'escalated' }
        : post
    ));

    // In real implementation, this would call the backend API
    console.log(`Moderation action: ${action} for post ${postId} with reason: ${reason}`);
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 0.7) return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 0.4) return <Badge variant="secondary">Medium Risk</Badge>;
    if (score >= 0.2) return <Badge variant="outline">Low Risk</Badge>;
    return <Badge variant="secondary">Clean</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'escalated': return <Badge variant="secondary" className="bg-warning text-warning-foreground">Escalated</Badge>;
      case 'pending': return <Badge variant="outline">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'flagged') return post.flagged || post.toxicityScore >= 0.4;
    if (filterStatus === 'pending') return post.moderationStatus === 'pending';
    if (filterStatus === 'escalated') return post.moderationStatus === 'escalated';
    return post.moderationStatus === filterStatus;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.moderationStatus === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Posts</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {posts.filter(p => p.flagged || p.toxicityScore >= 0.4).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {posts.filter(p => p.moderationStatus === 'escalated').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="flagged">Flagged Posts</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts match the current filter</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{post.title}</h4>
                      {post.flagged && <Flag className="h-4 w-4 text-warning" />}
                      {getSeverityBadge(post.toxicityScore)}
                      {getStatusBadge(post.moderationStatus)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>By {post.author}</span>
                      <span>{formatTimestamp(post.timestamp)}</span>
                      <span>{post.category}</span>
                      <span>{post.replies} replies</span>
                      {post.reportCount > 0 && (
                        <span className="text-warning">{post.reportCount} reports</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    
                    {post.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.reasons.map((reason, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {post.moderationStatus === 'pending' && (
                  <div className="space-y-3 border-t pt-3">
                    <Textarea
                      placeholder="Add moderation notes..."
                      value={moderationNotes[post.id] || ''}
                      onChange={(e) => setModerationNotes(prev => ({
                        ...prev,
                        [post.id]: e.target.value
                      }))}
                      rows={2}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleModerationAction(post.id, 'approve', moderationNotes[post.id] || 'Approved')}
                        className="bg-success hover:bg-success/90 text-success-foreground"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleModerationAction(post.id, 'reject', moderationNotes[post.id] || 'Rejected')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      
                      {post.toxicityScore >= 0.4 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModerationAction(post.id, 'escalate', moderationNotes[post.id] || 'Escalated for review')}
                          className="border-warning text-warning hover:bg-warning/10"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Escalate
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {post.moderationStatus === 'escalated' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This post has been escalated for manual review due to high-risk content.
                      Please contact the crisis management team if immediate intervention is needed.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Auto-moderation hook for real-time content checking
export function useAutoModeration() {
  const checkContent = (content: string, language: 'en' | 'hi' | 'ur' = 'en') => {
    const patterns = TOXICITY_PATTERNS[language];
    const lowerContent = content.toLowerCase();
    
    let flags: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';
    
    // Check for high-risk patterns
    patterns.high.forEach(pattern => {
      if (lowerContent.includes(pattern.toLowerCase())) {
        flags.push(`High-risk language: "${pattern}"`);
        severity = 'high';
      }
    });
    
    // Check for medium-risk patterns
    if (severity !== 'high') {
      patterns.medium.forEach(pattern => {
        if (lowerContent.includes(pattern.toLowerCase())) {
          flags.push(`Potentially harmful: "${pattern}"`);
          if (severity === 'low') severity = 'medium';
        }
      });
    }
    
    return {
      flagged: flags.length > 0,
      severity,
      flags,
      requiresReview: severity === 'high',
      autoReject: false // Conservative approach - human review for all flagged content
    };
  };

  return { checkContent };
}