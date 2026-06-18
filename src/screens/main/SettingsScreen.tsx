import { StyleSheet, Text } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/features/auth/AuthProvider";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const roadmap = [
  "Validação por GPS da academia",
  "Integração Apple Health e Google Fit",
  "Planos pagos e ligas públicas",
  "Batalhas 1x1 e ranking global",
  "Sistema de recompensas"
];

export function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Configurações</Text>
      <Card style={styles.card}>
        <Text style={styles.name}>Preparado para escala</Text>
        {roadmap.map((item) => (
          <Text key={item} style={styles.copy}>{item}</Text>
        ))}
      </Card>
      <Button title="Sair da conta" variant="danger" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  card: { gap: 10 },
  name: { color: colors.text, fontSize: 18, fontWeight: "900" },
  copy: { color: colors.muted, lineHeight: 20 }
});
