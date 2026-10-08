// Tema "glass clean" do app: duas paletas (claro = visual aprovado da página Desempenho,
// escuro = vidro grafite neutro) e o provedor do modo, montado uma vez no _layout raiz
// para o modo sobreviver à navegação entre páginas.
// Regra do Luis: vermelho da marca nunca em fundos ou preenchimentos grandes, só detalhes.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Platform, type ViewStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark';

const light = {
  page: '#F4F4F6',
  text: '#141414',
  muted: '#6E6E6E',
  // Texto secundário direto sobre o fundo (fora de card): a névoa cinza escurece o fundo
  mutedOnPage: '#5E5E5E',
  // Rótulos de eixo dos gráficos (10px): precisa de 4,5:1 sobre o card
  faint: '#6B6B6B',
  navText: '#3A3A3A',
  border: '#EBEBEB',
  // Tons dos gráficos, do mais forte ao mais claro
  ink: '#141414',
  gray1: '#6B6B6B',
  gray2: '#A8A8A8',
  gray3: '#D4D4D4',
  track: '#EDEDED',
  // Texto/ícone sobre preenchimento "ink" (avatar, logo, pílula Ótimo)
  onInk: '#FFFFFF',
  // Fundo neutro suave (círculo de ícone dos KPIs, iniciais de atleta)
  soft: 'rgba(20,20,24,0.05)',
  navActive: 'rgba(255,255,255,0.7)',
  // Borda do item ativo do menu: sem ela a pílula branca some sobre a névoa branca
  navActiveBorder: 'rgba(20,20,24,0.07)',
  segmentOn: '#FFFFFF',
  // Avatares empilhados (eventos): fundo opaco e anel na cor do card
  avatar: '#ECECEF',
  avatarRing: '#FFFFFF',
  blockEmpty: 'rgba(255,255,255,0.7)',
  // Escurece o conteúdo atrás da gaveta (agora preta) para ela se destacar
  scrim: 'rgba(20,20,24,0.22)',
  brand: '#EB0D0D',
  negative: '#C40C0C',
};

export type Palette = typeof light;

const dark: Palette = {
  page: '#161618',
  text: '#F2F2F2',
  muted: '#A3A3A8',
  mutedOnPage: '#A3A3A8',
  faint: '#9A9AA0',
  navText: '#D6D6D9',
  border: 'rgba(255,255,255,0.09)',
  ink: '#F2F2F2',
  gray1: '#A0A0A6',
  gray2: '#6C6C72',
  gray3: '#46464C',
  track: 'rgba(255,255,255,0.08)',
  onInk: '#141414',
  soft: 'rgba(255,255,255,0.07)',
  navActive: 'rgba(255,255,255,0.08)',
  navActiveBorder: 'rgba(255,255,255,0.06)',
  segmentOn: 'rgba(255,255,255,0.14)',
  avatar: '#36363C',
  avatarRing: '#2A2A2F',
  blockEmpty: 'rgba(255,255,255,0.07)',
  scrim: 'rgba(0,0,0,0.45)',
  // Vermelho da marca igual nos dois temas (identidade: escudo, ponto de notificação)
  brand: '#EB0D0D',
  negative: '#FF6B6B',
};

export const palettes: Record<ThemeMode, Palette> = { light, dark };

// Vidro fosco: translúcido + desfoque do que está atrás (na web via backdrop-filter;
// no iPhone com iOS 26 os painéis viram Liquid Glass nativo, ver Pane).
const web = Platform.OS === 'web';
const blur = (px: number) => (web ? { backdropFilter: `blur(${px}px) saturate(170%)` } : {}) as unknown as ViewStyle;
// Brilho na borda de cima + sombra leve. boxShadow funciona na web e no app (RN 0.86, inclusive
// Android e sombra interna); no iOS 26 o Liquid Glass substitui tudo isso (ver Pane).
const rim = (css: string): ViewStyle => ({ boxShadow: css });
// Degradê CSS por cima da cor de fundo: backgroundImage na web, experimental_backgroundImage no app.
const paint = (css: string) => (web ? { backgroundImage: css } : { experimental_backgroundImage: css }) as unknown as ViewStyle;

