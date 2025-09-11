import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { User, Settings, Shield, Bell, Globe, Eye, EyeOff, Download, Trash2, Lock, Camera, Mail, Phone, MapPin, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

interface ProfileSettingsProps {
  language: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  college?: string;
  course?: string;
  year?: string;
  avatar?: string;
  bio?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  dataSharing: boolean;
  analyticsSharing: boolean;
  researchParticipation: boolean;
  marketingEmails: boolean;
  sessionReminders: boolean;
  crisisAlerts: boolean;
  forumNotifications: boolean;
}

const sampleProfile: UserProfile = {
  id: '1',
  name: 'Arya Singh',
  email: 'arya.singh@student.edu',
  phone: '+91 9876543210',
  dateOfBirth: '2002-03-15',
  gender: 'Female',
  location: 'Srinagar, J&K',
  college: 'University of Kashmir',
  course: 'Computer Science',
  year: '3rd Year',
  bio: 'Computer science student passionate about technology and mental health awareness.',
  emergencyContact: {
    name: 'Priya Singh',
    phone: '+91 9876543211',
    relationship: 'Mother'
  }
};

const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'private',
  dataSharing: false,
  analyticsSharing: true,
  researchParticipation: false,
  marketingEmails: false,
  sessionReminders: true,
  crisisAlerts: true,
  forumNotifications: true
};

