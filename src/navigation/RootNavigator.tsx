import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeIcon, LeaguesIcon, ProfileIcon, SettingsIcon } from "@/components/icons/NavigationIcons";
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

const tabIcons = {
  Home: HomeIcon,
  Leagues: LeaguesIcon,
  Profile: ProfileIcon,
  Settings: SettingsIcon
};

const tabLabels = {
  Home: "Home",
  Leagues: "Ligas",
  Profile: "Perfil",
  Settings: "Ajustes"
};

function GymLeagueTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key].options;
          const Icon = tabIcons[route.name as keyof typeof tabIcons];
          const label = tabLabels[route.name as keyof typeof tabLabels] ?? route.name;

          function onPress() {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          function onLongPress() {
            navigation.emit({
              type: "tabLongPress",
              target: route.key
            });
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tabItem, focused && styles.tabItemActive, pressed && styles.tabItemPressed]}
            >
              <View style={[styles.tabIconShell, focused && styles.tabIconShellActive]}>
                <Icon focused={focused} size={focused ? 23 : 22} />
              </View>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
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
      tabBar={(props) => <GymLeagueTabBar {...props} />}
      screenOptions={{
        headerShown: false
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Leagues" component={MyLeaguesScreen} options={{ title: "Ligas" }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: "Ajustes" }} />
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

const styles = StyleSheet.create({
  tabBarWrap: {
    backgroundColor: colors.background,
    paddingTop: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#1F2937"
  },
  tabBar: {
    minHeight: 66,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 7,
    paddingVertical: 7,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 18
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  tabItemActive: {
    backgroundColor: "#101F2B"
  },
  tabItemPressed: {
    opacity: 0.75
  },
  tabIconShell: {
    width: 30,
    height: 26,
    alignItems: "center",
    justifyContent: "center"
  },
  tabIconShellActive: {
    borderRadius: 999
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0,
    maxWidth: "100%"
  },
  tabLabelActive: {
    color: colors.primary
  }
});