export type GlassKind = 'panel' | 'drawer' | 'card' | 'control' | 'tooltip' | 'inner';

const glassLight: Record<GlassKind, ViewStyle> = {
  panel: { backgroundColor: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.9)', ...blur(30) },
  // Gaveta sobre o conteúdo no celular: quase opaca. Na web o desfoque não alcança o conteúdo
  // atrás dela (cada View do react-native-web isola o empilhamento), então o texto competiria.
  drawer: { backgroundColor: 'rgba(250,250,252,0.97)', borderColor: 'rgba(255,255,255,0.9)', ...blur(36) },
  card: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    ...rim('inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 30px rgba(20,20,24,0.06)'),
    ...blur(26),
  },
  control: { backgroundColor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(225,225,230,0.9)', ...blur(14) },
  // Quase opaca: a linha do gráfico não aparece atrás do texto da dica
  tooltip: { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.95)', ...blur(18) },
  // Card dentro de card (eventos): vidro mais leve, sem sombra grande
  inner: { backgroundColor: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.95)', ...rim('inset 0 1px 0 rgba(255,255,255,0.9)') },
};

const glassDark: Record<GlassKind, ViewStyle> = {
  panel: { backgroundColor: 'rgba(30,30,34,0.6)', borderColor: 'rgba(255,255,255,0.07)', ...blur(30) },
  drawer: { backgroundColor: 'rgba(28,28,32,0.95)', borderColor: 'rgba(255,255,255,0.08)', ...blur(36) },
  card: {
    backgroundColor: 'rgba(36,36,40,0.55)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    ...rim('inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.28)'),
    ...blur(26),
  },
  control: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', ...blur(14) },
  tooltip: { backgroundColor: 'rgba(44,44,50,0.85)', borderColor: 'rgba(255,255,255,0.1)', ...blur(18) },
  inner: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', ...rim('inset 0 1px 0 rgba(255,255,255,0.04)') },
};

export const glassStyles: Record<ThemeMode, Record<GlassKind, ViewStyle>> = { light: glassLight, dark: glassDark };

// Menu lateral em vidro preto nos dois temas (pedido do Luis, conceito "glass morphism modern"):
// base quase preta, rótulos cinza, item ativo em pílula de vidro escura e brilhante e controles
// em vidro escuro. O conteúdo e a barra superior seguem o tema do app; só o menu fica preto.
const menuPalette: Palette = {
  ...dark,
  page: '#141416',
  text: '#F5F5F7',
  // Rótulos de seção e ícones: 5,2:1 sobre a base do menu (AA)
  muted: '#8E8E93',
  mutedOnPage: '#8E8E93',
  faint: '#8E8E93',
  navText: '#C7C7CC',
  border: 'rgba(255,255,255,0.08)',
  ink: '#F5F5F7',
  onInk: '#141416',
  track: 'rgba(255,255,255,0.12)',
  soft: 'rgba(255,255,255,0.08)',
  navActive: 'rgba(255,255,255,0.1)',
  navActiveBorder: 'rgba(255,255,255,0.14)',
};

// Tons próprios do menu que não existem na paleta das páginas
export const menuTone = {
  // Texto e ícone sobre a pílula ativa de vidro
  activeText: '#FFFFFF',
  hover: 'rgba(255,255,255,0.06)',
  pressed: 'rgba(255,255,255,0.1)',
  divider: 'rgba(255,255,255,0.07)',
  // Tinta do Liquid Glass (iOS 26) para o vidro ficar preto sobre o fundo claro
  tint: 'rgba(12,12,14,0.82)',
};

// Brilho diagonal de vidro no canto de cima do menu
const menuSheen = 'linear-gradient(160deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.02) 28%, rgba(255,255,255,0) 55%)';

