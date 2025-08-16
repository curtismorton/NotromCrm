// Design tokens for CurtisOS Neon Noir theme
export const tokens = {
  // Colors - Background
  bg: {
    950: '#0A0A0C',
  },
  
  // Surfaces
  surface: {
    0: '#0E0E11',
    1: '#121216', 
    2: '#16161C',
    3: '#1B1B22',
  },
  
  // Borders
  border: {
    1: 'rgba(255,255,255,0.06)',
    2: 'rgba(255,255,255,0.10)',
  },
  
  // Text colors
  ink: {
    100: '#EBF0F3',
    200: '#D2D8DC',
    300: '#AAB2BA',
    400: '#888E96',
  },
  
  // Action colors
  action: {
    cyan: {
      600: '#00FFF5',
      500: '#00E6E0', 
      400: '#00CFCB',
    },
  },
  
  // Status colors
  momentum: {
    pink: {
      500: '#FF007F',
    },
  },
  
  alert: {
    yellow: {
      500: '#FFDD44',
    },
  },
  
  ok: {
    500: '#27D3A6',
  },
  
  warn: {
    500: '#FF9F1C',
  },
  
  danger: {
    500: '#FF4D6D',
  },
  
  // Spacing
  spacing: {
    8: '8px',
    12: '12px', 
    16: '16px',
    24: '24px',
    32: '32px',
    48: '48px',
  },
  
  // Border radius
  radius: {
    card: '14px',
    input: '10px',
    pill: '999px',
  },
  
  // Shadows
  shadow: {
    raise: '0 8px 24px rgba(0,0,0,0.35)',
  },
  
  // Focus
  focus: {
    ring: '0 0 0 3px rgba(0,255,245,0.35)',
  },
  
  // Motion
  motion: {
    duration: '160ms',
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  
  // Typography
  font: {
    stack: 'Inter, SF, "Segoe UI", Roboto, Ubuntu, Arial, sans-serif',
    size: {
      base: '16px',
      meta: '12px',
      h3: '20px',
      h2: '24px', 
      h1: '28px',
    },
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    leading: {
      normal: '1.35',
    },
  },
} as const;

export type Tokens = typeof tokens;