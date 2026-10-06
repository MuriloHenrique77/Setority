import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { SessionProvider } from './src/session/SessionProvider';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from './src/theme';
import { navigationTheme } from './src/theme/navigation';
import { FeedbackProvider } from './src/components/ui/FeedbackProvider';

export default function App() {
  const [fontesCarregadas, erroFonte] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  // Nenhuma tela com tipografia de fallback pisca antes das fontes locais.
  if (!fontesCarregadas) return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
    {erroFonte ? <Text style={{ color: colors.danger }}>Não foi possível carregar a interface. Reabra o aplicativo.</Text>
      : <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando interface" />}
  </View>;
  return (
    <SafeAreaProvider>
      <FeedbackProvider>
      <SessionProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SessionProvider>
      </FeedbackProvider>
    </SafeAreaProvider>
  );
}
