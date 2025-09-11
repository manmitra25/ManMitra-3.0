import { useState } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
];

const translations = {
  en: {
    selectLanguage: 'Select Language',
    english: 'English',
    hindi: 'Hindi',
    urdu: 'Urdu'
  },
  hi: {
    selectLanguage: 'भाषा चुनें',
    english: 'अंग्रेजी',
    hindi: 'हिंदी',
    urdu: 'उर्दू'
  },
  ur: {
    selectLanguage: 'زبان منتخب کریں',
    english: 'انگریزی',
    hindi: 'ہندی',
    urdu: 'اردو'
  }
};

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  variant?: 'button' | 'minimal';
}

export function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange, 
  variant = 'button' 
}: LanguageSelectorProps) {
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'button' ? (
          <Button variant="outline" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{currentLang.flag} {currentLang.nativeName}</span>
            <span className="sm:hidden">{currentLang.flag}</span>
          </Button>
        ) : (
          <button className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
            {currentLang.flag} {currentLang.nativeName}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" dir={currentLanguage === 'ur' ? 'rtl' : 'ltr'}>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={`gap-2 ${currentLanguage === language.code ? 'bg-accent' : ''}`}
          >
            <span>{language.flag}</span>
            <span>{language.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}