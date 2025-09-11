import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { MessageCircle, Send, Mic, Heart, Shield, AlertTriangle, Phone, BookOpen } from 'lucide-react';
import { CrisisDetection } from '../CrisisManagement';
import { useAuth } from '../auth/AuthProvider';
import webSocketService from '../../services/websocket';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bestie';
  timestamp: Date;
  agent?: 'listener' | 'screener' | 'tone' | 'nudge';
  crisisDetected?: boolean;
  crisisLevel?: string;
}

interface Topic {
  id: string;
  title: string;
  icon: string;
  gradient: string;
}

const translations = {
  en: {
    selectTopic: "What would you like to talk about?",
    topics: [
      { id: 'academic', title: 'Academic Stress', icon: '📚', gradient: 'from-blue-500 to-indigo-500' },
      { id: 'anxiety', title: 'Anxiety & Worry', icon: '😰', gradient: 'from-yellow-500 to-orange-500' },
      { id: 'relationships', title: 'Relationships', icon: '💕', gradient: 'from-pink-500 to-rose-500' },
      { id: 'lgbtq', title: 'LGBTQIA+ Support', icon: '🏳️‍🌈', gradient: 'from-purple-500 to-pink-500' },
      { id: 'family', title: 'Family Issues', icon: '👨‍👩‍👧‍👦', gradient: 'from-green-500 to-teal-500' },
      { id: 'self-improvement', title: 'Self Improvement', icon: '🌱', gradient: 'from-emerald-500 to-green-500' },
      { id: 'isolation', title: 'Loneliness', icon: '😔', gradient: 'from-slate-500 to-gray-500' },
      { id: 'other', title: 'Something Else', icon: '💭', gradient: 'from-indigo-500 to-purple-500' }
    ],
    placeholder: "Type your thoughts...",
    quickReplies: ["I'm anxious 😟", "Feeling overwhelmed", "Need someone to talk", "I'm okay today 😊"],
    anonymousCounter: "messages left ✨",
    continueJourney: "Continue your journey?",
    signUpPrompt: "Sign up in seconds to keep chatting",
    signUp: "Sign Up",
    bestieTyping: "Bestie is typing...",
    listeningAgent: "Listening 💙",
    screeningAgent: "Understanding 🤝",
    toneAgent: "Caring 💚",
    crisisDetected: "I sense urgency",
    crisisMessage: "I'm here for you. Can I connect you to a counselor?",
    shareData: "Share chat summary?",
    callHelpline: "Call Tele-MANAS 104",
    bookCounselor: "Book Counselor",
    followUp: "How did my suggestion help?",
    helpful: "It helped!",
    notHelpful: "Not quite",
    voiceNote: "Voice message"
  },
  hi: {
    selectTopic: "आप किस बारे में बात करना चाहेंगे?",
    topics: [
      { id: 'academic', title: 'शैक्षणिक तनाव', icon: '📚', gradient: 'from-blue-500 to-indigo-500' },
      { id: 'anxiety', title: 'चिंता और बेचैनी', icon: '😰', gradient: 'from-yellow-500 to-orange-500' },
      { id: 'relationships', title: 'रिश्ते', icon: '💕', gradient: 'from-pink-500 to-rose-500' },
      { id: 'lgbtq', title: 'LGBTQIA+ सहायता', icon: '🏳️‍🌈', gradient: 'from-purple-500 to-pink-500' },
      { id: 'family', title: 'पारिवारिक समस्याएं', icon: '👨‍👩‍👧‍👦', gradient: 'from-green-500 to-teal-500' },
      { id: 'self-improvement', title: 'आत्म सुधार', icon: '🌱', gradient: 'from-emerald-500 to-green-500' },
      { id: 'isolation', title: 'अकेलापन', icon: '😔', gradient: 'from-slate-500 to-gray-500' },
      { id: 'other', title: 'कुछ और', icon: '💭', gradient: 'from-indigo-500 to-purple-500' }
    ],
    placeholder: "अपने विचार लिखें...",
    quickReplies: ["मैं चिंतित हूँ 😟", "बहुत दबाव महसूस कर रहा हूँ", "किसी से बात करने की जरूरत", "आज मैं ठीक हूँ 😊"],
    anonymousCounter: "संदेश बचे हैं ✨",
    continueJourney: "अपनी यात्रा जारी रखें?",
    signUpPrompt: "चैट जारी रखने के लिए कुछ सेकंड में साइन अप करें",
    signUp: "साइन अप करें",
    bestieTyping: "बेस्टी टाइप कर रहा है...",
    listeningAgent: "सुन रहा है 💙",
    screeningAgent: "समझ रहा है 🤝",
    toneAgent: "देखभाल कर रहा है 💚",
    crisisDetected: "मुझे तात्कालिकता का एहसास है",
    crisisMessage: "मैं आपके लिए यहाँ हूँ। क्या मैं आपको एक काउंसलर से जोड़ सकूँ?",
    shareData: "चैट सारांश साझा करें?",
    callHelpline: "टेली-मानस 104 पर कॉल करें",
    bookCounselor: "काउंसलर बुक करें",
    followUp: "मेरे सुझाव से कैसी मदद मिली?",
    helpful: "मदद मिली!",
    notHelpful: "बिल्कुल नहीं",
    voiceNote: "आवाज़ संदेश"
  },
  ur: {
    selectTopic: "آپ کس بارے میں بات کرنا چاہیں گے؟",
    topics: [
      { id: 'academic', title: 'تعلیمی تناؤ', icon: '📚', gradient: 'from-blue-500 to-indigo-500' },
      { id: 'anxiety', title: 'بے چینی اور فکر', icon: '😰', gradient: 'from-yellow-500 to-orange-500' },
      { id: 'relationships', title: 'رشتے', icon: '💕', gradient: 'from-pink-500 to-rose-500' },
      { id: 'lgbtq', title: 'LGBTQIA+ مدد', icon: '🏳️‍🌈', gradient: 'from-purple-500 to-pink-500' },
      { id: 'family', title: 'خاندانی مسائل', icon: '👨‍👩‍👧‍👦', gradient: 'from-green-500 to-teal-500' },
      { id: 'self-improvement', title: 'خود بہتری', icon: '🌱', gradient: 'from-emerald-500 to-green-500' },
      { id: 'isolation', title: 'تنہائی', icon: '😔', gradient: 'from-slate-500 to-gray-500' },
      { id: 'other', title: 'کچھ اور', icon: '💭', gradient: 'from-indigo-500 to-purple-500' }
    ],
    placeholder: "اپنے خیالات ٹائپ کریں...",
    quickReplies: ["میں پریشان ہوں 😟", "بہت دباؤ محسوس کر رہا ہوں", "کسی سے بات کرنے کی ضرورت", "آج میں ٹھیک ہوں 😊"],
    anonymousCounter: "پیغامات باقی ہیں ✨",
    continueJourney: "اپنا سفر جاری رکھیں؟",
    signUpPrompt: "چیٹ جاری رکھنے کے لیے چند سیکنڈ میں سائن اپ کریں",
    signUp: "سائن اپ کریں",
    bestieTyping: "بیسٹی ٹائپ کر رہا ہے...",
    listeningAgent: "سن رہا ہے 💙",
    screeningAgent: "سمجھ رہا ہے 🤝",
    toneAgent: "خیال رکھ رہا ہے 💚",
    crisisDetected: "مجھے فوری ضرورت کا احساس ہے",
    crisisMessage: "میں آپ کے لیے یہاں ہوں۔ کیا میں آپ کو مشیر سے جوڑ سکوں؟",
    shareData: "چیٹ خلاصہ شیئر کریں؟",
    callHelpline: "ٹیلی مانس 104 پر کال کریں",
    bookCounselor: "مشیر بک کریں",
    followUp: "میری تجویز سے کیسی مدد ملی؟",
    helpful: "مدد ملی!",
    notHelpful: "بالکل نہیں",
    voiceNote: "آواز کا پیغام"
  }
};

