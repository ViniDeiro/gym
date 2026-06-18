import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/features/auth/AuthProvider";
import { joinLeagueByCode } from "@/features/leagues/leagueService";
import { MainStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type Props = NativeStackScreenProps<MainStackParamList, "JoinLeague">;

export function JoinLeagueScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!user) return;
    try {
      setLoading(true);
      const league = await joinLeagueByCode(user.id, code);
      navigation.replace("LeagueDetails", { leagueId: league.id });
    } catch (error) {
      Alert.alert("Liga não encontrada", error instanceof Error ? error.message : "Confira o código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Entrar em liga</Text>
      <Text style={styles.copy}>Cole o código de convite enviado por um amigo.</Text>
      <TextField label="Código" value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="ABC123" />
      <Button title="Entrar na liga" loading={loading} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  copy: { ...typography.body, color: colors.muted }
});
