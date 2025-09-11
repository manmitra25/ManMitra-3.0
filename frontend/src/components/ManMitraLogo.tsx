import { Brain, Heart } from 'lucide-react';

interface ManMitraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ManMitraLogo({ size = 'md', className = '' }: ManMitraLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center relative ${className}`}>
      <Brain className={`${iconSizeClasses[size]} text-white`} />
      <Heart className={`${iconSizeClasses[size === 'sm' ? 'sm' : size === 'md' ? 'sm' : 'md']} text-white absolute -top-1 -right-1 bg-gradient-to-br from-success to-primary rounded-full p-0.5`} />
    </div>
  );
}