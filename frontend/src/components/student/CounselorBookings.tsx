import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Calendar as CalendarIcon, Clock, Video, MessageSquare, Star, MapPin, Languages, User, CheckCircle, XCircle, Phone } from 'lucide-react';

interface CounselorBookingsProps {
  language: string;
}

interface Counselor {
  id: string;
  name: string;
  nameHi?: string;
  nameUr?: string;
  title: string;
  titleHi?: string;
  titleUr?: string;
  specializations: string[];
  specializationsHi?: string[];
  specializationsUr?: string[];
  rating: number;
  experience: number;
  languages: string[];
  location: string;
  avatar?: string;
  isOnline: boolean;
  nextAvailable: string;
  sessionTypes: ('video' | 'audio' | 'chat')[];
  bio: string;
  bioHi?: string;
  bioUr?: string;
}

interface Booking {
  id: string;
  counselorId: string;
  counselorName: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'audio' | 'chat';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

const counselors: Counselor[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    nameHi: 'डॉ. प्रिया शर्मा',
    nameUr: 'ڈاکٹر پریا شرما',
    title: 'Clinical Psychologist',
    titleHi: 'नैदानिक मनोवैज्ञानिक',
    titleUr: 'کلینیکل سائیکالوجسٹ',
    specializations: ['Anxiety', 'Depression', 'Academic Stress'],
    specializationsHi: ['चिंता', 'अवसाद', 'शैक्षणिक तनाव'],
    specializationsUr: ['پریشانی', 'ڈپریشن', 'تعلیمی دباؤ'],
    rating: 4.8,
    experience: 8,
    languages: ['English', 'Hindi', 'Urdu'],
    location: 'Srinagar, J&K',
    isOnline: true,
    nextAvailable: 'Today, 2:00 PM',
    sessionTypes: ['video', 'audio', 'chat'],
    bio: 'Specialized in helping students with anxiety and academic stress. Culturally sensitive approach for J&K students.',
    bioHi: 'चिंता और शैक्षणिक तनाव के साथ छात्रों की मदद करने में विशेषज्ञ। जम्मू-कश्मीर के छात्रों के लिए सांस्कृतिक संवेदनशील दृष्टिकोण।',
    bioUr: 'طلباء کی پریشانی اور تعلیمی دباؤ میں مدد کرنے میں ماہر۔ جموں و کشمیر کے طلباء کے لیے ثقافتی حساس نقطہ نظر۔'
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    nameHi: 'डॉ. राजेश कुमार',
    nameUr: 'ڈاکٹر راجیش کمار',
    title: 'Counseling Psychologist',
    titleHi: 'परामर्श मनोवैज्ञानिक',
    titleUr: 'کاؤنسلنگ سائیکالوجسٹ',
    specializations: ['Trauma', 'PTSD', 'Family Therapy'],
    specializationsHi: ['आघात', 'PTSD', 'पारिवारिक चिकित्सा'],
    specializationsUr: ['صدمہ', 'PTSD', 'خاندانی علاج'],
    rating: 4.9,
    experience: 12,
    languages: ['English', 'Hindi', 'Kashmiri'],
    location: 'Jammu, J&K',
    isOnline: true,
    nextAvailable: 'Tomorrow, 10:00 AM',
    sessionTypes: ['video', 'audio'],
    bio: 'Expert in trauma counseling with deep understanding of regional conflicts and their psychological impact.',
    bioHi: 'क्षेत्रीय संघर्षों और उनके मनोवैज्ञानिक प्रभाव की गहरी समझ के साथ आघात परामर्श में विशेषज्ञ।',
    bioUr: 'علاقائی تنازعات اور ان کے نفسیاتی اثرات کی گہری سمجھ کے ساتھ صدمہ کاؤنسلنگ میں ماہر۔'
  },
  {
    id: '3',
    name: 'Dr. Fatima Sheikh',
    nameHi: 'डॉ. फातिमा शेख',
    nameUr: 'ڈاکٹر فاطمہ شیخ',
    title: 'Child & Adolescent Psychologist',
    titleHi: 'बाल और किशोर मनोवैज्ञانिक',
    titleUr: 'بچوں اور نوعمروں کے ماہر نفسیات',
    specializations: ['Teen Issues', 'Identity', 'Social Anxiety'],
    specializationsHi: ['किशोर समस्याएं', 'पहचान', 'सामाजिक चिंता'],
    specializationsUr: ['نوعمری کے مسائل', 'شناخت', 'سماجی پریشانی'],
    rating: 4.7,
    experience: 6,
    languages: ['English', 'Urdu', 'Kashmiri'],
    location: 'Srinagar, J&K',
    isOnline: false,
    nextAvailable: 'Friday, 3:00 PM',
    sessionTypes: ['video', 'chat'],
    bio: 'Focuses on adolescent mental health with expertise in cultural identity issues affecting young people in J&K.',
    bioHi: 'जम्मू-कश्मीर में युवाओं को प्रभावित करने वाली सांस्कृतिक पहचान के मुद्दों में विशेषज्ञता के साथ किशोर मानसिक स्वास्थ्य पर ध्यान देती हैं।',
    bioUr: 'جموں و کشمیر میں نوجوانوں کو متاثر کرنے والے ثقافتی شناخت کے مسائل میں مہارت کے ساتھ نوعمروں کی ذہنی صحت پر توجہ مرکوز کرتی ہیں۔'
  }
];

