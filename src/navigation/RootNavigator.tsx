import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { OnboardingScreen } from "@/screens/onboarding/OnboardingScreen";
import { CheckinScreen } from "@/screens/main/CheckinScreen";
import { ChallengesScreen } from "@/screens/main/ChallengesScreen";
import { CreateLeagueScreen } from "@/screens/main/CreateLeagueScreen";
import { FeedScreen } from "@/screens/main/FeedScreen";
import { HomeScreen } from "@/screens/main/HomeScreen";
import { JoinLeagueScreen } from "@/screens/main/JoinLeagueScreen";
import { LeagueDetailsScreen } from "@/screens/main/LeagueDetailsScreen";
import { MyLeaguesScreen } from "@/screens/main/MyLeaguesScreen";
import { ProfileScreen } from "@/screens/main/ProfileScreen";
import { RankingScreen } from "@/screens/main/RankingScreen";
import { SettingsScreen } from "@/screens/main/SettingsScreen";
import { useAuth } from "@/features/auth/AuthProvider";
import { colors } from "@/theme/colors";
import { AuthStackParamList, MainStackParamList, MainTabsParamList } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tabs = createBottomTabNavigator<MainTabsParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary
  }
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ color: focused ? colors.primary : colors.muted, fontSize: 18 }}>{label}</Text>;
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 68 },
        tabBarLabelStyle: { fontWeight: "700", marginBottom: 8 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="⌂" focused={focused} /> }} />
      <Tabs.Screen name="Leagues" component={MyLeaguesScreen} options={{ title: "Ligas", tabBarIcon: ({ focused }) => <TabIcon label="#" focused={focused} /> }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil", tabBarIcon: ({ focused }) => <TabIcon label="◎" focused={focused} /> }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: "Ajustes", tabBarIcon: ({ focused }) => <TabIcon label="⚙" focused={focused} /> }} />
    </Tabs.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <MainStack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <MainStack.Screen name="CreateLeague" component={CreateLeagueScreen} options={{ title: "Criar liga" }} />
      <MainStack.Screen name="JoinLeague" component={JoinLeagueScreen} options={{ title: "Entrar em liga" }} />
      <MainStack.Screen name="LeagueDetails" component={LeagueDetailsScreen} options={{ title: "Liga" }} />
      <MainStack.Screen name="Ranking" component={RankingScreen} options={{ title: "Ranking" }} />
      <MainStack.Screen name="Checkin" component={CheckinScreen} options={{ title: "Check-in" }} />
      <MainStack.Screen name="Feed" component={FeedScreen} options={{ title: "Feed" }} />
      <MainStack.Screen name="Challenges" component={ChallengesScreen} options={{ title: "Desafios" }} />
    </MainStack.Navigator>
  );
}

export function RootNavigator() {
  const { session } = useAuth();

  return <NavigationContainer theme={navTheme}>{session ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
