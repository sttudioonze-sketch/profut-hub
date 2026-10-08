// Teste adaptativo: visual Apple no iPhone, Material 3 no Android (e na web).
import { Platform } from 'react-native';

import DashboardAppleScreen from '@/screens/dashboard-apple';
import DashboardMd3Screen from '@/screens/dashboard-md3';

export default Platform.OS === 'ios' ? DashboardAppleScreen : DashboardMd3Screen;