const sampleBookings: Booking[] = [
  {
    id: '1',
    counselorId: '1',
    counselorName: 'Dr. Priya Sharma',
    date: '2024-01-15',
    time: '14:00',
    duration: 50,
    type: 'video',
    status: 'upcoming',
    notes: 'Discussing exam anxiety and coping strategies'
  },
  {
    id: '2',
    counselorId: '2',
    counselorName: 'Dr. Rajesh Kumar',
    date: '2024-01-08',
    time: '10:00',
    duration: 50,
    type: 'video',
    status: 'completed',
    notes: 'Follow-up session on stress management techniques'
  }
];

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
];

export function CounselorBookings({ language }: CounselorBookingsProps) {
  const [selectedTab, setSelectedTab] = useState('browse');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState<'video' | 'audio' | 'chat'>('video');
  const [bookingNotes, setBookingNotes] = useState('');

  const texts = {
    en: {
      title: 'Counselor Bookings',
      subtitle: 'Schedule sessions with qualified mental health professionals',
      browse: 'Browse Counselors',
      myBookings: 'My Bookings',
      bookSession: 'Book Session',
      viewProfile: 'View Profile',
      rating: 'Rating',
      experience: 'Experience',
      years: 'years',
      languages: 'Languages',
      location: 'Location',
      online: 'Online',
      offline: 'Offline',
      nextAvailable: 'Next Available',
      specializations: 'Specializations',
      sessionTypes: 'Session Types',
      video: 'Video Call',
      audio: 'Audio Call',
      chat: 'Text Chat',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      selectType: 'Session Type',
      notes: 'Notes (Optional)',
      notesPlaceholder: 'Any specific topics you\'d like to discuss...',
      confirmBooking: 'Confirm Booking',
      cancel: 'Cancel',
      upcoming: 'Upcoming',
      completed: 'Completed',
      cancelled: 'Cancelled',
      reschedule: 'Reschedule',
      joinSession: 'Join Session',
      sessionWith: 'Session with',
      duration: 'Duration',
      minutes: 'minutes',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      noBookings: 'No bookings found',
      bookFirstSession: 'Book your first session with a counselor',
      culturalNote: 'All counselors are trained in cultural sensitivity for J&K region',
      emergencyNote: 'For immediate crisis support, contact Tele-MANAS: 104',
      close: 'Close'
    },
    hi: {
      title: 'परामर्शदाता बुकिंग',
      subtitle: 'योग्य मानसिक स्वास्थ्य पेशेवरों के साथ सत्र निर्धारित करें',
      browse: 'परामर्शदाता ब्राउज़ करें',
      myBookings: 'मेरी बुकिंग',
      bookSession: 'सत्र बुक करें',
      viewProfile: 'प्रोफ़ाइल देखें',
      rating: 'रेटिंग',
      experience: 'अनुभव',
      years: 'वर्ष',
      languages: 'भाषाएं',
      location: 'स्थान',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      nextAvailable: 'अगली उपलब्धता',
      specializations: 'विशेषज्ञताएं',
      sessionTypes: 'सत्र प्रकार',
      video: 'वीडियो कॉल',
      audio: 'ऑडियो कॉल',
      chat: 'टेक्स्ट चैट',
      selectDate: 'दिनांक चुनें',
      selectTime: 'समय चुनें',
      selectType: 'सत्र प्रकार',
      notes: 'नोट्स (वैकल्पिक)',
      notesPlaceholder: 'कोई विशिष्ट विषय जिस पर आप चर्चा करना चाहते हैं...',
      confirmBooking: 'बुकिंग की पुष्टि करें',
      cancel: 'रद्द करें',
      upcoming: 'आगामी',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
      reschedule: 'पुनर्निर्धारण',
      joinSession: 'सत्र में शामिल हों',
      sessionWith: 'के साथ सत्र',
      duration: 'अवधि',
      minutes: 'मिनट',
      date: 'दिनांक',
      time: 'समय',
      status: 'स्थिति',
      noBookings: 'कोई बुकिंग नहीं मिली',
      bookFirstSession: 'परामर्शदाता के साथ अपना पहला सत्र बुक करें',
      culturalNote: 'सभी परामर्शदाता जम्मू-कश्मीर क्षेत्र के लिए सांस्कृतिक संवेदनशीलता में प्रशिक्षित हैं',
      emergencyNote: 'तत्काल संकट सहायता के लिए, टेली-मानस से संपर्क करें: 104',
      close: 'बंद करें'
    },
    ur: {
      title: 'کاؤنسلر بکنگز',
      subtitle: 'اہل ذہنی صحت کے پیشہ ور افراد کے ساتھ سیشن شیڈول کریں',
      browse: 'کاؤنسلرز براؤز کریں',
      myBookings: 'میری بکنگز',
      bookSession: 'سیشن بک کریں',
      viewProfile: 'پروفائل دیکھیں',
      rating: 'ریٹنگ',
      experience: 'تجربہ',
      years: 'سال',
      languages: 'زبانیں',
      location: 'مقام',
      online: 'آن لائن',
      offline: 'آف لائن',
      nextAvailable: 'اگلی دستیابی',
      specializations: 'تخصصات',
      sessionTypes: 'سیشن کی اقسام',
      video: 'ویڈیو کال',
      audio: 'آڈیو کال',
      chat: 'ٹیکسٹ چیٹ',
      selectDate: 'تاریخ منتخب کریں',
      selectTime: 'وقت منتخب کریں',
      selectType: 'سیشن کی قسم',
      notes: 'نوٹس (اختیاری)',
      notesPlaceholder: 'کوئی خاص موضوع جس پر آپ بات کرنا چاہتے ہیں...',
      confirmBooking: 'بکنگ کی تصدیق کریں',
      cancel: 'منسوخ کریں',
      upcoming: 'آنے والا',
      completed: 'مکمل',
      cancelled: 'منسوخ',
      reschedule: 'دوبارہ شیڈول',
      joinSession: 'سیشن میں شامل ہوں',
      sessionWith: 'کے ساتھ سیشن',
      duration: 'مدت',
      minutes: 'منٹ',
      date: 'تاریخ',
      time: 'وقت',
      status: 'حالت',
      noBookings: 'کوئی بکنگ نہیں ملی',
      bookFirstSession: 'کاؤنسلر کے ساتھ اپنا پہلا سیشن بک کریں',
      culturalNote: 'تمام کاؤنسلرز کو جموں و کشمیر کے علاقے کے لیے ثقافتی حساسیت میں تربیت دی گئی ہے',
      emergencyNote: 'فوری بحرانی مدد کے لیے، ٹیلی مانس سے رابطہ کریں: 104',
      close: 'بند کریں'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  const getLocalizedText = (counselor: Counselor, field: string) => {
    if (language === 'hi') {
      switch (field) {
        case 'name': return counselor.nameHi || counselor.name;
        case 'title': return counselor.titleHi || counselor.title;
        case 'bio': return counselor.bioHi || counselor.bio;
        case 'specializations': return counselor.specializationsHi || counselor.specializations;
        default: return counselor[field as keyof Counselor];
      }
    }
    if (language === 'ur') {
      switch (field) {
        case 'name': return counselor.nameUr || counselor.name;
        case 'title': return counselor.titleUr || counselor.title;
        case 'bio': return counselor.bioUr || counselor.bio;
        case 'specializations': return counselor.specializationsUr || counselor.specializations;
        default: return counselor[field as keyof Counselor];
      }
    }
    return counselor[field as keyof Counselor];
  };

  const getSessionTypeIcon = (type: 'video' | 'audio' | 'chat') => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSessionTypeLabel = (type: 'video' | 'audio' | 'chat') => {
    return t[type as keyof typeof t];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-primary bg-primary/10 border-primary/20';
      case 'completed': return 'text-success bg-success/10 border-success/20';
      case 'cancelled': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const handleBookSession = () => {
    if (!selectedCounselor || !selectedDate || !selectedTime) return;
    
    // In a real app, this would call the backend API
    console.log('Booking session:', {
      counselorId: selectedCounselor.id,
      date: selectedDate,
      time: selectedTime,
      type: selectedType,
      notes: bookingNotes
    });
    
    setShowBookingDialog(false);
    setSelectedCounselor(null);
    setBookingNotes('');
    setSelectedTime('');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">{t.title}</h1>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        {/* Important Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Cultural Sensitivity</span>
            </div>
            <p className="text-sm text-success/80">{t.culturalNote}</p>
          </div>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 text-warning mb-2">
              <Phone className="w-5 h-5" />
              <span className="font-medium">Emergency Support</span>
            </div>
            <p className="text-sm text-warning/80">{t.emergencyNote}</p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="browse">{t.browse}</TabsTrigger>
            <TabsTrigger value="bookings">{t.myBookings}</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {counselors.map((counselor) => (
              <Card key={counselor.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="text-lg">
                        {getLocalizedText(counselor, 'name').toString().split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <CardTitle className="text-xl">
                            {getLocalizedText(counselor, 'name')}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {getLocalizedText(counselor, 'title')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={counselor.isOnline ? "default" : "secondary"}>
                            {counselor.isOnline ? t.online : t.offline}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{counselor.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          {counselor.experience} {t.years} {t.experience}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Languages className="w-4 h-4" />
                          {counselor.languages.join(', ')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {counselor.location}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {getLocalizedText(counselor, 'bio')}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(getLocalizedText(counselor, 'specializations') as string[]).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{t.nextAvailable}: {counselor.nextAvailable}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {counselor.sessionTypes.map((type) => (
                            <div key={type} className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getSessionTypeIcon(type)}
                              <span>{getSessionTypeLabel(type)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setSelectedCounselor(counselor);
                        setShowBookingDialog(true);
                      }}
                      className="flex-1"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {t.bookSession}
                    </Button>
                    <Button variant="outline">
                      {t.viewProfile}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="bookings">
            <div className="space-y-4">
              {sampleBookings.length > 0 ? (
                sampleBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">{t.sessionWith} {booking.counselorName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {booking.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {booking.time}
                            </div>
                            <div className="flex items-center gap-1">
                              {getSessionTypeIcon(booking.type)}
                              {getSessionTypeLabel(booking.type)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {t[booking.status as keyof typeof t]}
                          </Badge>
                          {booking.status === 'upcoming' && (
                            <Button>{t.joinSession}</Button>
                          )}
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm">{booking.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2">{t.noBookings}</h3>
                  <p className="text-muted-foreground mb-4">{t.bookFirstSession}</p>
                  <Button onClick={() => setSelectedTab('browse')}>
                    {t.browse}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.bookSession}</DialogTitle>
              <DialogDescription>
                {selectedCounselor && `${t.sessionWith} ${getLocalizedText(selectedCounselor, 'name')}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.selectDate}</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.selectTime}</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectTime} />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.selectType}</label>
                <Select value={selectedType} onValueChange={(value: 'video' | 'audio' | 'chat') => setSelectedType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCounselor?.sessionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {getSessionTypeIcon(type)}
                          {getSessionTypeLabel(type)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.notes}</label>
                <Textarea
                  placeholder={t.notesPlaceholder}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleBookSession}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1"
                >
                  {t.confirmBooking}
                </Button>
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}