// Pílula de vidro brilhante (botão de destaque no menu): degradê branco translúcido, borda clara
// e brilho interno na borda de cima.
export const menuGloss: ViewStyle = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.14)',
  ...paint('linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)'),
  ...rim('inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.25)'),
};

const menuGlass: Record<GlassKind, ViewStyle> = {
  // Web: preto translúcido com desfoque. App: preto sólido (sem desfoque de fundo no RN).
  panel: {
    backgroundColor: web ? 'rgba(14,14,16,0.94)' : '#141416',
    borderColor: 'rgba(255,255,255,0.07)',
    ...paint(menuSheen),
    ...rim('1px 0 0 rgba(0,0,0,0.18), 10px 0 30px rgba(10,10,12,0.08)'),
    ...blur(30),
  },
  drawer: {
    backgroundColor: web ? 'rgba(14,14,16,0.97)' : '#141416',
    borderColor: 'rgba(255,255,255,0.08)',
    ...paint(menuSheen),
    ...rim('16px 0 48px rgba(0,0,0,0.35)'),
    ...blur(36),
  },
  card: glassDark.card,
  // Seletor de equipe: vidro escuro com brilho fino em cima
  control: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)', ...rim('inset 0 1px 0 rgba(255,255,255,0.05)') },
  tooltip: glassDark.tooltip,
  // Caixa embutida (plano): mais escura que o menu, borda clara sutil, sombra interna
  inner: { backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.08)', ...rim('inset 0 1px 3px rgba(0,0,0,0.55)') },
};

// Fundo: base em degradê + manchas radiais bem leves só para o vidro ter o que desfocar.
// Claro: quase branco com névoa prata. Escuro: carvão com névoa cinza. Nunca vermelho.
export const backdrops: Record<ThemeMode, { base: [string, string]; blobs: { color: string; opacity: number; x: number; y: number; r: number }[] }> = {
  light: {
    base: ['#FAFAFB', '#ECECF0'],
    blobs: [
      { color: '#FFFFFF', opacity: 1, x: 0.1, y: 0.05, r: 0.55 },
      { color: '#C9CAD3', opacity: 0.55, x: 0.92, y: 0.1, r: 0.4 },
      { color: '#D3D4DC', opacity: 0.5, x: 0.85, y: 0.95, r: 0.45 },
      { color: '#D8D8DE', opacity: 0.55, x: 0.18, y: 0.8, r: 0.42 },
      { color: '#FFFFFF', opacity: 0.9, x: 0.55, y: 0.45, r: 0.32 },
    ],
  },
  dark: {
    base: ['#1C1C20', '#111113'],
    blobs: [
      { color: '#2E2E34', opacity: 0.9, x: 0.1, y: 0.05, r: 0.55 },
      { color: '#3A3A42', opacity: 0.35, x: 0.92, y: 0.1, r: 0.4 },
      { color: '#34343B', opacity: 0.3, x: 0.85, y: 0.95, r: 0.45 },
      { color: '#303036', opacity: 0.35, x: 0.18, y: 0.8, r: 0.42 },
      { color: '#26262B', opacity: 0.5, x: 0.55, y: 0.45, r: 0.32 },
    ],
  },
};

type ThemeValue = { mode: ThemeMode; c: Palette; g: Record<GlassKind, ViewStyle>; setMode: (m: ThemeMode) => void; toggle: () => void };

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const value = useMemo<ThemeValue>(
    () => ({ mode, c: palettes[mode], g: glassStyles[mode], setMode, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
    [mode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Tema do menu lateral: mesmo provedor, paleta e vidro pretos (o modo e a troca seguem os do app).
export function MenuTheme({ children }: { children: ReactNode }) {
  const outer = useGlassTheme();
  const value = useMemo<ThemeValue>(() => ({ ...outer, mode: 'dark', c: menuPalette, g: menuGlass }), [outer]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useGlassTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useGlassTheme precisa do ThemeModeProvider (src/app/_layout.tsx)');
  return value;
}
