import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
        setLoading(true);
        setLeagues(await listMyLeagues(user.id));
        setLoading(false);
      }
      load();
    }, [user])
  );

  const firstName = profile?.name?.split(" ")[0] ?? "Atleta";

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Gym League</Text>
        <Text style={styles.title}>Bora treinar, {firstName}.</Text>
        <Text style={styles.copy}>Seu ranking sobe quando a constância aparece.</Text>
      </View>

      <Card style={styles.scoreCard}>
        <Text style={styles.cardLabel}>Ligas ativas</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.bigNumber}>{leagues.length}</Text>}
        <Text style={styles.cardText}>Crie uma liga privada ou entre pelo código dos amigos.</Text>
      </Card>

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
  scoreCard: { gap: 8, borderColor: colors.primaryDark },
  cardLabel: { color: colors.muted, fontWeight: "800", textTransform: "uppercase", fontSize: 12 },
  bigNumber: { color: colors.primary, fontSize: 56, fontWeight: "900" },
  cardText: { color: colors.muted, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 12 },
  action: { flex: 1 },
  sectionTitle: { color: colors.text, fontWeight: "900", fontSize: 18 },
  leagueCard: { gap: 10 },
  leagueName: { color: colors.text, fontSize: 18, fontWeight: "900" }
});
