import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, TrendingUp, TrendingDown, Minus, Heart, Brain, AlertTriangle, CheckCircle, BarChart3, Calendar as CalendarIcon } from 'lucide-react';

interface DailyMoodCheckProps {
  language: string;
}

interface MoodEntry {
  date: string;
  phq9Score: number;
  gad7Score: number;
  notes?: string;
}

interface Question {
  id: string;
  text: string;
  textHi?: string;
  textUr?: string;
}

const phq9Questions: Question[] = [
  {
    id: 'phq1',
    text: 'Little interest or pleasure in doing things',
    textHi: 'चीजों को करने में कम रुचि या खुशी',
    textUr: 'کاموں میں کم دلچسپی یا خوشی'
  },
  {
    id: 'phq2',
    text: 'Feeling down, depressed, or hopeless',
    textHi: 'उदास, अवसादग्रस्त, या निराश महसूस करना',
    textUr: 'اداس، مایوس، یا ناامید محسوس کرنا'
  },
  {
    id: 'phq3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    textHi: 'सोने या सोते रहने में परेशानी, या बहुत ज्यादा सोना',
    textUr: 'سونے یا سوتے رہنے میں پریشانی، یا بہت زیادہ سونا'
  },
  {
    id: 'phq4',
    text: 'Feeling tired or having little energy',
    textHi: 'थकान महसूस करना या कम ऊर्जा होना',
    textUr: 'تھکان محسوس کرنا یا کم توانائی ہونا'
  },
  {
    id: 'phq5',
    text: 'Poor appetite or overeating',
    textHi: 'कम भूख या अधिक खाना',
    textUr: 'کم بھوک یا زیادہ کھانا'
  },
  {
    id: 'phq6',
    text: 'Feeling bad about yourself or that you are a failure',
    textHi: 'अपने बारे में बुरा महसूस करना या असफल महसूस करना',
    textUr: 'اپنے بارے میں برا محسوس کرنا یا ناکام محسوس کرنا'
  },
  {
    id: 'phq7',
    text: 'Trouble concentrating on things',
    textHi: 'चीजों पर ध्यान केंद्रित करने में परेशानी',
    textUr: 'چیزوں پر توجہ مرکوز کرنے میں پریشانی'
  },
  {
    id: 'phq8',
    text: 'Moving or speaking slowly, or being fidgety or restless',
    textHi: 'धीरे-धीरे चलना या बोलना, या बेचैन या अशांत होना',
    textUr: 'آہستہ آہستہ چلنا یا بولنا، یا بے چین یا پریشان ہونا'
  },
  {
    id: 'phq9',
    text: 'Thoughts that you would be better off dead',
    textHi: 'यह सोचना कि आप मर जाते तो बेहतर होता',
    textUr: 'یہ سوچنا کہ آپ مر جاتے تو بہتر ہوتا'
  }
];

const gad7Questions: Question[] = [
  {
    id: 'gad1',
    text: 'Feeling nervous, anxious, or on edge',
    textHi: 'घबराहट, चिंता, या बेचैनी महसूस करना',
    textUr: 'گھبراہٹ، پریشانی، یا بے چینی محسوس کرنا'
  },
  {
    id: 'gad2',
    text: 'Not being able to stop or control worrying',
    textHi: 'चिंता को रोकने या नियंत्रित करने में असमर्थ होना',
    textUr: 'پریشانی کو روکنے یا کنٹرول کرنے میں ناکام ہونا'
  },
  {
    id: 'gad3',
    text: 'Worrying too much about different things',
    textHi: 'अलग-अलग चीजों के बारे में बहुत ज्यादा चिंता करना',
    textUr: 'مختلف چیزوں کے بارے میں بہت زیادہ پریشان ہونا'
  },
  {
    id: 'gad4',
    text: 'Trouble relaxing',
    textHi: 'आराम करने में परेशानी',
    textUr: 'آرام کرنے میں پریشانی'
  },
  {
    id: 'gad5',
    text: 'Being so restless that it is hard to sit still',
    textHi: 'इतना बेचैन होना कि चुप बैठना कठिन हो',
    textUr: 'اتنا بے چین ہونا کہ خاموش بیٹھنا مشکل ہو'
  },
  {
    id: 'gad6',
    text: 'Becoming easily annoyed or irritable',
    textHi: 'आसानी से परेशان या चिड़चिड़ाहट होना',
    textUr: 'آسانی سے پریشان یا چڑچڑاہٹ ہونا'
  },
  {
    id: 'gad7',
    text: 'Feeling afraid as if something awful might happen',
    textHi: 'डर लगना जैसे कुछ भयानक होने वाला है',
    textUr: 'خوف محسوس کرنا جیسے کچھ خوفناک ہونے والا ہے'
  }
];

