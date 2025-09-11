import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Heart, 
  Shield, 
  Clock,
  ExternalLink,
  CheckCircle,
  User,
  Calendar
} from 'lucide-react';

interface CrisisDetectionProps {
  isActive: boolean;
  onEscalate: (escalationData: EscalationData) => void;
  onDismiss: () => void;
  message?: string;
  severity?: 'low' | 'medium' | 'high';
}

interface EscalationData {
  shareChat: boolean;
  contactMethod: 'emergency' | 'counselor' | 'telemanas';
  notes: string;
  consentGiven: boolean;
}

interface TelemanasCenterInfo {
  id: string;
  name: string;
  phone: string;
  address: string;
  languages: string[];
  availability: string;
  specialties: string[];
}

// Mock Tele-MANAS centers data for J&K region
const TELEMANAS_CENTERS: TelemanasCenterInfo[] = [
  {
    id: 'jk-srinagar',
    name: 'Tele-MANAS Srinagar Center',
    phone: '14416',
    address: 'Government Medical College, Srinagar, J&K',
    languages: ['English', 'Hindi', 'Urdu', 'Kashmiri'],
    availability: '24/7',
    specialties: ['Crisis Intervention', 'Trauma Counseling', 'Youth Mental Health']
  },
  {
    id: 'jk-jammu',
    name: 'Tele-MANAS Jammu Center', 
    phone: '14416',
    address: 'Government Medical College, Jammu, J&K',
    languages: ['English', 'Hindi', 'Urdu', 'Dogri'],
    availability: '24/7',
    specialties: ['Emergency Response', 'Family Therapy', 'Substance Abuse']
  }
];

const EMERGENCY_CONTACTS = [
  {
    name: 'Tele-MANAS National Helpline',
    number: '14416',
    description: '24/7 mental health crisis support',
    type: 'telemanas' as const
  },
  {
    name: 'National Emergency Services',
    number: '112',
    description: 'General emergency helpline',
    type: 'emergency' as const
  },
  {
    name: 'KIRAN Mental Health Helpline',
    number: '1800-599-0019',
    description: '24/7 toll-free mental health support',
    type: 'telemanas' as const
  },
  {
    name: 'Vandrevala Foundation Helpline',
    number: '9999666555',
    description: '24/7 crisis intervention and mental health support',
    type: 'telemanas' as const
  }
];

