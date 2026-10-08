import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold, useFonts } from '@expo-google-fonts/roboto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';

import { colors } from '@/theme';
import { md3Theme } from '@/theme-md3';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fonte dos ícones do Paper carregada junto com a Roboto para não piscar.
  const [loaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold, ...MaterialCommunityIcons.font });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <PaperProvider theme={md3Theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </PaperProvider>
  );
}
