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

export function MyLeaguesScreen() {
  const { user } = useAuth();
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

  return (
    <Screen>
      <Text style={styles.title}>Minhas ligas</Text>
      <View style={styles.actions}>
        <Button title="Criar" onPress={() => navigation.navigate("CreateLeague")} style={styles.action} />
        <Button title="Entrar" variant="secondary" onPress={() => navigation.navigate("JoinLeague")} style={styles.action} />
      </View>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {leagues.map((league) => (
        <Card key={league.id} style={styles.card}>
          <Text style={styles.name}>{league.name}</Text>
          <Text style={styles.code}>Código: {league.invite_code}</Text>
          <Text style={styles.copy}>{league.description}</Text>
          <Button title="Ver detalhes" variant="secondary" onPress={() => navigation.navigate("LeagueDetails", { leagueId: league.id })} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  actions: { flexDirection: "row", gap: 12 },
  action: { flex: 1 },
  card: { gap: 10 },
  name: { color: colors.text, fontSize: 18, fontWeight: "900" },
  code: { color: colors.primary, fontWeight: "800" },
  copy: { color: colors.muted, lineHeight: 20 }
});
