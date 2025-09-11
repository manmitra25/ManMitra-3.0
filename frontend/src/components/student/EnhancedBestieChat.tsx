import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Heart, 
  Brain, 
  Shield,
  Clock,
  Lightbulb,
  Sparkles,
  BookOpen,
  Users,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { CrisisDetection } from '../CrisisManagement';
import { useAccessibility } from '../AccessibilityProvider';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bestie';
  timestamp: string;
  agent?: 'listener' | 'screener' | 'tone' | 'nudge' | 'crisis';
  suggestions?: string[];
  crisis_detected?: boolean;
  language?: string;
  emotion_detected?: string;
}

interface BestieAgent {
  id: string;
  name: string;
  role: string;
  icon: typeof Heart;
  description: string;
  active: boolean;
}

const BESTIE_AGENTS: BestieAgent[] = [
  {
    id: 'listener',
    name: 'Listener Agent',
    role: 'Active Listening',
    icon: Heart,
    description: 'Provides empathetic responses and emotional validation',
    active: true
  },
  {
    id: 'screener',
    name: 'Screener Agent',
    role: 'Mental Health Assessment',
    icon: Brain,
    description: 'Subtly assesses mental health through conversation',
    active: false
  },
  {
    id: 'tone',
    name: 'Tone Agent',
    role: 'Emotional Analysis',
    icon: Sparkles,
    description: 'Analyzes emotional tone and provides appropriate responses',
    active: false
  },
  {
    id: 'nudge',
    name: 'Nudge Agent',
    role: 'Behavioral Guidance',
    icon: Lightbulb,
    description: 'Suggests helpful activities and coping strategies',
    active: false
  },
  {
    id: 'crisis',
    name: 'Crisis Agent',
    role: 'Crisis Detection',
    icon: Shield,
    description: 'Monitors for crisis indicators and escalates when needed',
    active: true
  }
];

const TOPIC_PROMPTS = {
  'academic-stress': {
    en: "I understand academic pressure can be overwhelming. What specific aspect of your studies is causing you the most stress right now?",
    hi: "मैं समझ सकता हूं कि शैक्षणिक दबाव कितना कठिन हो सकता है। आपकी पढ़ाई का कौन सा हिस्सा अभी सबसे ज्यादा तनाव दे रहा है?",
    ur: "میں سمجھ سکتا ہوں کہ تعلیمی دباؤ کتنا مشکل ہو سکتا ہے۔ آپ کی پڑھائی کا کون سا حصہ اب سب سے زیادہ تناؤ کا باعث ہے؟"
  },
  'anxiety': {
    en: "Anxiety can feel really intense. You're brave for reaching out. Can you tell me what thoughts or situations trigger your anxiety the most?",
    hi: "चिंता वास्तव में तीव्र हो सकती है। मदद मांगने के लिए आप बहादुर हैं। क्या आप बता सकते हैं कि कौन से विचार या स्थितियां आपकी चिंता को सबसे ज्यादा बढ़ाती हैं?",
    ur: "اضطراب واقعی بہت شدید ہو سکتا ہے۔ مدد مانگنے کے لیے آپ بہادر ہیں۔ کیا آپ بتا سکتے ہیں کہ کون سے خیالات یا حالات آپ کی پریشانی کو سب سے زیادہ بڑھاتے ہیں؟"
  },
  'relationships': {
    en: "Relationships can be complex and challenging. I'm here to listen without judgment. What's been weighing on your mind?",
    hi: "रिश्ते जटिल और चुनौतीपूर्ण हो सकते हैं। मैं बिना किसी जजमेंट के यहां सुनने के लिए हूं। आपके मन में क्या बात है?",
    ur: "رشتے پیچیدہ اور مشکل ہو سکتے ہیں۔ میں بغیر کسی فیصلے کے یہاں سننے کے لیے ہوں۔ آپ کے دل میں کیا بات ہے؟"
  },
  'family-issues': {
    en: "Family dynamics can be really challenging, especially when you're trying to balance your own growth with family expectations. What's the most difficult part for you?",
    hi: "पारिवारिक रिश्ते वास्तव में चुनौतीपूर्ण हो सकते हैं, खासकर जब आप अपने विकास को परिवार की अपेक्षाओं के साथ संतुलित करने की कोशिश कर रहे हों। आपके लिए सबसे कठिन हिस्सा क्या है?",
    ur: "خاندانی رشتے واقعی مشکل ہو سکتے ہیں، خاص طور پر جب آپ اپنی ترقی کو خاندان کی توقعات کے ساتھ متوازن کرنے کی کوشش کر رہے ہوں۔ آپ کے لیے سب سے مشکل حصہ کیا ہے؟"
  },
  'lgbtq-support': {
    en: "Thank you for trusting me with this. Your identity is valid and you deserve support. How can I best help you today?",
    hi: "इसके साथ मुझ पर भरोसा करने के लिए धन्यवाद। आपकी पहचान वैध है और आप समर्थन के हकदार हैं। आज मैं आपकी सबसे अच्छी तरह से कैसे मदद कर सकता हूं?",
    ur: "اس کے ساتھ مجھ پر بھروسہ کرنے کے لیے شکریہ۔ آپ کی شناخت درست ہے اور آپ مدد کے حقدار ہیں۔ آج میں آپ کی بہترین مدد کیسے کر سکتا ہوں؟"
  },
  'self-improvement': {
    en: "I love that you're focused on growth! Self-improvement is a journey, not a destination. What area of your life would you like to work on?",
    hi: "मुझे खुशी है कि आप विकास पर ध्यान दे रहे हैं! आत्म-सुधार एक यात्रा है, मंजिल नहीं। आप अपने जीवन के किस क्षेत्र पर काम करना चाहते हैं?",
    ur: "مجھے خوشی ہے کہ آپ ترقی پر توجہ دے رہے ہیں! خود کو بہتر بنانا ایک سفر ہے، منزل نہیں۔ آپ اپنی زندگی کے کس حصے پر کام کرنا چاہتے ہیں؟"
  }
};

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'better off dead', 'harm myself',
  'खुदकुशी', 'मौत', 'खुद को नुकसान', 'जीना नहीं चाहता',
  'خودکشی', 'موت', 'نقصان', 'زندہ نہیں رہنا چاہتا'
];

