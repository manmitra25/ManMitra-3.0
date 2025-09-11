import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MessageCircle, Calendar, Heart, BookOpen, Users, TrendingUp, Leaf, Clock } from 'lucide-react';

const translations = {
  en: {
    welcome: "Welcome back!",
    subtitle: "How are you feeling today? 🌿",
    quickActions: "Quick Actions",
    chatWithBestie: "Chat with Bestie",
    chatDesc: "Your AI companion is here to listen",
    bookCounselor: "Book Counselor",
    bookDesc: "Schedule a session with a professional",
    moodCheck: "Daily Mood Check",
    moodDesc: "Track your mental wellness journey",
    resources: "Resources Hub",
    resourcesDesc: "CBT exercises, meditations & guides",
    peerSupport: "Peer Support",
    peerDesc: "Connect with your community",
    progress: "Your Progress",
    progressDesc: "See how you're growing",
    todayNudge: "Today's Wellness Nudge",
    breathingExercise: "Did you try yesterday's breathing exercise? 🌿",
    tryNow: "Try Now",
    dismiss: "Maybe Later",
    offlineMode: "Offline Mode – Access cached chats & resources",
    sync: "Sync",
    streakBadge: "5-Day Streak! 🎉",
    availableOffline: "Available Offline"
  },
  hi: {
    welcome: "वापसी पर स्वागत है!",
    subtitle: "आज आप कैसा महसूस कर रहे हैं? 🌿",
    quickActions: "त्वरित कार्य",
    chatWithBestie: "बेस्टी के साथ चैट करें",
    chatDesc: "आपका AI साथी सुनने के लिए यहाँ है",
    bookCounselor: "काउंसलर बुक करें",
    bookDesc: "एक पेशेवर के साथ सत्र निर्धारित करें",
    moodCheck: "दैनिक मूड चेक",
    moodDesc: "अपनी मानसिक कल्याण यात्रा को ट्रैक करें",
    resources: "संसाधन हब",
    resourcesDesc: "CBT अभ्यास, ध्यान और गाइड",
    peerSupport: "साथी समर्थन",
    peerDesc: "अपने समुदाय से जुड़ें",
    progress: "आपकी प्रगति",
    progressDesc: "देखें कि आप कैसे बढ़ रहे हैं",
    todayNudge: "आज का कल्याण संकेत",
    breathingExercise: "क्या आपने कल की श्वास तकनीक आजमाई? 🌿",
    tryNow: "अभी करें",
    dismiss: "बाद में",
    offlineMode: "ऑफलाइन मोड – कैश्ड चैट और संसाधन उपलब्ध",
    sync: "सिंक करें",
    streakBadge: "5-दिन की लकीर! 🎉",
    availableOffline: "ऑफलाइन उपलब्ध"
  },
  ur: {
    welcome: "واپسی پر خوش آمدید!",
    subtitle: "آج آپ کیسا محسوس کر رہے ہیں؟ 🌿",
    quickActions: "فوری اعمال",
    chatWithBestie: "بیسٹی کے ساتھ چیٹ کریں",
    chatDesc: "آپ کا AI ساتھی سننے کے لیے یہاں ہے",
    bookCounselor: "مشیر بک کریں",
    bookDesc: "ایک پیشہ ور کے ساتھ سیشن طے کریں",
    moodCheck: "روزانہ موڈ چیک",
    moodDesc: "اپنے ذہنی بہبود کے سفر کو ٹریک کریں",
    resources: "وسائل مرکز",
    resourcesDesc: "CBT مشقیں، مراقبہ اور رہنمائی",
    peerSupport: "ساتھی مدد",
    peerDesc: "اپنی کمیونٹی سے جڑیں",
    progress: "آپ کی ترقی",
    progressDesc: "دیکھیں کہ آپ کیسے بڑھ رہے ہیں",
    todayNudge: "آج کا بہبود اشارہ",
    breathingExercise: "کیا آپ نے کل کی سانس کی مشق آزمائی؟ 🌿",
    tryNow: "ابھی کریں",
    dismiss: "بعد میں",
    offlineMode: "آف لائن موڈ – محفوظ شدہ چیٹس اور وسائل دستیاب",
    sync: "سنک کریں",
    streakBadge: "5 دن کا سلسلہ! 🎉",
    availableOffline: "آف لائن دستیاب"
  }
};

interface StudentDashboardProps {
  language: string;
  onNavigate: (section: string) => void;
  isOffline?: boolean;
  userName?: string;
}

export function StudentDashboard({ 
  language, 
  onNavigate, 
  isOffline = false,
  userName = "Student"
}: StudentDashboardProps) {
  const [showNudge, setShowNudge] = useState(true);
  const t = translations[language as keyof typeof translations] || translations.en;

  const quickActionCards = [
    {
      icon: MessageCircle,
      title: t.chatWithBestie,
      description: t.chatDesc,
      onClick: () => onNavigate('chat'),
      gradient: 'from-primary to-success',
      badge: isOffline ? t.availableOffline : null
    },
    {
      icon: Calendar,
      title: t.bookCounselor,
      description: t.bookDesc,
      onClick: () => onNavigate('bookings'),
      gradient: 'from-success to-primary'
    },
    {
      icon: Heart,
      title: t.moodCheck,
      description: t.moodDesc,
      onClick: () => onNavigate('mood'),
      gradient: 'from-primary to-secondary'
    },
    {
      icon: BookOpen,
      title: t.resources,
      description: t.resourcesDesc,
      onClick: () => onNavigate('resources'),
      gradient: 'from-secondary to-success',
      badge: isOffline ? t.availableOffline : null
    },
    {
      icon: Users,
      title: t.peerSupport,
      description: t.peerDesc,
      onClick: () => onNavigate('forum'),
      gradient: 'from-success to-warning'
    },
    {
      icon: TrendingUp,
      title: t.progress,
      description: t.progressDesc,
      onClick: () => onNavigate('progress'),
      gradient: 'from-warning to-primary'
    }
  ];

  return (
    <div className="p-6 space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Offline Banner */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning/20 border border-warning/30 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-warning">{t.offlineMode}</span>
          </div>
          <Button variant="outline" size="sm">
            {t.sync}
          </Button>
        </motion.div>
      )}

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">{t.welcome}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            {t.streakBadge}
          </Badge>
        </div>
      </motion.div>

      {/* Wellness Nudge */}
      {showNudge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-success" />
                  <CardTitle className="text-lg">{t.todayNudge}</CardTitle>
                </div>
                <button 
                  onClick={() => setShowNudge(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{t.breathingExercise}</p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-success hover:bg-success/90">
                  {t.tryNow}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowNudge(false)}>
                  {t.dismiss}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-xl">{t.quickActions}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActionCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 group"
                onClick={card.onClick}
              >
                <CardHeader className="text-center pb-3">
                  <motion.div 
                    className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <card.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    {card.badge && (
                      <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 text-center">
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}