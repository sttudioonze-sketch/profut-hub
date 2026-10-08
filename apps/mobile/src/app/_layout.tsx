import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold, useFonts } from '@expo-google-fonts/roboto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';

import { md3Theme } from '@/theme-md3';
import { ThemeModeProvider, useGlassTheme } from '@/ui/glass-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fonte dos ícones do Paper carregada junto com a Roboto para não piscar.
  const [loaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold, ...MaterialCommunityIcons.font });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    // Modo claro/escuro do glass clean fica acima da pilha para sobreviver à navegação.
    <ThemeModeProvider>
      <PaperProvider theme={md3Theme}>
        <ThemedStack />
      </PaperProvider>
    </ThemeModeProvider>
  );
}

function ThemedStack() {
  const { c } = useGlassTheme();
  // Cada tela define a própria StatusBar. Dashboard e Desempenho são seções do menu: trocam sem
  // a animação de empilhar (o menu substitui a tela, ver NavRow em src/ui/app-shell.tsx).
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.page } }}>
      <Stack.Screen name="painel" options={{ animation: 'none' }} />
      <Stack.Screen name="desempenho" options={{ animation: 'none' }} />
    </Stack>
  );
}
