import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { getLeagueLeaderboard } from "@/features/leagues/leagueService";
import { MainStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { LeaderboardEntry } from "@/types/domain";

type Props = NativeStackScreenProps<MainStackParamList, "Ranking">;

export function RankingScreen({ route }: Props) {
  const [ranking, setRanking] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const leaderPoints = ranking[0]?.points || 1;

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(true);
        setRanking(await getLeagueLeaderboard(route.params.leagueId));
        setLoading(false);
      }
      load();
    }, [route.params.leagueId])
  );

  return (
    <Screen>
      <Text style={styles.title}>Ranking da liga</Text>
      <Text style={styles.copy}>Check-in +10, streaks até +40, desafios +30 e 7 dias sem treinar -15.</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {ranking.map((entry) => (
        <Card key={entry.userId} style={styles.row}>
          <View style={styles.rowTop}>
            <Text style={styles.rank}>#{entry.rank}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{entry.name}</Text>
              <Text style={styles.meta}>{entry.streak} dias de streak · {entry.weeklyFrequency}x nesta semana</Text>
            </View>
            <Text style={styles.points}>{entry.points} pts</Text>
          </View>
          <ProgressBar value={(entry.points / leaderPoints) * 100} color={entry.rank === 1 ? colors.accent : colors.primary} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  copy: { ...typography.body, color: colors.muted },
  row: { gap: 12 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  rank: { color: colors.accent, fontSize: 22, fontWeight: "900", width: 44 },
  info: { flex: 1, gap: 4 },
  name: { color: colors.text, fontWeight: "900", fontSize: 16 },
  meta: { color: colors.muted, fontSize: 12 },
  points: { color: colors.primary, fontWeight: "900" }
});
