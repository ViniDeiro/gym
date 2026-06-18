import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { getLeagueDetails } from "@/features/leagues/leagueService";
import { MainStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { Challenge, League, LeagueMember } from "@/types/domain";

type Props = NativeStackScreenProps<MainStackParamList, "LeagueDetails">;

export function LeagueDetailsScreen({ navigation, route }: Props) {
  const { leagueId } = route.params;
  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(true);
        const details = await getLeagueDetails(leagueId);
        setLeague(details.league);
        setMembers(details.members);
        setChallenges(details.challenges);
        setLoading(false);
      }
      load();
    }, [leagueId])
  );

  if (loading || !league) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.hero}>
        <Text style={styles.kicker}>Código {league.invite_code}</Text>
        <Text style={styles.title}>{league.name}</Text>
        <Text style={styles.copy}>{league.description || "A competição está aberta."}</Text>
        <View style={styles.metrics}>
          <View>
            <Text style={styles.metric}>{members.length}</Text>
            <Text style={styles.label}>membros</Text>
          </View>
          <View>
            <Text style={styles.metric}>{challenges.length}</Text>
            <Text style={styles.label}>desafios</Text>
          </View>
        </View>
      </Card>

      <View style={styles.grid}>
        <Button title="Fiz meu treino hoje" onPress={() => navigation.navigate("Checkin", { leagueId })} />
        <Button title="Ranking" variant="secondary" onPress={() => navigation.navigate("Ranking", { leagueId })} />
        <Button title="Feed da liga" variant="secondary" onPress={() => navigation.navigate("Feed", { leagueId })} />
        <Button title="Desafios" variant="secondary" onPress={() => navigation.navigate("Challenges", { leagueId })} />
      </View>

      <Text style={styles.section}>Membros</Text>
      {members.map((member) => (
        <Card key={member.user_id} style={styles.member}>
          <Text style={styles.memberName}>{member.users?.name ?? "Atleta"}</Text>
          <Text style={styles.copy}>{member.role === "owner" ? "Dono da liga" : "Competidor"}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 10, borderColor: colors.primaryDark },
  kicker: { color: colors.primary, fontWeight: "900", textTransform: "uppercase" },
  title: { ...typography.title, color: colors.text },
  copy: { color: colors.muted, lineHeight: 20 },
  metrics: { flexDirection: "row", gap: 32, marginTop: 8 },
  metric: { color: colors.text, fontSize: 28, fontWeight: "900" },
  label: { color: colors.muted, fontSize: 12, textTransform: "uppercase", fontWeight: "800" },
  grid: { gap: 10 },
  section: { color: colors.text, fontSize: 18, fontWeight: "900" },
  member: { gap: 4 },
  memberName: { color: colors.text, fontWeight: "800", fontSize: 16 }
});