interface EnhancedBestieChatProps {
  language: string;
  isAnonymous?: boolean;
  anonymousMessagesLeft?: number;
  onSignUpPrompt?: () => void;
}

export function EnhancedBestieChat({ 
  language, 
  isAnonymous = false, 
  anonymousMessagesLeft = 5,
  onSignUpPrompt 
}: EnhancedBestieChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeAgents, setActiveAgents] = useState<string[]>(['listener', 'crisis']);
  const [isRecording, setIsRecording] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectCrisis = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  };

  const simulateBestieResponse = async (userMessage: string, topic?: string): Promise<Message> => {
    setIsTyping(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const crisisDetected = detectCrisis(userMessage);
    
    if (crisisDetected) {
      setCrisisMessage(userMessage);
      setShowCrisisModal(true);
      setActiveAgents(prev => [...prev, 'crisis']);
    }

    // Simulate different agent responses based on content
    let agent: Message['agent'] = 'listener';
    let responseContent = '';
    let suggestions: string[] = [];

    if (crisisDetected) {
      agent = 'crisis';
      responseContent = "I hear that you're going through a really difficult time. Your feelings are valid, and I want you to know that you're not alone. Can we talk about what's been making you feel this way?";
      suggestions = [
        'Tell me more about what happened',
        'I want to talk to someone',
        'I need immediate help'
      ];
    } else if (userMessage.toLowerCase().includes('anxious') || userMessage.toLowerCase().includes('worried')) {
      agent = 'tone';
      responseContent = "I can sense you're feeling anxious right now. That must be really uncomfortable. Anxiety is our mind's way of trying to protect us, even when it doesn't feel helpful. What's been triggering these feelings?";
      suggestions = [
        'It started this morning',
        'It happens all the time',
        'I don\'t know why'
      ];
      setActiveAgents(prev => [...prev, 'tone']);
    } else if (userMessage.toLowerCase().includes('exam') || userMessage.toLowerCase().includes('study')) {
      agent = 'nudge';
      responseContent = "Exam stress is so common, and you're definitely not alone in feeling this way. Have you been able to take any breaks or do anything that helps you relax?";
      suggestions = [
        'I can\'t take breaks',
        'I tried but it doesn\'t help',
        'What kind of breaks?'
      ];
      setActiveAgents(prev => [...prev, 'nudge']);
    } else {
      responseContent = "Thank you for sharing that with me. I can tell this is important to you. Can you tell me more about how this has been affecting you?";
      suggestions = [
        'It affects my sleep',
        'I feel overwhelmed',
        'I don\'t know what to do'
      ];
    }

    setIsTyping(false);

    return {
      id: `msg_${Date.now()}`,
      content: responseContent,
      sender: 'bestie',
      timestamp: new Date().toISOString(),
      agent,
      suggestions,
      crisis_detected: crisisDetected,
      language: language,
      emotion_detected: crisisDetected ? 'distress' : userMessage.toLowerCase().includes('happy') ? 'positive' : 'neutral'
    };
  };

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date().toISOString(),
      language: language
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    announceToScreenReader(`You said: ${messageContent}`);

    // Check anonymous message limit
    if (isAnonymous && messages.length >= (anonymousMessagesLeft - 1)) {
      onSignUpPrompt?.();
      return;
    }

    // Generate Bestie response
    const bestieResponse = await simulateBestieResponse(messageContent, selectedTopic || undefined);
    setMessages(prev => [...prev, bestieResponse]);
    
    announceToScreenReader(`Bestie responded: ${bestieResponse.content}`);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    const prompt = TOPIC_PROMPTS[topic as keyof typeof TOPIC_PROMPTS];
    const localizedPrompt = prompt?.[language as keyof typeof prompt] || prompt?.en || "Hi! I'm here to listen. How are you feeling today?";
    
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      content: localizedPrompt,
      sender: 'bestie',
      timestamp: new Date().toISOString(),
      agent: 'listener',
      language: language
    };

    setMessages([welcomeMessage]);
    announceToScreenReader(`Topic selected: ${topic}. Bestie says: ${localizedPrompt}`);
  };

  const handleCrisisEscalation = (escalationData: any) => {
    setShowCrisisModal(false);
    // In real implementation, this would call the crisis management API
    console.log('Crisis escalated:', escalationData);
    announceToScreenReader('Crisis support has been activated. Help is on the way.');
  };

  const handleVoiceToggle = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(!isRecording);
      // Voice recognition implementation would go here
      announceToScreenReader(isRecording ? 'Voice recording stopped' : 'Voice recording started');
    }
  };

  const getAgentIcon = (agent?: string) => {
    const agentData = BESTIE_AGENTS.find(a => a.id === agent);
    if (!agentData) return <Heart className="h-3 w-3" />;
    const IconComponent = agentData.icon;
    return <IconComponent className="h-3 w-3" />;
  };

  if (!selectedTopic) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold mb-2">Chat with Bestie</h2>
          <p className="text-muted-foreground">
            Your AI mental health companion. Choose a topic to start our conversation.
          </p>
        </div>

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(TOPIC_PROMPTS).map((topic) => (
              <motion.div
                key={topic}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleTopicSelect(topic)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {topic === 'academic-stress' && <BookOpen className="h-5 w-5" />}
                      {topic === 'anxiety' && <Brain className="h-5 w-5" />}
                      {topic === 'relationships' && <Heart className="h-5 w-5" />}
                      {topic === 'family-issues' && <Users className="h-5 w-5" />}
                      {topic === 'lgbtq-support' && <Heart className="h-5 w-5 text-rainbow" />}
                      {topic === 'self-improvement' && <Sparkles className="h-5 w-5" />}
                      {topic.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {topic === 'academic-stress' && 'Feeling overwhelmed with studies, exams, or academic pressure?'}
                      {topic === 'anxiety' && 'Experiencing worry, panic, or anxious thoughts?'}
                      {topic === 'relationships' && 'Navigating friendships, romantic relationships, or social connections?'}
                      {topic === 'family-issues' && 'Dealing with family expectations, conflicts, or dynamics?'}
                      {topic === 'lgbtq-support' && 'Seeking support for LGBTQ+ identity and experiences?'}
                      {topic === 'self-improvement' && 'Working on personal growth, habits, or self-development?'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Anonymous Trial Banner */}
        {isAnonymous && (
          <div className="p-4 bg-accent border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">Anonymous trial: {anonymousMessagesLeft} messages left</span>
              </div>
              <Button size="sm" onClick={onSignUpPrompt}>
                Sign up for unlimited access
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-success/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Bestie</h3>
              <p className="text-xs text-muted-foreground">
                {selectedTopic.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Support
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeAgents.map(agentId => {
              const agent = BESTIE_AGENTS.find(a => a.id === agentId);
              return agent ? (
                <Badge key={agentId} variant="outline" className="text-xs">
                  {getAgentIcon(agentId)}
                  <span className="ml-1">{agent.name.split(' ')[0]}</span>
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] space-y-2 ${
                message.sender === 'user' 
                  ? 'order-2' 
                  : 'order-1'
              }`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.agent && message.sender === 'bestie' && (
                    <div className="flex items-center gap-1 mt-2 opacity-70">
                      {getAgentIcon(message.agent)}
                      <span className="text-xs">
                        {BESTIE_AGENTS.find(a => a.id === message.agent)?.role}
                      </span>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={language === 'hi' ? 'अपने विचार साझा करें...' : 
                         language === 'ur' ? 'اپنے خیالات شیئر کریں...' : 
                         'Share your thoughts...'}
              rows={1}
              className="resize-none pr-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={handleVoiceToggle}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
            >
              {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            </Button>
          </div>
          <Button 
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            size="icon"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Anonymous Trial Counter */}
        {isAnonymous && (
          <div className="mt-2 text-center">
            <span className="text-xs text-muted-foreground">
              {anonymousMessagesLeft - Math.floor(messages.length / 2)} messages left in trial
            </span>
          </div>
        )}
      </div>

      {/* Crisis Detection Modal */}
      <CrisisDetection
        isActive={showCrisisModal}
        onEscalate={handleCrisisEscalation}
        onDismiss={() => setShowCrisisModal(false)}
        message="I noticed some concerning language in our conversation. Let's make sure you get the support you need."
        severity="high"
      />
    </div>
  );
}