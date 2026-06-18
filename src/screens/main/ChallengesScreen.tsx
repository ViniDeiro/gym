import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/features/auth/AuthProvider";
import { getLeagueDetails, getMyChallengeProgress } from "@/features/leagues/leagueService";
import { MainStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { Challenge, UserChallenge } from "@/types/domain";

type Props = NativeStackScreenProps<MainStackParamList, "Challenges">;

export function ChallengesScreen({ route }: Props) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        if (!user) return;
        setLoading(true);
        const [details, challengeProgress] = await Promise.all([
          getLeagueDetails(route.params.leagueId),
          getMyChallengeProgress(route.params.leagueId, user.id)
        ]);
        setChallenges(details.challenges);
        setProgress(challengeProgress);
        setLoading(false);
      }
      load();
    }, [route.params.leagueId, user])
  );

  return (
    <Screen>
      <Text style={styles.title}>Desafios</Text>
      <Text style={styles.copy}>O MVP cria desafios padrão por liga e deixa a tabela pronta para progresso individual.</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {challenges.map((challenge) => {
        const itemProgress = progress.find((item) => item.challenge_id === challenge.id);
        const current = itemProgress?.progress ?? 0;
        const status = itemProgress?.status === "completed" ? "Concluído" : `${current}/${challenge.target_value}`;

        return (
          <Card key={challenge.id} style={styles.card}>
            <Text style={styles.points}>+{challenge.points} pts · {status}</Text>
            <Text style={styles.name}>{challenge.title}</Text>
            <Text style={styles.copy}>{challenge.description}</Text>
            <ProgressBar value={(current / challenge.target_value) * 100} color={itemProgress?.status === "completed" ? colors.success : colors.purple} />
            <Text style={styles.period}>{new Date(challenge.starts_at).toLocaleDateString("pt-BR")} a {new Date(challenge.ends_at).toLocaleDateString("pt-BR")}</Text>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  copy: { ...typography.body, color: colors.muted },
  card: { gap: 8 },
  points: { color: colors.accent, fontWeight: "900" },
  name: { color: colors.text, fontSize: 18, fontWeight: "900" },
  period: { color: colors.muted, fontSize: 12 }
});
