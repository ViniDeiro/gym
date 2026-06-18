import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/features/auth/AuthProvider";
import { createLeague } from "@/features/leagues/leagueService";
import { MainStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type Props = NativeStackScreenProps<MainStackParamList, "CreateLeague">;

export function CreateLeagueScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!user) return;
    try {
      setLoading(true);
      const league = await createLeague(user.id, { name, description, coverUrl: coverUrl || null });
      navigation.replace("LeagueDetails", { leagueId: league.id });
    } catch (error) {
      Alert.alert("Erro ao criar liga", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Nova liga</Text>
      <Text style={styles.copy}>Dê uma identidade para a competição e chame sua galera pelo código.</Text>
      <TextField label="Nome" value={name} onChangeText={setName} placeholder="Ex: Squad 6AM" />
      <TextField label="Descrição" value={description} onChangeText={setDescription} multiline placeholder="Regras, objetivo ou vibe da liga" />
      <TextField label="URL da capa opcional" value={coverUrl} onChangeText={setCoverUrl} autoCapitalize="none" />
      <Button title="Criar liga" loading={loading} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  copy: { ...typography.body, color: colors.muted }
});