export function CrisisDetection({ 
  isActive, 
  onEscalate, 
  onDismiss, 
  message, 
  severity = 'high' 
}: CrisisDetectionProps) {
  const [escalationData, setEscalationData] = useState<EscalationData>({
    shareChat: false,
    contactMethod: 'telemanas',
    notes: '',
    consentGiven: false
  });

  const [showCenters, setShowCenters] = useState(false);

  const handleEscalate = () => {
    if (escalationData.consentGiven) {
      onEscalate(escalationData);
    }
  };

  const handleEmergencyCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-destructive/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
          <Card className="border-destructive shadow-2xl">
            <CardHeader className="bg-destructive/5 border-b border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
                </div>
                <div>
                  <CardTitle className="text-destructive">Crisis Detection</CardTitle>
                  <CardDescription>
                    We detected that you might need immediate support
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Crisis Message */}
              <Alert variant="destructive">
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  {message || "Your safety is our priority. You're not alone, and help is available."}
                </AlertDescription>
              </Alert>

              {/* Immediate Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Immediate Support:</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {EMERGENCY_CONTACTS.map((contact) => (
                    <Button
                      key={contact.number}
                      onClick={() => handleEmergencyCall(contact.number)}
                      className="justify-start h-auto p-3 bg-destructive hover:bg-destructive/90"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{contact.name}</div>
                          <div className="text-xs opacity-90">{contact.description}</div>
                        </div>
                        <div className="font-mono text-sm">{contact.number}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tele-MANAS Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Tele-MANAS Centers</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCenters(!showCenters)}
                  >
                    {showCenters ? 'Hide' : 'Show'} Centers
                  </Button>
                </div>

                {showCenters && (
                  <div className="space-y-2">
                      {TELEMANAS_CENTERS.map((center) => (
                        <Card key={center.id} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm">{center.name}</h5>
                              <Badge variant="secondary">{center.availability}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{center.address}</p>
                            <div className="flex flex-wrap gap-1">
                              {center.languages.map((lang) => (
                                <Badge key={lang} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              onClick={() => handleEmergencyCall(center.phone)}
                              size="sm"
                              className="w-full"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call {center.phone}
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </div>

              {/* Escalation Options */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-sm">Professional Support Options:</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share-chat"
                      checked={escalationData.shareChat}
                      onCheckedChange={(checked) =>
                        setEscalationData(prev => ({ ...prev, shareChat: !!checked }))
                      }
                    />
                    <label
                      htmlFor="share-chat"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Share my chat history with counselor (helps provide better support)
                    </label>
                  </div>

                  <Textarea
                    placeholder="Add any additional notes that might help the counselor understand your situation..."
                    value={escalationData.notes}
                    onChange={(e) =>
                      setEscalationData(prev => ({ ...prev, notes: e.target.value }))
                    }
                    rows={3}
                  />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consent"
                      checked={escalationData.consentGiven}
                      onCheckedChange={(checked) =>
                        setEscalationData(prev => ({ ...prev, consentGiven: !!checked }))
                      }
                    />
                    <label
                      htmlFor="consent"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I consent to connect with a mental health professional
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleEscalate}
                  disabled={!escalationData.consentGiven}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Connect with Counselor
                </Button>
                <Button
                  onClick={onDismiss}
                  variant="outline"
                >
                  I'm Safe Now
                </Button>
              </div>

              {/* Privacy Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your privacy is protected. Information is only shared with your explicit consent 
                  and used solely to provide appropriate mental health support.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

// Crisis Alert Component for Counselors
interface CrisisAlert {
  id: string;
  studentId: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  message: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  chatHistory?: boolean;
  notes?: string;
}

interface CrisisAlertCardProps {
  alert: CrisisAlert;
  onAcknowledge: (alertId: string, action: string) => void;
  onResolve: (alertId: string, notes: string) => void;
}

export function CrisisAlertCard({ alert, onAcknowledge, onResolve }: CrisisAlertCardProps) {
  const [resolveNotes, setResolveNotes] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div
        className={`border rounded-lg p-4 space-y-3 ${
          alert.severity === 'high' ? 'border-destructive bg-destructive/5' : 
          alert.severity === 'medium' ? 'border-warning bg-warning/5' : 
          'border-border'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              alert.severity === 'high' ? 'bg-destructive' :
              alert.severity === 'medium' ? 'bg-warning' :
              'bg-secondary'
            }`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Student {alert.studentId.slice(-6)}</span>
                <Badge variant={getSeverityColor(alert.severity) as any}>
                  {alert.severity.toUpperCase()}
                </Badge>
                {alert.status === 'acknowledged' && (
                  <Badge variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Acknowledged
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(alert.timestamp)}</span>
                {alert.chatHistory && (
                  <>
                    <MessageSquare className="h-3 w-3 ml-2" />
                    <span>Chat history available</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {alert.message}
        </p>

        {alert.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onAcknowledge(alert.id, 'acknowledge')}
              className="flex-1"
            >
              <User className="h-3 w-3 mr-1" />
              Take Case
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge(alert.id, 'schedule')}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Schedule
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleEmergencyCall('14416')}
            >
              <Phone className="h-3 w-3 mr-1" />
              Escalate
            </Button>
          </div>
        )}

        {alert.status === 'acknowledged' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowResolveDialog(true)}
              variant="outline"
              className="flex-1"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark Resolved
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleEmergencyCall('14416')}
            >
              <Phone className="h-3 w-3 mr-1" />
              Emergency
            </Button>
          </div>
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Crisis Alert</DialogTitle>
            <DialogDescription>
              Please provide notes about how this crisis was resolved.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the actions taken and current status of the student..."
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              rows={4}
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onResolve(alert.id, resolveNotes);
                  setShowResolveDialog(false);
                  setResolveNotes('');
                }}
                className="flex-1"
                disabled={!resolveNotes.trim()}
              >
                Resolve Alert
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResolveDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function for emergency calls
function handleEmergencyCall(number: string) {
  window.open(`tel:${number}`, '_self');
}