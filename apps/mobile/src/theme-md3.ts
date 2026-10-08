// Tema Material Design 3 (teste). Esquema gerado com @material/material-color-utilities
// (SchemeContent, semente #EB0D0D): o vermelho da marca vira primaryContainer.
import { configureFonts, MD3LightTheme, useTheme } from 'react-native-paper';

import { fonts } from '@/theme';

// Uma família por peso; fontWeight 'normal' evita negrito sintético no Android e na web.
const regular = { fontFamily: fonts.regular, fontWeight: 'normal' as const };
const medium = { fontFamily: fonts.medium, fontWeight: 'normal' as const };

const fontConfig = {
  displayLarge: regular,
  displayMedium: regular,
  displaySmall: regular,
  headlineLarge: regular,
  headlineMedium: regular,
  headlineSmall: regular,
  titleLarge: regular,
  titleMedium: medium,
  titleSmall: medium,
  labelLarge: medium,
  labelMedium: medium,
  labelSmall: medium,
  bodyLarge: regular,
  bodyMedium: regular,
  bodySmall: regular,
};

// Papéis de superfície do MD3 atual (o Paper 5 ainda usa elevation.levelN).
const surfaces = {
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f4f3f3',
  surfaceContainer: '#efeded',
  surfaceContainerHigh: '#e9e8e8',
  surfaceContainerHighest: '#e3e2e2',
  surfaceDim: '#dbdad9',
};

const typescale = configureFonts({ config: fontConfig });

export const md3Theme = {
  ...MD3LightTheme,
  // `default` é usado por textos sem variant (List.Item, Avatar.Text).
  fonts: { ...typescale, default: { ...typescale.default, ...regular } },
  colors: {
    ...MD3LightTheme.colors,
    primary: '#be0004',
    onPrimary: '#ffffff',
    primaryContainer: '#eb0d0d',
    onPrimaryContainer: '#ffffff',
    secondary: '#b22b20',
    onSecondary: '#ffffff',
    // Container secundário em tom 90 (estilo TonalSpot) em vez do #fe6250 do SchemeContent:
    // pílulas de navegação e botões segmentados ficam claros, como no Google Agenda.
    secondaryContainer: '#ffdad4',
    onSecondaryContainer: '#410001',
    tertiary: '#825400',
    onTertiary: '#ffffff',
    tertiaryContainer: '#a36a00',
    onTertiaryContainer: '#ffffff',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    background: '#faf9f9',
    onBackground: '#1b1c1c',
    surface: '#faf9f9',
    onSurface: '#1b1c1c',
    surfaceVariant: '#e1e3e3',
    onSurfaceVariant: '#444748',
    outline: '#747878',
    outlineVariant: '#c4c7c7',
    inverseSurface: '#2f3031',
    inverseOnSurface: '#f2f0f0',
    inversePrimary: '#ffb4a9',
    elevation: {
      level0: 'transparent',
      level1: surfaces.surfaceContainerLow,
      level2: surfaces.surfaceContainer,
      level3: surfaces.surfaceContainerHigh,
      level4: surfaces.surfaceContainerHigh,
      level5: surfaces.surfaceContainerHighest,
    },
    ...surfaces,
    // Grafite da marca para treinos; verde tom 40 para tendência positiva (contraste AA).
    graphite: '#464747',
    onGraphite: '#ffffff',
    success: '#146c2e',
    successContainer: '#c4eed0',
    onSuccessContainer: '#002109',
    // Âmbar claro (tom 90 do terciário) para avisos como atleta pendurado.
    warningContainer: '#ffddb3',
    onWarningContainer: '#291800',
  },
};

export type AppTheme = typeof md3Theme;
export const useAppTheme = () => useTheme<AppTheme>();
