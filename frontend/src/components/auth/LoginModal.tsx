import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Eye, EyeOff, Loader2, Heart, Shield, Users } from 'lucide-react';
import { useAuth } from './AuthProvider';

const translations = {
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    institution: 'Institution',
    role: 'Role',
    student: 'Student',
    counselor: 'Counselor',
    admin: 'College Admin',
    signInButton: 'Sign In',
    signUpButton: 'Create Account',
    forgotPassword: 'Forgot password?',
    orContinueWith: 'Or continue with',
    google: 'Google',
    facebook: 'Facebook',
    github: 'GitHub',
    privacyNote: 'By creating an account, you agree to our privacy policy',
    features: {
      privacy: 'Complete Privacy',
      support: '24/7 AI Support',
      community: 'Peer Community'
    },
    loading: 'Please wait...',
    emailPlaceholder: 'your.email@example.com',
    passwordPlaceholder: 'Enter your password',
    namePlaceholder: 'Your full name',
    institutionPlaceholder: 'Your college/university'
  },
  hi: {
    signIn: 'साइन इन करें',
    signUp: 'साइन अप करें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'पूरा नाम',
    institution: 'संस्थान',
    role: 'भूमिका',
    student: 'छात्र',
    counselor: 'काउंसलर',
    admin: 'कॉलेज एडमिन',
    signInButton: 'साइन इन करें',
    signUpButton: 'खाता बनाएं',
    forgotPassword: 'पासवर्ड भूल गए?',
    orContinueWith: 'या जारी रखें',
    google: 'गूगल',
    facebook: 'फेसबुक',
    github: 'गिटहब',
    privacyNote: 'खाता बनाकर, आप हमारी गोपनीयता नीति से सहमत होते हैं',
    features: {
      privacy: 'पूर्ण गोपनीयता',
      support: '24/7 AI सहायता',
      community: 'साथी समुदाय'
    },
    loading: 'कृपया प्रतीक्षा करें...',
    emailPlaceholder: 'your.email@example.com',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    namePlaceholder: 'आपका पूरा नाम',
    institutionPlaceholder: 'आपका कॉलेज/विश्वविद्यालय'
  },
  ur: {
    signIn: 'سائن ان کریں',
    signUp: 'سائن اپ کریں',
    email: 'ای میل',
    password: 'پاس ورڈ',
    name: 'پورا نام',
    institution: 'ادارہ',
    role: 'کردار',
    student: 'طالب علم',
    counselor: 'مشیر',
    admin: 'کالج ایڈمن',
    signInButton: 'سائن ان کریں',
    signUpButton: 'اکاؤنٹ بنائیں',
    forgotPassword: 'پاس ورڈ بھول گئے؟',
    orContinueWith: 'یا جاری رکھیں',
    google: 'گوگل',
    facebook: 'فیس بک',
    github: 'گٹ ہب',
    privacyNote: 'اکاؤنٹ بنا کر، آپ ہماری رازداری کی پالیسی سے متفق ہیں',
    features: {
      privacy: 'مکمل رازداری',
      support: '24/7 AI مدد',
      community: 'ساتھی برادری'
    },
    loading: 'برائے کرم انتظار کریں...',
    emailPlaceholder: 'your.email@example.com',
    passwordPlaceholder: 'اپنا پاس ورڈ داخل کریں',
    namePlaceholder: 'آپ کا پورا نام',
    institutionPlaceholder: 'آپ کا کالج / یونیورسٹی'
  }
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  userRole?: 'student' | 'counselor' | 'admin';
}

export function LoginModal({ isOpen, onClose, language, userRole = 'student' }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    name: '',
    role: userRole,
    institution: ''
  });

  const { signIn, signUp } = useAuth();
  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(signInData.email, signInData.password);
      if (result.error) {
        setError(result.error);
      } else {
        // Close modal immediately on successful sign in
        onClose();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signUp(signUpData);
      if (result.error) {
        setError(result.error);
      } else {
        // Close modal and show success message
        onClose();
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An unexpected error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    setIsLoading(true);
    setError('');
    
    try {
      // Note: Social login not implemented in this demo
      // For demo purposes, showing placeholder
      alert(`Social login with ${provider} is not implemented in this demo. Please use email/password authentication.`);
    } catch (error) {
      setError('Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to access ManMitra features
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full"
        >
          <div className="bg-gradient-to-br from-primary/10 to-success/10 p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl mb-2">ManMitra</h2>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>{t.features.privacy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{t.features.community}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t.signIn}</TabsTrigger>
                <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t.email}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t.password}</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t.passwordPlaceholder}
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.loading}
                      </>
                    ) : (
                      t.signInButton
                    )}
                  </Button>

                  <Button type="button" variant="link" className="w-full text-sm">
                    {t.forgotPassword}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t.name}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={signUpData.name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t.email}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t.password}</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t.passwordPlaceholder}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">{t.role}</Label>
                    <Select
                      value={signUpData.role}
                      onValueChange={(value: any) => setSignUpData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">{t.student}</SelectItem>
                        <SelectItem value="counselor">{t.counselor}</SelectItem>
                        <SelectItem value="admin">{t.admin}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-institution">{t.institution}</Label>
                    <Input
                      id="signup-institution"
                      type="text"
                      placeholder={t.institutionPlaceholder}
                      value={signUpData.institution}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, institution: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.loading}
                      </>
                    ) : (
                      t.signUpButton
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {t.privacyNote}
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t.orContinueWith}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {t.google}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {t.facebook}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {t.github}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}