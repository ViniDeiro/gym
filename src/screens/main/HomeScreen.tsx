import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/features/auth/AuthProvider";
import { listMyLeagues } from "@/features/leagues/leagueService";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { League } from "@/types/domain";

export function HomeScreen() {
  const { profile, user } = useAuth();
  const navigation = useNavigation<any>();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        if (!user) return;
        setLoading(leagues.length === 0);
        try {
          setLeagues(await listMyLeagues(user.id));
        } finally {
          setLoading(false);
        }
      }
      load();
    }, [user, leagues.length])
  );

  const firstName = profile?.name?.split(" ")[0] ?? "Atleta";

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Gym League</Text>
        <Text style={styles.title}>Bora treinar, {firstName}.</Text>
        <Text style={styles.copy}>Seu ranking sobe quando a constância aparece.</Text>
      </View>

      <LinearGradient colors={["#14233A", "#0D1526"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.arena}>
        <View style={styles.arenaTop}>
          <View>
            <Text style={styles.cardLabel}>Arena ativa</Text>
            <Text style={styles.arenaTitle}>Modo competição</Text>
          </View>
          <View style={styles.pulseDot} />
        </View>
        <View style={styles.arenaMetric}>
          {loading && leagues.length === 0 ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.bigNumber}>{leagues.length}</Text>}
          <Text style={styles.metricText}>liga{leagues.length === 1 ? "" : "s"} em disputa</Text>
        </View>
        <Text style={styles.cardText}>Entre no treino do dia, mantenha streaks e provoque a galera no feed.</Text>
      </LinearGradient>

      <View style={styles.actions}>
        <Button title="Criar liga" onPress={() => navigation.navigate("CreateLeague")} style={styles.action} />
        <Button title="Entrar por código" variant="secondary" onPress={() => navigation.navigate("JoinLeague")} style={styles.action} />
      </View>

      <Text style={styles.sectionTitle}>Suas arenas</Text>
      {leagues.map((league) => (
        <Card key={league.id} style={styles.leagueCard}>
          <Text style={styles.leagueName}>{league.name}</Text>
          <Text style={styles.cardText}>{league.description || "Liga pronta para novos check-ins."}</Text>
          <Button title="Abrir liga" variant="secondary" onPress={() => navigation.navigate("LeagueDetails", { leagueId: league.id })} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8, marginTop: 10 },
  kicker: { color: colors.primary, fontWeight: "900", textTransform: "uppercase" },
  title: { ...typography.title, color: colors.text },
  copy: { ...typography.body, color: colors.muted },
  arena: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 14, overflow: "hidden" },
  arenaTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  arenaTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  pulseDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success, shadowColor: colors.success, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 10 },
  arenaMetric: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  cardLabel: { color: colors.muted, fontWeight: "800", textTransform: "uppercase", fontSize: 12 },
  bigNumber: { color: colors.primary, fontSize: 58, fontWeight: "900" },
  metricText: { color: colors.text, fontWeight: "900", marginBottom: 12 },
  cardText: { color: colors.muted, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 12 },
  action: { flex: 1 },
  sectionTitle: { color: colors.text, fontWeight: "900", fontSize: 18 },
  leagueCard: { gap: 10 },
  leagueName: { color: colors.text, fontSize: 18, fontWeight: "900" }
});