export function ProfileSettings({ language }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>(sampleProfile);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const texts = {
    en: {
      title: 'Profile Settings',
      subtitle: 'Manage your account settings and privacy preferences',
      profile: 'Profile',
      privacy: 'Privacy',
      security: 'Security',
      notifications: 'Notifications',
      data: 'Data',
      personalInfo: 'Personal Information',
      edit: 'Edit Profile',
      save: 'Save Changes',
      cancel: 'Cancel',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      location: 'Location',
      college: 'College/University',
      course: 'Course',
      year: 'Academic Year',
      bio: 'Bio',
      bioPlaceholder: 'Tell us a bit about yourself...',
      emergencyContact: 'Emergency Contact',
      emergencyName: 'Contact Name',
      emergencyPhone: 'Contact Phone',
      emergencyRelation: 'Relationship',
      changeAvatar: 'Change Avatar',
      privacySettings: 'Privacy Settings',
      profileVisibility: 'Profile Visibility',
      public: 'Public',
      private: 'Private',
      dataSharing: 'Data Sharing',
      dataShareDesc: 'Share anonymized data to improve services',
      analyticsSharing: 'Analytics',
      analyticsDesc: 'Help improve app performance with usage analytics',
      researchParticipation: 'Research Participation',
      researchDesc: 'Participate in mental health research studies',
      securitySettings: 'Security Settings',
      changePassword: 'Change Password',
      twoFactor: 'Two-Factor Authentication',
      twoFactorDesc: 'Add an extra layer of security to your account',
      enable: 'Enable',
      disable: 'Disable',
      sessionSecurity: 'Session Security',
      activeSessionsDesc: 'Manage your active sessions',
      notificationSettings: 'Notification Settings',
      marketingEmails: 'Marketing Emails',
      marketingDesc: 'Receive updates about new features and tips',
      sessionReminders: 'Session Reminders',
      sessionDesc: 'Get notified about upcoming counselor sessions',
      crisisAlerts: 'Crisis Alerts',
      crisisDesc: 'Receive immediate notifications for crisis support',
      forumNotifications: 'Forum Notifications',
      forumDesc: 'Get notified about replies to your forum posts',
      dataManagement: 'Data Management',
      downloadData: 'Download My Data',
      downloadDesc: 'Download a copy of all your data',
      deleteAccount: 'Delete Account',
      deleteDesc: 'Permanently delete your account and all data',
      download: 'Download',
      deleteButton: 'Delete Account',
      deleteConfirmTitle: 'Delete Account',
      deleteConfirmDesc: 'This action cannot be undone. All your data will be permanently deleted.',
      deleteConfirm: 'Type "DELETE" to confirm',
      deleteWarning: 'Are you sure you want to delete your account?',
      dataExportTitle: 'Export Your Data',
      dataExportDesc: 'We\'ll prepare a download with all your data including chat history, mood tracking, and settings.',
      requestExport: 'Request Export',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      preferNotToSay: 'Prefer not to say',
      mother: 'Mother',
      father: 'Father',
      sibling: 'Sibling',
      guardian: 'Guardian',
      friend: 'Friend',
      firstYear: '1st Year',
      secondYear: '2nd Year',
      thirdYear: '3rd Year',
      fourthYear: '4th Year',
      graduate: 'Graduate',
      success: 'Settings saved successfully',
      error: 'Failed to save settings'
    },
    hi: {
      title: 'प्रोफ़ाइल सेटिंग्स',
      subtitle: 'अपनी खाता सेटिंग्स और गोपनीयता प्राथमिकताओं को प्रबंधित करें',
      profile: 'प्रोफ़ाइल',
      privacy: 'गोपनीयता',
      security: 'सुरक्षा',
      notifications: 'सूचनाएं',
      data: 'डेटा',
      personalInfo: 'व्यक्तिगत जानकारी',
      edit: 'प्रोफ़ाइल संपादित करें',
      save: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      name: 'पूरा नाम',
      email: 'ईमेल पता',
      phone: 'फोन नंबर',
      dateOfBirth: 'जन्म तिथि',
      gender: 'लिंग',
      location: 'स्थान',
      college: 'कॉलेज/विश्वविद्यालय',
      course: 'कोर्स',
      year: 'शैक्षणिक वर्ष',
      bio: 'परिचय',
      bioPlaceholder: 'अपने बारे में कुछ बताएं...',
      emergencyContact: 'आपातकालीन संपर्क',
      emergencyName: 'संपर्क नाम',
      emergencyPhone: 'संपर्क फोन',
      emergencyRelation: 'रिश्ता',
      changeAvatar: 'अवतार बदलें',
      privacySettings: 'गोपनीयता सेटिंग्स',
      profileVisibility: 'प्रोफ़ाइल दृश्यता',
      public: 'सार्वजनिक',
      private: 'निजी',
      dataSharing: 'डेटा साझाकरण',
      dataShareDesc: 'सेवाओं को बेहतर बनाने के लिए अनाम डेटा साझा करें',
      analyticsSharing: 'एनालिटिक्स',
      analyticsDesc: 'उपयोग एनालिटिक्स के साथ ऐप के प्रदर्शन को बेहतर बनाने में मदद करें',
      researchParticipation: 'अनुसंधान भागीदारी',
      researchDesc: 'मानसिक स्वास्थ्य अनुसंधान अध्ययनों में भाग लें',
      securitySettings: 'सुरक्षा सेटिंग्स',
      changePassword: 'पासवर्ड बदलें',
      twoFactor: 'द्विकारक प्रमाणीकरण',
      twoFactorDesc: 'अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ें',
      enable: 'सक्षम करें',
      disable: 'अक्षम करें',
      sessionSecurity: 'सत्र सुरक्षा',
      activeSessionsDesc: 'अपने सक्रिय सत्रों को प्रबंधित करें',
      notificationSettings: 'सूचना सेटिंग्स',
      marketingEmails: 'मार्केटिंग ईमेल',
      marketingDesc: 'नई सुविधाओं और सुझावों के बारे में अपडेट प्राप्त करें',
      sessionReminders: 'सत्र अनुस्मारक',
      sessionDesc: 'आगामी परामर्शदाता सत्रों के बारे में सूचना प्राप्त करें',
      crisisAlerts: 'संकट अलर्ट',
      crisisDesc: 'संकट सहायता के लिए तुरंत सूचनाएं प्राप्त करें',
      forumNotifications: 'फोरम सूचनाएं',
      forumDesc: 'अपनी फोरम पोस्ट के उत्तरों के बारे में सूचना प्राप्त करें',
      dataManagement: 'डेटा प्रबंधन',
      downloadData: 'मेरा डेटा डाउनलोड करें',
      downloadDesc: 'अपने सभी डेटा की एक प्रति डाउनलोड करें',
      deleteAccount: 'खाता हटाएं',
      deleteDesc: 'अपना खाता और सभी डेटा स्थायी रूप से हटाएं',
      download: 'डाउनलोड',
      deleteButton: 'खाता हटाएं',
      deleteConfirmTitle: 'खाता हटाएं',
      deleteConfirmDesc: 'यह क्रिया पूर्ववत नहीं की जा सकती। आपका सभी डेटा स्थायी रूप से हटा दिया जाएगा।',
      deleteConfirm: 'पुष्टि करने के लिए "DELETE" टाइप करें',
      deleteWarning: 'क्या आप वाकई अपना खाता हटाना चाहते हैं?',
      dataExportTitle: 'अपना डेटा निर्यात करें',
      dataExportDesc: 'हम चैट इतिहास, मूड ट्रैकिंग और सेटिंग्स सहित आपके सभी डेटा के साथ एक डाउनलोड तैयार करेंगे।',
      requestExport: 'निर्यात का अनुरोध करें',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      preferNotToSay: 'नहीं बताना चाहते',
      mother: 'माता',
      father: 'पिता',
      sibling: 'भाई-बहन',
      guardian: 'अभिभावक',
      friend: 'मित्र',
      firstYear: 'प्रथम वर्ष',
      secondYear: 'द्वितीय वर्ष',
      thirdYear: 'तृतीय वर्ष',
      fourthYear: 'चतुर्थ वर्ष',
      graduate: 'स्नातक',
      success: 'सेटिंग्स सफलतापूर्वक सहेजी गईं',
      error: 'सेटिंग्स सहेजने में विफल'
    },
    ur: {
      title: 'پروفائل کی ترتیبات',
      subtitle: 'اپنے اکاؤنٹ کی ترتیبات اور رازداری کی ترجیحات کا انتظام کریں',
      profile: 'پروفائل',
      privacy: 'رازداری',
      security: 'سیکیورٹی',
      notifications: 'اطلاعات',
      data: 'ڈیٹا',
      personalInfo: 'ذاتی معلومات',
      edit: 'پروفائل میں ترمیم',
      save: 'تبدیلیاں محفوظ کریں',
      cancel: 'منسوخ کریں',
      name: 'مکمل نام',
      email: 'ای میل ایڈریس',
      phone: 'فون نمبر',
      dateOfBirth: 'تاریخ پیدائش',
      gender: 'جنس',
      location: 'مقام',
      college: 'کالج/یونیورسٹی',
      course: 'کورس',
      year: 'تعلیمی سال',
      bio: 'تعارف',
      bioPlaceholder: 'اپنے بارے میں کچھ بتائیں...',
      emergencyContact: 'ہنگامی رابطہ',
      emergencyName: 'رابطے کا نام',
      emergencyPhone: 'رابطے کا فون',
      emergencyRelation: 'رشتہ',
      changeAvatar: 'اوتار تبدیل کریں',
      privacySettings: 'رازداری کی ترتیبات',
      profileVisibility: 'پروفائل کی مرئیت',
      public: 'عوامی',
      private: 'نجی',
      dataSharing: 'ڈیٹا شیئرنگ',
      dataShareDesc: 'خدمات کو بہتر بنانے کے لیے گمنام ڈیٹا شیئر کریں',
      analyticsSharing: 'تجزیات',
      analyticsDesc: 'استعمال کے تجزیات کے ساتھ ایپ کی کارکردگی بہتر بنانے میں مدد کریں',
      researchParticipation: 'تحقیقی شرکت',
      researchDesc: 'ذہنی صحت کی تحقیقی مطالعات میں حصہ لیں',
      securitySettings: 'سیکیورٹی کی ترتیبات',
      changePassword: 'پاس ورڈ تبدیل کریں',
      twoFactor: 'دو عنصری تصدیق',
      twoFactorDesc: 'اپنے اکاؤنٹ میں سیکیورٹی کی اضافی تہ شامل کریں',
      enable: 'فعال کریں',
      disable: 'غیر فعال کریں',
      sessionSecurity: 'سیشن سیکیورٹی',
      activeSessionsDesc: 'اپنے فعال سیشنز کا انتظام کریں',
      notificationSettings: 'اطلاع کی ترتیبات',
      marketingEmails: 'مارکیٹنگ ای میلز',
      marketingDesc: 'نئی خصوصیات اور تجاویز کے بارے میں اپڈیٹ حاصل کریں',
      sessionReminders: 'سیشن کی یاد دلانے',
      sessionDesc: 'آنے والے کاؤنسلر سیشنز کے بارے میں اطلاع حاصل کریں',
      crisisAlerts: 'بحرانی انتباہات',
      crisisDesc: 'بحرانی مدد کے لیے فوری اطلاعات حاصل کریں',
      forumNotifications: 'فورم کی اطلاعات',
      forumDesc: 'اپنی فورم پوسٹس کے جوابات کے بارے میں اطلاع حاصل کریں',
      dataManagement: 'ڈیٹا کا انتظام',
      downloadData: 'میرا ڈیٹا ڈاؤن لوڈ کریں',
      downloadDesc: 'اپنے تمام ڈیٹا کی ایک کاپی ڈاؤن لوڈ کریں',
      deleteAccount: 'اکاؤنٹ ڈیلیٹ کریں',
      deleteDesc: 'اپنے اکاؤنٹ اور تمام ڈیٹا کو مستقل طور پر ڈیلیٹ کریں',
      download: 'ڈاؤن لوڈ',
      deleteButton: 'اکاؤنٹ ڈیلیٹ کریں',
      deleteConfirmTitle: 'اکاؤنٹ ڈیلیٹ کریں',
      deleteConfirmDesc: 'اس عمل کو واپس نہیں کیا جا سکتا۔ آپ کا تمام ڈیٹا مستقل طور پر ڈیلیٹ ہو جائے گا۔',
      deleteConfirm: 'تصدیق کے لیے "DELETE" ٹائپ کریں',
      deleteWarning: 'کیا آپ واقعی اپنا اکاؤنٹ ڈیلیٹ کرنا چاہتے ہیں؟',
      dataExportTitle: 'اپنا ڈیٹا برآمد کریں',
      dataExportDesc: 'ہم چیٹ ہسٹری، موڈ ٹریکنگ، اور سیٹنگز سمیت آپ کے تمام ڈیٹا کے ساتھ ایک ڈاؤن لوڈ تیار کریں گے۔',
      requestExport: 'برآمد کی درخواست کریں',
      male: 'مرد',
      female: 'عورت',
      other: 'دیگر',
      preferNotToSay: 'نہیں بتانا چاہتے',
      mother: 'والدہ',
      father: 'والد',
      sibling: 'بہن بھائی',
      guardian: 'سرپرست',
      friend: 'دوست',
      firstYear: 'پہلا سال',
      secondYear: 'دوسرا سال',
      thirdYear: 'تیسرا سال',
      fourthYear: 'چوتھا سال',
      graduate: 'گریجویٹ',
      success: 'ترتیبات کامیابی سے محفوظ ہو گئیں',
      error: 'ترتیبات محفوظ کرنے میں ناکام'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  const handleSaveProfile = () => {
    // In a real app, this would call the backend API
    console.log('Saving profile:', profile);
    setIsEditing(false);
    // Show success message
  };

  const handlePrivacySettingChange = (key: keyof PrivacySettings, value: boolean | string) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    // In a real app, this would immediately call the backend API
    console.log('Privacy setting changed:', key, value);
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call the backend API
    console.log('Deleting account');
    setShowDeleteDialog(false);
  };

  const handleDataExport = () => {
    // In a real app, this would call the backend API
    console.log('Requesting data export');
    setShowDataDialog(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">{t.title}</h1>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t.profile}
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t.privacy}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t.security}
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t.data}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t.personalInfo}</CardTitle>
                    <Button 
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    >
                      {isEditing ? t.save : t.edit}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="text-xl">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        {t.changeAvatar}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t.name}</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t.phone}</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">{t.gender}</Label>
                      <Select 
                        value={profile.gender || ''} 
                        onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.gender} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t.male}</SelectItem>
                          <SelectItem value="female">{t.female}</SelectItem>
                          <SelectItem value="other">{t.other}</SelectItem>
                          <SelectItem value="prefer-not-to-say">{t.preferNotToSay}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">{t.location}</Label>
                      <Input
                        id="location"
                        value={profile.location || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="college">{t.college}</Label>
                      <Input
                        id="college"
                        value={profile.college || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, college: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course">{t.course}</Label>
                      <Input
                        id="course"
                        value={profile.course || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, course: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">{t.bio}</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder={t.bioPlaceholder}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        {t.cancel}
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        {t.save}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.emergencyContact}</CardTitle>
                  <CardDescription>
                    Contact information for emergency situations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyName">{t.emergencyName}</Label>
                      <Input
                        id="emergencyName"
                        value={profile.emergencyContact?.name || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact!, name: e.target.value }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">{t.emergencyPhone}</Label>
                      <Input
                        id="emergencyPhone"
                        value={profile.emergencyContact?.phone || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact!, phone: e.target.value }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyRelation">{t.emergencyRelation}</Label>
                      <Select 
                        value={profile.emergencyContact?.relationship || ''} 
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact!, relationship: value }
                        }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.emergencyRelation} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mother">{t.mother}</SelectItem>
                          <SelectItem value="father">{t.father}</SelectItem>
                          <SelectItem value="sibling">{t.sibling}</SelectItem>
                          <SelectItem value="guardian">{t.guardian}</SelectItem>
                          <SelectItem value="friend">{t.friend}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>{t.privacySettings}</CardTitle>
                <CardDescription>
                  Control how your data is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t.profileVisibility}</Label>
                    <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                  </div>
                  <Select 
                    value={privacySettings.profileVisibility} 
                    onValueChange={(value: 'public' | 'private') => handlePrivacySettingChange('profileVisibility', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t.public}</SelectItem>
                      <SelectItem value="private">{t.private}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t.dataSharing}</Label>
                    <p className="text-sm text-muted-foreground">{t.dataShareDesc}</p>
                  </div>
                  <Switch
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(checked) => handlePrivacySettingChange('dataSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t.analyticsSharing}</Label>
                    <p className="text-sm text-muted-foreground">{t.analyticsDesc}</p>
                  </div>
                  <Switch
                    checked={privacySettings.analyticsSharing}
                    onCheckedChange={(checked) => handlePrivacySettingChange('analyticsSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t.researchParticipation}</Label>
                    <p className="text-sm text-muted-foreground">{t.researchDesc}</p>
                  </div>
                  <Switch
                    checked={privacySettings.researchParticipation}
                    onCheckedChange={(checked) => handlePrivacySettingChange('researchParticipation', checked)}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">{t.notificationSettings}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">{t.marketingEmails}</Label>
                        <p className="text-sm text-muted-foreground">{t.marketingDesc}</p>
                      </div>
                      <Switch
                        checked={privacySettings.marketingEmails}
                        onCheckedChange={(checked) => handlePrivacySettingChange('marketingEmails', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">{t.sessionReminders}</Label>
                        <p className="text-sm text-muted-foreground">{t.sessionDesc}</p>
                      </div>
                      <Switch
                        checked={privacySettings.sessionReminders}
                        onCheckedChange={(checked) => handlePrivacySettingChange('sessionReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">{t.crisisAlerts}</Label>
                        <p className="text-sm text-muted-foreground">{t.crisisDesc}</p>
                      </div>
                      <Switch
                        checked={privacySettings.crisisAlerts}
                        onCheckedChange={(checked) => handlePrivacySettingChange('crisisAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">{t.forumNotifications}</Label>
                        <p className="text-sm text-muted-foreground">{t.forumDesc}</p>
                      </div>
                      <Switch
                        checked={privacySettings.forumNotifications}
                        onCheckedChange={(checked) => handlePrivacySettingChange('forumNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.securitySettings}</CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">{t.changePassword}</Label>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                    <Button variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      {t.changePassword}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">{t.twoFactor}</Label>
                      <p className="text-sm text-muted-foreground">{t.twoFactorDesc}</p>
                    </div>
                    <Button variant="outline">
                      {t.enable}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">{t.sessionSecurity}</Label>
                      <p className="text-sm text-muted-foreground">{t.activeSessionsDesc}</p>
                    </div>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.dataManagement}</CardTitle>
                  <CardDescription>
                    Export or delete your account data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">{t.downloadData}</Label>
                      <p className="text-sm text-muted-foreground">{t.downloadDesc}</p>
                    </div>
                    <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          {t.download}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.dataExportTitle}</DialogTitle>
                          <DialogDescription>
                            {t.dataExportDesc}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2">
                          <Button onClick={handleDataExport} className="flex-1">
                            {t.requestExport}
                          </Button>
                          <Button variant="outline" onClick={() => setShowDataDialog(false)}>
                            {t.cancel}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div>
                      <Label className="text-base text-destructive">{t.deleteAccount}</Label>
                      <p className="text-sm text-destructive/80">{t.deleteDesc}</p>
                    </div>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t.deleteButton}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-destructive">{t.deleteConfirmTitle}</DialogTitle>
                          <DialogDescription>
                            {t.deleteConfirmDesc}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <div className="flex items-center gap-2 text-destructive mb-2">
                              <AlertTriangle className="w-5 h-5" />
                              <span className="font-medium">Warning</span>
                            </div>
                            <p className="text-sm text-destructive/80">{t.deleteWarning}</p>
                          </div>
                          <div>
                            <Label>{t.deleteConfirm}</Label>
                            <Input placeholder="DELETE" />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
                              {t.deleteButton}
                            </Button>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                              {t.cancel}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}