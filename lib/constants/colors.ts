export const COLORS = {
  bg: '#0f1013',
  surface: '#16181d',
  border: '#1f2229',
  
  blue: '#0066ff',
  blueLight: '#3385ff',
  yellow: '#f5c400',
  red: '#f53232',
  
  white: '#ffffff',
  muted: '#9499aa',
  faint: '#3a3f4a',
} as const;

export const NETWORK_COLORS = {
  MTN: { bg: COLORS.yellow, text: '#000000' },
  TELECEL: { bg: COLORS.red, text: COLORS.white },
  "AT PREMIUM": { bg: 'linear-gradient(135deg, #f53232 0%, #0066ff 100%)', text: COLORS.white },
} as const;
