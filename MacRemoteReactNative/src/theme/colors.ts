export const colors = {
  background: {
    primary: '#0A0F1C',
    secondary: '#131A2D',
    tertiary: '#1A2238',
    card: 'rgba(26, 34, 56, 0.8)',
    glass: 'rgba(26, 34, 56, 0.6)',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#B0B7C3',
    tertiary: '#8A93A5',
    disabled: '#6B7280',
  },

  accent: {
    primary: '#06B6D4',
    secondary: '#0891B2',
    tertiary: '#0E7490',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  status: {
    online: '#10B981',
    offline: '#EF4444',
    connecting: '#F59E0B',
  },

  interactive: {
    hover: 'rgba(6, 182, 212, 0.1)',
    pressed: 'rgba(6, 182, 212, 0.2)',
    focus: 'rgba(6, 182, 212, 0.3)',
  },

  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    strong: 'rgba(255, 255, 255, 0.3)',
  },

  shadow: {
    soft: '0 4px 12px rgba(0, 0, 0, 0.3)',
    medium: '0 8px 24px rgba(0, 0, 0, 0.4)',
    strong: '0 12px 32px rgba(0, 0, 0, 0.5)',
  },
};

export const typography = {
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};
