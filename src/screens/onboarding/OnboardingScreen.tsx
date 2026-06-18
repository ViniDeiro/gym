import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { AuthStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <Screen>
      <LinearGradient colors={["#10172A", "#070A12"]} style={styles.hero}>
        <Text style={styles.badge}>Gym League</Text>
        <Text style={styles.title}>Transforme treino em campeonato.</Text>
        <Text style={styles.copy}>Crie ligas com amigos, faça check-ins, complete desafios e suba no ranking com consistência real.</Text>
      </LinearGradient>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Ligas privadas</Text>
          <Text style={styles.cardText}>Convide amigos por código e acompanhe a disputa semana a semana.</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Ranking vivo</Text>
          <Text style={styles.cardText}>Pontos por frequência, streaks, desafios e penalidade leve por sumiço.</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Feed social</Text>
          <Text style={styles.cardText}>Check-ins e conquistas viram momentos compartilhados na liga.</Text>
        </Card>
      </View>

      <Button title="Começar agora" onPress={() => navigation.navigate("Register")} />
      <Button title="Já tenho conta" variant="secondary" onPress={() => navigation.navigate("Login")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 320,
    borderRadius: 8,
    padding: 22,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: colors.border
  },
  badge: {
    color: colors.primary,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 12
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: 10
  },
  copy: {
    ...typography.body,
    color: colors.muted
  },
  grid: {
    gap: 12
  },
  card: {
    gap: 6
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16
  },
  cardText: {
    color: colors.muted,
    lineHeight: 20
  }
});