interface BestieChatProps {
  language: string;
  isAnonymous?: boolean;
  anonymousMessagesLeft?: number;
  onSignUpPrompt?: () => void;
  onCrisisDetected?: (crisisLevel: string, message: string) => void;
}

export function BestieChat({ 
  language, 
  isAnonymous = true,
  anonymousMessagesLeft = 5,
  onSignUpPrompt,
  onCrisisDetected
}: BestieChatProps) {
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = translations[language as keyof typeof translations] || translations.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection and listeners
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        if (!webSocketService.isConnected()) {
          await webSocketService.connect(user?.id);
        }

        // Listen for Bestie responses
        webSocketService.on('bestie-response', (data) => {
          const bestieMessage: Message = {
            id: Date.now().toString() + '_ws',
            content: data.response,
            sender: 'bestie',
            timestamp: new Date(),
            agent: data.agent as 'listener' | 'screener' | 'tone' | 'nudge',
            crisisDetected: data.crisisDetected
          };

          setMessages(prev => [...prev, bestieMessage]);
          setIsTyping(false);
        });

        // Listen for crisis alerts
        webSocketService.on('crisis-alert', (data) => {
          setShowCrisisDialog(true);
          onCrisisDetected?.(data.severity, 'Crisis detected in chat');
        });

        // Listen for login requests (anonymous limit reached)
        webSocketService.on('request-login', (data) => {
          onSignUpPrompt?.();
        });

      } catch (error) {
        console.warn('WebSocket initialization failed, will use HTTP fallback:', error);
        // Don't set offline mode immediately, let HTTP API work
      }
    };

    if (selectedTopic) {
      initWebSocket();
    }

    return () => {
      // Cleanup WebSocket listeners
      if (webSocketService.isConnected()) {
        webSocketService.off('bestie-response', () => {});
        webSocketService.off('crisis-alert', () => {});
        webSocketService.off('request-login', () => {});
      }
    };
  }, [selectedTopic, user?.id]);

  const handleTopicSelect = async (topicId: string) => {
    setSelectedTopic(topicId);
    const topic = t.topics.find(t => t.id === topicId);
    
    try {
      // Start chat session with backend
      const { api } = await import('../../services/api');
      const response = await api.post('/chat/start-session', {
        topic: topicId,
        language: language || 'en',
        isAnonymous: isAnonymous
      });
      
      const sessionData = response.data.data;
      setSessionId(sessionData.sessionId);
      
      // Add initial Bestie message
      const initialMessage: Message = {
        id: sessionData.sessionId + '_initial',
        content: sessionData.initialMessage || `I'm here to listen and support you with ${topic?.title.toLowerCase()}. What's on your mind? 💙`,
        sender: 'bestie',
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
      
    } catch (error) {
      console.error('Error starting chat session:', error);
      
      // Fallback to offline mode only if truly necessary
      const fallbackSessionId = `session_${Date.now()}`;
      setSessionId(fallbackSessionId);
      
      // Only set offline mode if the network is actually offline
      if (!navigator.onLine) {
        setIsOfflineMode(true);
        console.log('🔌 Network is offline, using offline mode');
      } else {
        console.log('🔄 Session creation failed but network is online, will try HTTP fallback for messages');
      }
      
      const initialMessage: Message = {
        id: '1',
        content: `I'm here to listen and support you with ${topic?.title.toLowerCase()}. What's on your mind? 💙`,
        sender: 'bestie',
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
    }
  };

  const simulateBestieResponse = (userMessage: string): Message => {
    const responses = {
      anxiety: [
        "I hear that you're feeling anxious. That's completely valid, and you're not alone in this. Can you tell me more about what's making you feel this way? 🤗",
        "It sounds like you're going through a tough time. Remember, anxiety is treatable and you have the strength to get through this. What usually helps you feel calmer? 💚"
      ],
      academic: [
        "Academic pressure can feel overwhelming sometimes. You're doing your best, and that's what matters. What specific aspect of your studies is causing you the most stress? 📚",
        "I understand how challenging academic life can be. Remember, your worth isn't defined by your grades. Let's talk about some coping strategies that might help. 🌟"
      ],
      general: [
        "Thank you for sharing that with me. Your feelings are valid, and I'm here to support you. Can you tell me more about how you're feeling right now? 💙",
        "I'm listening and I care about what you're going through. Sometimes just talking about our feelings can help. What's the most important thing you'd like me to know? 🤗"
      ]
    };

    let responseArray = responses.general;
    if (userMessage.toLowerCase().includes('anxiety') || userMessage.toLowerCase().includes('anxious') || userMessage.toLowerCase().includes('worried')) {
      responseArray = responses.anxiety;
    } else if (userMessage.toLowerCase().includes('study') || userMessage.toLowerCase().includes('exam') || userMessage.toLowerCase().includes('academic')) {
      responseArray = responses.academic;
    }

    const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
    
    // Enhanced crisis detection with multilingual support
    const crisisKeywords = {
      high: ['suicide', 'kill myself', 'end it all', 'harm myself', 'खुदकुशी', 'मौत', 'خودکشی', 'موت'],
      medium: ['worthless', 'hopeless', 'no point', 'give up', 'बेकार', 'نااُمید'],
      low: ['very sad', 'depressed', 'can\'t cope', 'बहुत दुखी', 'پریشان']
    };
    
    const lowerMessage = userMessage.toLowerCase();
    let crisisLevel: 'high' | 'medium' | 'low' | null = null;
    
    if (crisisKeywords.high.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
      crisisLevel = 'high';
    } else if (crisisKeywords.medium.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
      crisisLevel = 'medium';
    } else if (crisisKeywords.low.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
      crisisLevel = 'low';
    }

    if (crisisLevel) {
      setTimeout(() => setShowCrisisDialog(true), 1000);
    }

    return {
      id: Date.now().toString(),
      content: randomResponse,
      sender: 'bestie',
      timestamp: new Date(),
      agent: Math.random() > 0.5 ? 'listener' : 'tone'
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageContent = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setMessagesCount(prev => prev + 1);

    // Check if anonymous user reached limit
    if (isAnonymous && messagesCount + 1 >= anonymousMessagesLeft) {
      setTimeout(() => {
        onSignUpPrompt?.();
      }, 2000);
      return;
    }

    // Show typing indicator
    setIsTyping(true);

    try {
      // Try WebSocket first if connected
      if (webSocketService.isConnected() && sessionId) {
        webSocketService.sendChatMessage(sessionId, messageContent, language);
        setIsTyping(true);
        return; // Response will come via WebSocket
      }
      
      // Fallback to direct API call via Node.js backend
      const { api } = await import('../../services/api');
      
      console.log('Sending message to backend:', messageContent);
      
      const response = await api.post('/chat/send-message', {
        sessionId: sessionId,
        message: messageContent,
        language: language || 'en'
      });

      console.log('Backend response:', response.data);
      const backendResponse = response.data;
      
      if (backendResponse.success && backendResponse.data) {
        const aiResponse = backendResponse.data;
        
        const bestieMessage: Message = {
          id: Date.now().toString() + '_ai',
          content: aiResponse.response,
          sender: 'bestie',
          timestamp: new Date(),
          agent: aiResponse.agent || 'listener',
          crisisDetected: aiResponse.crisisDetected || false,
          crisisLevel: aiResponse.crisisLevel
        };

        setMessages(prev => [...prev, bestieMessage]);

        // Handle crisis detection
        if (aiResponse.crisisDetected && aiResponse.crisisLevel) {
          setShowCrisisDialog(true);
          onCrisisDetected?.(aiResponse.crisisLevel, messageContent);
        }
      } else {
        throw new Error(backendResponse.message || 'Failed to get response from backend');
      }

    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Try direct FastAPI call as fallback before going offline
      try {
        console.log('Trying FastAPI direct call as fallback...');
        const { aiApi } = await import('../../services/api');
        
        const aiResponse = await aiApi.post('/chat/ask', {
          message: messageContent,
          history: messages.slice(-10).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          user_id: null,
          locale: language || 'en',
          session_id: sessionId
        });
        
        console.log('FastAPI fallback response:', aiResponse.data);
        
        const bestieMessage: Message = {
          id: Date.now().toString() + '_fastapi',
          content: aiResponse.data.response,
          sender: 'bestie',
          timestamp: new Date(),
          agent: aiResponse.data.agent || 'listener',
          crisisDetected: aiResponse.data.crisis_detected || false,
          crisisLevel: aiResponse.data.crisis_level
        };
        
        setMessages(prev => [...prev, bestieMessage]);
        
        // Handle crisis detection
        if (aiResponse.data.crisis_detected && aiResponse.data.crisis_level) {
          setShowCrisisDialog(true);
          onCrisisDetected?.(aiResponse.data.crisis_level, messageContent);
        }
        
      } catch (fallbackError) {
        console.error('FastAPI fallback also failed:', fallbackError);
        
        // Only now go to offline mode
        if (!navigator.onLine) {
          setIsOfflineMode(true);
          console.log('🔌 Network is offline, using cached response');
        } else {
          console.log('⚠️ API calls failed but network is online, using fallback response');
        }
        
        // Use simulated response as last resort
        const offlineResponse = simulateBestieResponse(messageContent);
        setMessages(prev => [...prev, offlineResponse]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const getAgentIndicator = (agent?: string) => {
    switch (agent) {
      case 'listener':
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-600">{t.listeningAgent}</Badge>;
      case 'screener':
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-600">{t.screeningAgent}</Badge>;
      case 'tone':
        return <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-600">{t.toneAgent}</Badge>;
      default:
        return null;
    }
  };

  if (!selectedTopic) {
    return (
      <div className="p-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl mb-2">Bestie</h2>
          <p className="text-muted-foreground">{t.selectTopic}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.topics.map((topic, index) => (
            <div key={topic.id}>
              <Card 
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 text-center"
                onClick={() => handleTopicSelect(topic.id)}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${topic.gradient} flex items-center justify-center mx-auto mb-3 text-xl`}>
                  {topic.icon}
                </div>
                <h3 className="font-medium">{topic.title}</h3>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-success/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium">Bestie</h3>
              <p className="text-sm text-muted-foreground">
                Always here for you {isOfflineMode && '(Offline Mode)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOfflineMode && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                  Offline Mode
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOfflineMode(false);
                    console.log('🔄 Forcing online mode');
                  }}
                  className="text-xs h-6"
                >
                  Try Online
                </Button>
              </div>
            )}
            {!isOfflineMode && navigator.onLine && (
              <Badge variant="outline" className="bg-green-100 text-green-600 border-green-300">
                Online
              </Badge>
            )}
            {isAnonymous && (
              <Badge variant="outline" className="bg-white">
                {anonymousMessagesLeft - messagesCount} {t.anonymousCounter}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-3 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-accent text-foreground'
              }`}>
                {message.content}
              </div>
              {message.sender === 'bestie' && message.agent && (
                <div className="mt-1 flex justify-start">
                  {getAgentIndicator(message.agent)}
                </div>
              )}
              <div className={`text-xs text-muted-foreground mt-1 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-accent p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length === 1 && (
        <div className="p-4 border-t">
          <div className="flex flex-wrap gap-2">
            {t.quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputValue(reply);
                  setTimeout(handleSendMessage, 100);
                }}
                className="text-xs"
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        {isOfflineMode && (
          <div className="mb-3 p-2 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
            ⚠️ Offline mode - Your messages are processed locally
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.placeholder}
              className="min-h-[44px] max-h-32 resize-none pr-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              aria-label={t.placeholder}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              title={t.voiceNote}
              aria-label={t.voiceNote}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-gradient-to-r from-primary to-success hover:opacity-90"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Crisis Detection Component */}
      <CrisisDetection 
        isActive={showCrisisDialog}
        onEscalate={(escalationData) => {
          console.log('Crisis escalated:', escalationData);
          // Handle crisis escalation
          setShowCrisisDialog(false);
          // TODO: Connect with counselor booking system
        }}
        onDismiss={() => setShowCrisisDialog(false)}
        message={t.crisisMessage}
        severity="high"
      />
    </div>
  );
}