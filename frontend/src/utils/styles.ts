export const getGradientClass = (type: 'primary' | 'secondary' | 'accent' = 'primary') => {
  const gradients = {
    primary: 'gradient-primary',
    secondary: 'gradient-secondary',
    accent: 'gradient-accent',
  };
  return gradients[type];
};

export const getAnimationDelay = (index: number, baseDelay: number = 0.1) => {
  return `${index * baseDelay}s`;
};

export const getResponsiveSpacing = (mobile: string, tablet: string, desktop: string) => {
  return `${mobile} md:${tablet} lg:${desktop}`;
};

export const getTextGradient = (fromColor: string, toColor: string) => {
  return `bg-gradient-to-r from-${fromColor} to-${toColor} bg-clip-text text-transparent`;
};

export const getThemeColors = () => {
  return {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
  };
};

export const getGradientBackground = (type: 'primary' | 'secondary' | 'accent' = 'primary') => {
  const colors = getThemeColors();
  const gradients = {
    primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
    accent: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
  };
  return gradients[type];
};

export const getAnimationClass = (type: 'fade-in' | 'slide-up' | 'slide-down' | 'scale-in' = 'fade-in') => {
  return `animate-${type}`;
};

export const getFocusRingClass = () => {
  return 'focus-ring';
};

export const getButtonClass = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary') => {
  return `btn btn-${variant}`;
};

export const getCardClass = () => {
  return 'card';
};

export const getInputClass = () => {
  return 'input';
};

export const getTextareaClass = () => {
  return 'textarea';
}; 