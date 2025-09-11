import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Calendar, BarChart3, Heart, Shield, Users } from 'lucide-react';
import { ManMitraLogo } from './ManMitraLogo';
import { LanguageSelector } from './LanguageSelector';
import { RoleCard } from './RoleCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

const translations = {
  en: {
    tagline: "ManMitra – Your Mind's True Friend",
    subtitle: "Safe space for mental health support",
    studentRole: "Student",
    studentDesc: "Anonymous support & counseling",
    studentButton: "Start Anonymous Chat",
    counselorRole: "Counselor",
    counselorDesc: "Manage sessions & support students",
    counselorButton: "Counselor Login",
    adminRole: "College Admin",
    adminDesc: "Oversee wellness & analytics",
    adminButton: "Admin Dashboard",
    anonymousNote: "Start chatting anonymously – no sign-up needed for first 5 messages",
    features: {
      support: "24/7 AI Support",
      privacy: "Complete Privacy",
      community: "Peer Community"
    }
  },
  hi: {
    tagline: "मनमित्र – आपके मन का सच्चा साथी",
    subtitle: "मानसिक स्वास्थ्य सहायता के लिए सुरक्षित स्थान",
    studentRole: "छात्र",
    studentDesc: "गुमनाम सहायता और परामर्श",
    studentButton: "गुमनाम चैट शुरू करें",
    counselorRole: "काउंसलर",
    counselorDesc: "सत्र प्रबंधन और छात्र सहायता",
    counselorButton: "काउंसलर लॉगिन",
    adminRole: "कॉलेज एडमिन",
    adminDesc: "कल्याण और एनालिटिक्स की देखरेख",
    adminButton: "एडमिन डैशबोर्ड",
    anonymousNote: "गुमनाम चैट शुरू करें – पहले 5 संदेशों के लिए साइन-अप की जरूरत नहीं",
    features: {
      support: "24/7 AI सहायता",
      privacy: "पूर्ण गोपनीयता",
      community: "साथी समुदाय"
    }
  },
  ur: {
    tagline: "من میتر – آپ کے دل کا سچا دوست",
    subtitle: "ذہنی صحت کی مدد کے لیے محفوظ جگہ",
    studentRole: "طالب علم",
    studentDesc: "گمنام مدد اور مشاورت",
    studentButton: "گمنام چیٹ شروع کریں",
    counselorRole: "مشیر",
    counselorDesc: "سیشن کا انتظام اور طلباء کی مدد",
    counselorButton: "مشیر لاگ ان",
    adminRole: "کالج ایڈمن",
    adminDesc: "بہبود اور تجزیات کی نگرانی",
    adminButton: "ایڈمن ڈیش بورڈ",
    anonymousNote: "گمنام چیٹ شروع کریں – پہلے 5 پیغامات کے لیے سائن اپ کی ضرورت نہیں",
    features: {
      support: "24/7 AI مدد",
      privacy: "مکمل رازداری",
      community: "ساتھی برادری"
    }
  }
};

interface LandingPageProps {
  onRoleSelect: (role: 'student' | 'counselor' | 'admin') => void;
}

export function LandingPage({ onRoleSelect }: LandingPageProps) {
  const [language, setLanguage] = useState('en');
  const t = translations[language as keyof typeof translations];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <ManMitraLogo size="md" />
        <LanguageSelector 
          currentLanguage={language}
          onLanguageChange={setLanguage}
          variant="minimal"
        />
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="mb-6">
              <ManMitraLogo size="lg" className="mx-auto drop-shadow-2xl" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 text-white leading-tight" 
                dir={language === 'ur' ? 'rtl' : 'ltr'}>
              {t.tagline}
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto" 
               dir={language === 'ur' ? 'rtl' : 'ltr'}>
              {t.subtitle}
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center gap-8 mb-16 flex-wrap"
          >
            <div className="flex items-center gap-2 text-slate-300">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>{t.features.support}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="h-5 w-5 text-success" />
              <span>{t.features.privacy}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="h-5 w-5 text-secondary" />
              <span>{t.features.community}</span>
            </div>
          </motion.div>
        </div>

        {/* Role Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <RoleCard
            icon={MessageCircle}
            title={t.studentRole}
            description={t.studentDesc}
            buttonText={t.studentButton}
            onClick={() => onRoleSelect('student')}
            gradient="from-primary to-success"
          />
          <RoleCard
            icon={Calendar}
            title={t.counselorRole}
            description={t.counselorDesc}
            buttonText={t.counselorButton}
            onClick={() => onRoleSelect('counselor')}
            gradient="from-success to-primary"
          />
          <RoleCard
            icon={BarChart3}
            title={t.adminRole}
            description={t.adminDesc}
            buttonText={t.adminButton}
            onClick={() => onRoleSelect('admin')}
            gradient="from-primary to-warning"
          />
        </motion.div>

        {/* Anonymous Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-6 py-3 text-slate-200">
            <Heart className="h-4 w-4 text-success" />
            <span className="text-sm" dir={language === 'ur' ? 'rtl' : 'ltr'}>
              {t.anonymousNote}
            </span>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjBtZW50YWwlMjBoZWFsdGglMjBzdXBwb3J0fGVufDF8fHx8MTc1NzQwMTUxOXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Diverse students supporting each other"
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}