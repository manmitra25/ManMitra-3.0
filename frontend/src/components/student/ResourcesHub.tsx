import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { BookOpen, Play, Clock, Users, CheckCircle, ArrowRight, Heart, Brain, Shield } from 'lucide-react';

interface ResourcesHubProps {
  language: string;
}

interface Resource {
  id: string;
  title: string;
  titleHi?: string;
  titleUr?: string;
  description: string;
  descriptionHi?: string;
  descriptionUr?: string;
  duration: string;
  type: 'cbt' | 'meditation' | 'guide' | 'exercise';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'relationships' | 'academic';
  progress?: number;
  isCompleted?: boolean;
  culturalContext?: 'general' | 'kashmir' | 'jammu';
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Understanding Anxiety',
    titleHi: 'चिंता को समझना',
    titleUr: 'پریشانی کو سمجھنا',
    description: 'Learn about anxiety symptoms and coping strategies',
    descriptionHi: 'चिंता के लक्षणों और निपटने की रणनीतियों के बारे में जानें',
    descriptionUr: 'پریشانی کی علامات اور اس سے نمٹنے کی حکمت عملیوں کے بارے میں جانیں',
    duration: '15 min',
    type: 'cbt',
    difficulty: 'beginner',
    category: 'anxiety',
    progress: 60,
    culturalContext: 'general'
  },
  {
    id: '2',
    title: 'Mindful Breathing for Peace',
    titleHi: 'शांति के लिए सचेत सांस लेना',
    titleUr: 'سکون کے لیے ہوشیار سانس',
    description: 'Traditional breathing techniques adapted for modern life',
    descriptionHi: 'आधुनिक जीवन के लिए अनुकूलित पारंपरिक सांस लेने की तकनीकें',
    descriptionUr: 'جدید زندگی کے لیے موزوں روایتی سانس کی تکنیکیں',
    duration: '10 min',
    type: 'meditation',
    difficulty: 'beginner',
    category: 'stress',
    culturalContext: 'kashmir'
  },
  {
    id: '3',
    title: 'Academic Stress Management',
    titleHi: 'शैक्षणिक तनाव प्रबंधन',
    titleUr: 'تعلیمی دباؤ کا انتظام',
    description: 'Strategies for managing exam stress and academic pressure',
    descriptionHi: 'परीक्षा के तनाव और शैक्षणिक दबाव को संभालने की रणनीतियां',
    descriptionUr: 'امتحان کے دباؤ اور تعلیمی دباؤ کو سنبھالنے کی حکمت عملیاں',
    duration: '20 min',
    type: 'guide',
    difficulty: 'intermediate',
    category: 'academic',
    culturalContext: 'general'
  },
  {
    id: '4',
    title: 'Sleep Hygiene for Students',
    titleHi: 'छात्रों के लिए नींद की स्वच्छता',
    titleUr: 'طلباء کے لیے نیند کی صفائی',
    description: 'Improve your sleep quality with proven techniques',
    descriptionHi: 'सिद्ध तकनीकों के साथ अपनी नींद की गुणवत्ता में सुधार करें',
    descriptionUr: 'ثابت شدہ تکنیکوں کے ساتھ اپنی نیند کا معیار بہتر بنائیں',
    duration: '12 min',
    type: 'guide',
    difficulty: 'beginner',
    category: 'sleep',
    culturalContext: 'general'
  },
  {
    id: '5',
    title: 'Building Resilience in Challenging Times',
    titleHi: 'चुनौतीपूर्ण समय में लचीलापन बनाना',
    titleUr: 'مشکل وقتوں میں لچک پیدا کرنا',
    description: 'Develop emotional strength and adaptability',
    descriptionHi: 'भावनात्मक शक्ति और अनुकूलन क्षमता विकसित करें',
    descriptionUr: 'جذباتی طاقت اور موافقت پذیری تیار کریں',
    duration: '25 min',
    type: 'cbt',
    difficulty: 'advanced',
    category: 'stress',
    culturalContext: 'kashmir'
  },
  {
    id: '6',
    title: 'Progressive Muscle Relaxation',
    titleHi: 'प्रगतिशील मांसपेशी विश्राम',
    titleUr: 'ترقی پسند پیشی آرام',
    description: 'Step-by-step muscle relaxation for stress relief',
    descriptionHi: 'तनाव राहत के लिए चरणबद्ध मांसपेशी विश्राम',
    descriptionUr: 'تناؤ کی راحت کے لیے قدم بہ قدم پیشی آرام',
    duration: '18 min',
    type: 'exercise',
    difficulty: 'beginner',
    category: 'stress',
    culturalContext: 'general'
  }
];