const responseOptions = [
  { value: '0', label: 'Not at all', labelHi: 'बिल्कुल नहीं', labelUr: 'بالکل نہیں' },
  { value: '1', label: 'Several days', labelHi: 'कई दिन', labelUr: 'کئی دن' },
  { value: '2', label: 'More than half the days', labelHi: 'आधे से ज्यादा दिन', labelUr: 'آدھے سے زیادہ دن' },
  { value: '3', label: 'Nearly every day', labelHi: 'लगभग हर दिन', labelUr: 'تقریباً ہر دن' }
];

// Sample mood data for the last 7 days
const sampleMoodData: MoodEntry[] = [
  { date: '2024-01-01', phq9Score: 8, gad7Score: 6 },
  { date: '2024-01-02', phq9Score: 10, gad7Score: 8 },
  { date: '2024-01-03', phq9Score: 6, gad7Score: 5 },
  { date: '2024-01-04', phq9Score: 7, gad7Score: 7 },
  { date: '2024-01-05', phq9Score: 5, gad7Score: 4 },
  { date: '2024-01-06', phq9Score: 9, gad7Score: 9 },
  { date: '2024-01-07', phq9Score: 4, gad7Score: 3 }
];

const getScoreSeverity = (score: number, type: 'phq9' | 'gad7') => {
  if (type === 'phq9') {
    if (score <= 4) return { level: 'minimal', color: 'text-success', bgColor: 'bg-success/10' };
    if (score <= 9) return { level: 'mild', color: 'text-warning', bgColor: 'bg-warning/10' };
    if (score <= 14) return { level: 'moderate', color: 'text-orange-500', bgColor: 'bg-orange-500/10' };
    if (score <= 19) return { level: 'moderately severe', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    return { level: 'severe', color: 'text-destructive', bgColor: 'bg-destructive/20' };
  } else {
    if (score <= 4) return { level: 'minimal', color: 'text-success', bgColor: 'bg-success/10' };
    if (score <= 9) return { level: 'mild', color: 'text-warning', bgColor: 'bg-warning/10' };
    if (score <= 14) return { level: 'moderate', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    return { level: 'severe', color: 'text-destructive', bgColor: 'bg-destructive/20' };
  }
};

export function DailyMoodCheck({ language }: DailyMoodCheckProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'phq9' | 'gad7' | 'results'>('dashboard');
  const [phq9Responses, setPhq9Responses] = useState<Record<string, string>>({});
  const [gad7Responses, setGad7Responses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedAssessment, setCompletedAssessment] = useState<'phq9' | 'gad7' | null>(null);

  const texts = {
    en: {
      title: 'Daily Mood Check',
      subtitle: 'Track your mental health with validated assessments',
      takeAssessment: 'Take Assessment',
      phq9Title: 'Depression Screening (PHQ-9)',
      gad7Title: 'Anxiety Screening (GAD-7)',
      phq9Description: 'Patient Health Questionnaire for depression symptoms',
      gad7Description: 'Generalized Anxiety Disorder scale',
      viewTrends: 'View Trends',
      lastCompleted: 'Last completed',
      never: 'Never',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: 'days ago',
      instructions: 'Over the last 2 weeks, how often have you been bothered by the following?',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit Assessment',
      backToDashboard: 'Back to Dashboard',
      retakeAssessment: 'Retake Assessment',
      yourScore: 'Your Score',
      interpretation: 'Interpretation',
      recommendations: 'Recommendations',
      seekHelp: 'Consider seeking professional help',
      crisis: 'If you\'re having thoughts of self-harm, please contact emergency services or call Tele-MANAS: 104',
      trends: 'Mood Trends',
      weeklyAverage: 'Weekly Average',
      trend: 'Trend',
      improving: 'Improving',
      stable: 'Stable',
      declining: 'Needs attention',
      severityLevels: {
        minimal: 'Minimal',
        mild: 'Mild',
        moderate: 'Moderate',
        'moderately severe': 'Moderately Severe',
        severe: 'Severe'
      }
    },
    hi: {
      title: 'दैनिक मूड चेक',
      subtitle: 'मान्य मूल्यांकन के साथ अपने मानसिक स्वास्थ्य को ट्रैक करें',
      takeAssessment: 'मूल्यांकन लें',
      phq9Title: 'अवसाद जांच (PHQ-9)',
      gad7Title: 'चिंता जांच (GAD-7)',
      phq9Description: 'अवसाद के लक्षणों के लिए रोगी स्वास्थ्य प्रश्नावली',
      gad7Description: 'सामान्यीकृत चिंता विकार पैमाना',
      viewTrends: 'रुझान देखें',
      lastCompleted: 'अंतिम बार पूरा किया',
      never: 'कभी नहीं',
      today: 'आज',
      yesterday: 'कल',
      daysAgo: 'दिन पहले',
      instructions: 'पिछले 2 सप्ताह में, आप निम्नलिखित से कितनी बार परेशान हुए हैं?',
      next: 'अगला',
      previous: 'पिछला',
      submit: 'मूल्यांकन जमा करें',
      backToDashboard: 'डैशबोर्ड पर वापस',
      retakeAssessment: 'फिर से मूल्यांकन लें',
      yourScore: 'आपका स्कोर',
      interpretation: 'व्याख्या',
      recommendations: 'सिफारिशें',
      seekHelp: 'पेशेवर मदद लेने पर विचार करें',
      crisis: 'यदि आपके मन में आत्म-हानि के विचार आ रहे हैं, तो कृपया आपातकालीन सेवाओं से संपर्क करें या टेली-मानस कॉल करें: 104',
      trends: 'मूड रुझान',
      weeklyAverage: 'साप्ताहिक औसत',
      trend: 'रुझान',
      improving: 'सुधार',
      stable: 'स्थिर',
      declining: 'ध्यान की आवश्यकता',
      severityLevels: {
        minimal: 'न्यूनतम',
        mild: 'हल्का',
        moderate: 'मध्यम',
        'moderately severe': 'मध्यम गंभीर',
        severe: 'गंभीर'
      }
    },
    ur: {
      title: 'روزانہ موڈ چیک',
      subtitle: 'تصدیق شدہ تشخیص کے ساتھ اپنی ذہنی صحت کو ٹریک کریں',
      takeAssessment: 'تشخیص لیں',
      phq9Title: 'ڈپریشن کی جانچ (PHQ-9)',
      gad7Title: 'پریشانی کی جانچ (GAD-7)',
      phq9Description: 'ڈپریشن کی علامات کے لیے مریض کی صحت کا سوالنامہ',
      gad7Description: 'عمومی اضطراب کی خرابی کا پیمانہ',
      viewTrends: 'رجحانات دیکھیں',
      lastCompleted: 'آخری بار مکمل کیا',
      never: 'کبھی نہیں',
      today: 'آج',
      yesterday: 'کل',
      daysAgo: 'دن پہلے',
      instructions: 'پچھلے 2 ہفتوں میں، آپ مندرجہ ذیل سے کتنی بار پریشان ہوئے ہیں؟',
      next: 'اگلا',
      previous: 'پچھلا',
      submit: 'تشخیص جمع کریں',
      backToDashboard: 'ڈیش بورڈ پر واپس',
      retakeAssessment: 'دوبارہ تشخیص لیں',
      yourScore: 'آپ کا اسکور',
      interpretation: 'تشریح',
      recommendations: 'سفارشات',
      seekHelp: 'پیشہ ورانہ مدد لینے پر غور کریں',
      crisis: 'اگر آپ کے ذہن میں خود کو نقصان پہنچانے کے خیالات آ رہے ہیں تو براہ کرم ایمرجنسی سروسز سے رابطہ کریں یا ٹیلی مانس کال کریں: 104',
      trends: 'موڈ کے رجحانات',
      weeklyAverage: 'ہفتہ وار اوسط',
      trend: 'رجحان',
      improving: 'بہتری',
      stable: 'مستحکم',
      declining: 'توجہ کی ضرورت',
      severityLevels: {
        minimal: 'کم سے کم',
        mild: 'ہلکا',
        moderate: 'اعتدال پسند',
        'moderately severe': 'اعتدال سے شدید',
        severe: 'شدید'
      }
    }
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  const getLocalizedText = (question: Question, language: string) => {
    if (language === 'hi' && question.textHi) return question.textHi;
    if (language === 'ur' && question.textUr) return question.textUr;
    return question.text;
  };

  const getOptionLabel = (option: typeof responseOptions[0], language: string) => {
    if (language === 'hi' && option.labelHi) return option.labelHi;
    if (language === 'ur' && option.labelUr) return option.labelUr;
    return option.label;
  };

  const calculateScore = (responses: Record<string, string>) => {
    return Object.values(responses).reduce((sum, value) => sum + parseInt(value), 0);
  };

  const handleAssessmentComplete = (type: 'phq9' | 'gad7') => {
    setCompletedAssessment(type);
    setCurrentView('results');
  };

  const renderAssessment = (type: 'phq9' | 'gad7') => {
    const questions = type === 'phq9' ? phq9Questions : gad7Questions;
    const responses = type === 'phq9' ? phq9Responses : gad7Responses;
    const setResponses = type === 'phq9' ? setPhq9Responses : setGad7Responses;
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const canProceed = responses[currentQuestion.id];

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => {setCurrentView('dashboard'); setCurrentQuestionIndex(0);}}
          className="mb-6"
        >
          ← {t.backToDashboard}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardTitle>
                {type === 'phq9' ? t.phq9Title : t.gad7Title}
              </CardTitle>
              <Badge variant="outline">
                {currentQuestionIndex + 1} / {questions.length}
              </Badge>
            </div>
            <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">{t.instructions}</p>
              <h3 className="text-lg mb-4">
                {getLocalizedText(currentQuestion, language)}
              </h3>

              <RadioGroup 
                value={responses[currentQuestion.id] || ''} 
                onValueChange={(value) => setResponses(prev => ({...prev, [currentQuestion.id]: value}))}
              >
                {responseOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {getOptionLabel(option, language)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                {t.previous}
              </Button>
              
              {isLastQuestion ? (
                <Button 
                  onClick={() => handleAssessmentComplete(type)}
                  disabled={!canProceed}
                >
                  {t.submit}
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={!canProceed}
                >
                  {t.next}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResults = () => {
    if (!completedAssessment) return null;

    const responses = completedAssessment === 'phq9' ? phq9Responses : gad7Responses;
    const score = calculateScore(responses);
    const severity = getScoreSeverity(score, completedAssessment);
    const maxScore = completedAssessment === 'phq9' ? 27 : 21;

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentView('dashboard')}
          className="mb-6"
        >
          ← {t.backToDashboard}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {completedAssessment === 'phq9' ? t.phq9Title : t.gad7Title}
            </CardTitle>
            <CardDescription>Assessment Results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{score}/{maxScore}</div>
              <Badge className={`${severity.bgColor} ${severity.color} border-0`}>
                {t.severityLevels[severity.level as keyof typeof t.severityLevels]}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${severity.bgColor}`}>
                <h3 className="font-medium mb-2">{t.interpretation}</h3>
                <p className="text-sm">
                  {severity.level === 'minimal' && 'Your responses suggest minimal symptoms. Continue with self-care practices.'}
                  {severity.level === 'mild' && 'Your responses suggest mild symptoms. Consider self-help strategies and monitoring.'}
                  {severity.level === 'moderate' && 'Your responses suggest moderate symptoms. Consider speaking with a counselor.'}
                  {(severity.level === 'moderately severe' || severity.level === 'severe') && 'Your responses suggest significant symptoms. We recommend seeking professional help.'}
                </p>
              </div>

              {(severity.level === 'moderately severe' || severity.level === 'severe') && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Important Notice</span>
                  </div>
                  <p className="text-sm text-destructive/80">{t.seekHelp}</p>
                </div>
              )}

              {/* Crisis warning for specific PHQ-9 question */}
              {completedAssessment === 'phq9' && phq9Responses['phq9'] && parseInt(phq9Responses['phq9']) > 0 && (
                <div className="p-4 bg-destructive border border-destructive rounded-lg text-destructive-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Crisis Support</span>
                  </div>
                  <p className="text-sm">{t.crisis}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setCurrentView(completedAssessment);
                    setCurrentQuestionIndex(0);
                    if (completedAssessment === 'phq9') {
                      setPhq9Responses({});
                    } else {
                      setGad7Responses({});
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {t.retakeAssessment}
                </Button>
                <Button onClick={() => setCurrentView('dashboard')} className="flex-1">
                  {t.backToDashboard}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (currentView === 'phq9' || currentView === 'gad7') {
    return renderAssessment(currentView);
  }

  if (currentView === 'results') {
    return renderResults();
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">{t.title}</h1>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* PHQ-9 Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-primary" />
                <CardTitle>{t.phq9Title}</CardTitle>
              </div>
              <CardDescription>{t.phq9Description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {t.lastCompleted}: {t.yesterday}
                </span>
                <Badge variant="outline">9 questions</Badge>
              </div>
              <Button 
                onClick={() => {setCurrentView('phq9'); setCurrentQuestionIndex(0);}}
                className="w-full"
              >
                {t.takeAssessment}
              </Button>
            </CardContent>
          </Card>

          {/* GAD-7 Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-6 h-6 text-success" />
                <CardTitle>{t.gad7Title}</CardTitle>
              </div>
              <CardDescription>{t.gad7Description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {t.lastCompleted}: {t.today}
                </span>
                <Badge variant="outline">7 questions</Badge>
              </div>
              <Button 
                onClick={() => {setCurrentView('gad7'); setCurrentQuestionIndex(0);}}
                className="w-full"
              >
                {t.takeAssessment}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trends Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                <CardTitle>{t.trends}</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {t.viewTrends}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Depression (PHQ-9)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.weeklyAverage}</span>
                    <span>6.8</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Mild</span>
                    <div className="flex items-center gap-1 text-success">
                      <TrendingDown className="w-3 h-3" />
                      {t.improving}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Anxiety (GAD-7)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.weeklyAverage}</span>
                    <span>5.9</span>
                  </div>
                  <Progress value={28} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Mild</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Minus className="w-3 h-3" />
                      {t.stable}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <CheckCircle className="w-4 h-4" />
                Recent assessments completed consistently
              </div>
              <div className="grid grid-cols-7 gap-2">
                {sampleMoodData.map((entry, index) => (
                  <div 
                    key={entry.date} 
                    className="aspect-square bg-success/20 rounded flex items-center justify-center text-xs font-medium"
                  >
                    {index === 6 ? 'T' : index === 5 ? 'Y' : '✓'}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}