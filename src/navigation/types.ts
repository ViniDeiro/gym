export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  CreateLeague: undefined;
  JoinLeague: undefined;
  LeagueDetails: { leagueId: string };
  Ranking: { leagueId: string };
  Checkin: { leagueId: string };
  Feed: { leagueId: string };
  Challenges: { leagueId: string };
};

export type MainTabsParamList = {
  Home: undefined;
  Leagues: undefined;
  Profile: undefined;
  Settings: undefined;
};