const categories = [
  { id: 'all', label: 'All Resources', labelHi: 'सभी संसाधन', labelUr: 'تمام وسائل', icon: BookOpen },
  { id: 'anxiety', label: 'Anxiety', labelHi: 'चिंता', labelUr: 'پریشانی', icon: Heart },
  { id: 'depression', label: 'Depression', labelHi: 'अवसाد', labelUr: 'ڈپریشن', icon: Brain },
  { id: 'stress', label: 'Stress', labelHi: 'तनाव', labelUr: 'تناؤ', icon: Shield },
  { id: 'sleep', label: 'Sleep', labelHi: 'नींद', labelUr: 'نیند', icon: Clock },
  { id: 'academic', label: 'Academic', labelHi: 'शैक्षणिक', labelUr: 'تعلیمی', icon: BookOpen },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'cbt': return <Brain className="w-4 h-4" />;
    case 'meditation': return <Heart className="w-4 h-4" />;
    case 'guide': return <BookOpen className="w-4 h-4" />;
    case 'exercise': return <Play className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

const getTypeLabel = (type: string, language: string = 'en') => {
  const labels = {
    cbt: { en: 'CBT Module', hi: 'CBT मॉड्यूल', ur: 'CBT ماڈیول' },
    meditation: { en: 'Meditation', hi: 'ध्यान', ur: 'مراقبہ' },
    guide: { en: 'Guide', hi: 'गाइड', ur: 'رہنمائی' },
    exercise: { en: 'Exercise', hi: 'अभ्यास', ur: 'ورزش' }
  };
  return labels[type as keyof typeof labels]?.[language as keyof typeof labels.cbt] || labels[type as keyof typeof labels]?.en || type;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-success/10 text-success border-success/20';
    case 'intermediate': return 'bg-warning/10 text-warning border-warning/20';
    case 'advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getLocalizedText = (resource: Resource, field: keyof Resource, language: string) => {
  if (language === 'hi' && field === 'title' && resource.titleHi) return resource.titleHi;
  if (language === 'ur' && field === 'title' && resource.titleUr) return resource.titleUr;
  if (language === 'hi' && field === 'description' && resource.descriptionHi) return resource.descriptionHi;
  if (language === 'ur' && field === 'description' && resource.descriptionUr) return resource.descriptionUr;
  return resource[field] as string;
};

export function ResourcesHub({ language }: ResourcesHubProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  const texts = {
    en: {
      title: 'Resources Hub',
      subtitle: 'Evidence-based mental health resources and exercises',
      startLearning: 'Start Learning',
      continue: 'Continue',
      completed: 'Completed',
      minutes: 'min',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      backToResources: 'Back to Resources',
      culturalNote: 'Culturally adapted for J&K region'
    },
    hi: {
      title: 'संसाधन केंद्र',
      subtitle: 'साक्ष्य-आधारित मानसिक स्वास्थ्य संसाधन और अभ्यास',
      startLearning: 'सीखना शुरू करें',
      continue: 'जारी रखें',
      completed: 'पूर्ण',
      minutes: 'मिनट',
      beginner: 'शुरुआती',
      intermediate: 'मध्यम',
      advanced: 'उन्नत',
      backToResources: 'संसाधनों पर वापस जाएं',
      culturalNote: 'जम्मू और कश्मीर क्षेत्र के लिए सांस्कृतिक रूप से अनुकूलित'
    },
    ur: {
      title: 'وسائل کا مرکز',
      subtitle: 'شواہد پر مبنی ذہنی صحت کے وسائل اور مشقیں',
      startLearning: 'سیکھنا شروع کریں',
      continue: 'جاری رکھیں',
      completed: 'مکمل',
      minutes: 'منٹ',
      beginner: 'ابتدائی',
      intermediate: 'درمیانی',
      advanced: 'اعلیٰ درجے کا',
      backToResources: 'وسائل پر واپس جائیں',
      culturalNote: 'جموں و کشمیر کے علاقے کے لیے ثقافتی طور پر موزوں'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  if (selectedResource) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedResource(null)}
          className="mb-6"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          {t.backToResources}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              {getTypeIcon(selectedResource.type)}
              <Badge variant="outline" className={getDifficultyColor(selectedResource.difficulty)}>
                {t[selectedResource.difficulty as keyof typeof t]}
              </Badge>
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                {selectedResource.duration}
              </Badge>
            </div>
            <CardTitle className="text-2xl">
              {getLocalizedText(selectedResource, 'title', language)}
            </CardTitle>
            <CardDescription className="text-base">
              {getLocalizedText(selectedResource, 'description', language)}
            </CardDescription>
            {selectedResource.culturalContext === 'kashmir' && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-2 rounded-lg">
                <Shield className="w-4 h-4" />
                {t.culturalNote}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedResource.progress && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{selectedResource.progress}%</span>
                </div>
                <Progress value={selectedResource.progress} className="h-2" />
              </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg mb-3">Resource Content</h3>
                <p className="text-muted-foreground mb-4">
                  This is a placeholder for the actual resource content. In a real implementation, 
                  this would contain interactive modules, videos, audio guides, or step-by-step exercises.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">What you'll learn:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Understanding core concepts</li>
                      <li>• Practical techniques</li>
                      <li>• Real-life applications</li>
                      <li>• Progress tracking</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Prerequisites:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Basic understanding of emotions</li>
                      <li>• Willingness to practice</li>
                      <li>• Quiet environment</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  {selectedResource.progress ? t.continue : t.startLearning}
                </Button>
                {selectedResource.isCompleted && (
                  <Button variant="outline" className="text-success border-success">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t.completed}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">{t.title}</h1>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              const label = language === 'hi' && category.labelHi ? category.labelHi
                         : language === 'ur' && category.labelUr ? category.labelUr
                         : category.label;
              
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card 
                  key={resource.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => setSelectedResource(resource)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.type)}
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(resource.type, language)}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {resource.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {getLocalizedText(resource, 'title', language)}
                    </CardTitle>
                    <CardDescription>
                      {getLocalizedText(resource, 'description', language)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(resource.difficulty)}`}
                      >
                        {t[resource.difficulty as keyof typeof t]}
                      </Badge>
                      {resource.culturalContext === 'kashmir' && (
                        <Badge variant="outline" className="text-xs text-primary border-primary/20">
                          J&K Adapted
                        </Badge>
                      )}
                    </div>
                    
                    {resource.progress && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{resource.progress}%</span>
                        </div>
                        <Progress value={resource.progress} className="h-1" />
                      </div>
                    )}
                    
                    {resource.isCompleted && (
                      <div className="flex items-center text-success text-sm mt-3">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t.completed}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg mb-2">No resources found</h3>
            <p className="text-muted-foreground">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
}