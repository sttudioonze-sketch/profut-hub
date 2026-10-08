// Tema no estilo Apple (Human Interface Guidelines, iOS 26). Usado no iPhone.
// Cores do sistema iOS com o vermelho da marca como cor de destaque (tint).
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const apple = {
  tint: '#EB0D0D',
  tintFill: 'rgba(235, 13, 13, 0.12)',
  // Vermelho mais escuro para texto pequeno sobre fundo tingido (contraste AA)
  tintText: '#C40C0C',
  background: '#F2F2F7', // systemGroupedBackground
  card: '#FFFFFF', // secondarySystemGroupedBackground
  label: '#000000',
  // secondaryLabel do iOS (#3C3C43 a 60%) é fraco para texto pequeno; versão sólida com contraste AA
  secondaryLabel: '#6C6C70',
  tertiaryLabel: '#AEAEB2',
  separator: '#C6C6C8',
  gridline: '#E5E5EA',
  fill: 'rgba(118, 118, 128, 0.12)', // tertiarySystemFill
  chevron: '#C4C4C6',
  graphite: '#3A3A3C',
  orange: '#C93400', // systemOrange de alto contraste
  green: '#248A3D', // systemGreen de alto contraste
  greenFill: 'rgba(52, 199, 89, 0.18)',
  barIdle: '#D1D1D6',
  white: '#FFFFFF',
} as const;

// No iPhone a fonte do sistema é a SF Pro (com tracking automático). Na web cai para
// SF no Mac ou Inter, a mais próxima, com tracking ajustado à mão.
const family = Platform.select({ web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif', default: undefined });
const web = Platform.OS === 'web';

function style(fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight'], webTracking: number): TextStyle {
  return { fontFamily: family, fontSize, lineHeight, fontWeight, letterSpacing: web ? webTracking : undefined };
}

// Escala de texto do iOS (Dynamic Type, tamanho padrão)
export const type = {
  largeTitle: style(34, 41, '700', -0.9),
  title1: style(28, 34, '700', -0.7),
  title2: style(22, 28, '700', -0.5),
  title3: style(20, 25, '600', -0.4),
  headline: style(17, 22, '600', -0.35),
  body: style(17, 22, '400', -0.35),
  callout: style(16, 21, '400', -0.3),
  subheadline: style(15, 20, '400', -0.2),
  subheadlineBold: style(15, 20, '600', -0.2),
  footnote: style(13, 18, '400', -0.05),
  footnoteBold: style(13, 18, '600', -0.05),
  caption1: style(12, 16, '400', 0),
  caption2: style(11, 13, '600', 0.05),
} satisfies Record<string, TextStyle>;

// Vidro para a web (no iPhone com iOS 26 é o Liquid Glass nativo do expo-glass-effect).
export const webGlass = (web ? { backdropFilter: 'blur(24px) saturate(180%)' } : {}) as unknown as ViewStyle;
