import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { workoutTypes } from "@/config/workouts";
import { useAuth } from "@/features/auth/AuthProvider";
import { createDailyCheckin, hasCheckedInToday } from "@/features/checkins/checkinService";
import { MainStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { WorkoutType } from "@/types/domain";

type Props = NativeStackScreenProps<MainStackParamList, "Checkin">;

export function CheckinScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [workoutType, setWorkoutType] = useState<WorkoutType>("perna");
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setAlreadyDone(await hasCheckedInToday(user.id, route.params.leagueId));
    }
    load();
  }, [route.params.leagueId, user]);

  async function submit() {
    if (!user) return;
    try {
      setLoading(true);
      await createDailyCheckin({
        userId: user.id,
        leagueId: route.params.leagueId,
        workoutType,
        note,
        photoUrl: photoUrl || null
      });
      Alert.alert("Check-in confirmado", "+10 pontos na conta.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Check-in bloqueado", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Fiz meu treino hoje</Text>
      <Text style={styles.copy}>Vale uma vez por dia em cada liga. O registro guarda data, horário e status de validação.</Text>

      {alreadyDone ? (
        <Card>
          <Text style={styles.done}>Você já fez check-in nesta liga hoje.</Text>
        </Card>
      ) : null}

      <Text style={styles.section}>Tipo de treino</Text>
      <View style={styles.chips}>
        {workoutTypes.map((item) => (
          <Pressable key={item.value} onPress={() => setWorkoutType(item.value)} style={[styles.chip, workoutType === item.value && { borderColor: item.color, backgroundColor: `${item.color}22` }]}>
            <Text style={[styles.chipText, workoutType === item.value && { color: item.color }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Observação" value={note} onChangeText={setNote} multiline placeholder="Ex: treino pesado de perna, bati PR no agachamento" />
      <TextField label="URL da foto opcional" value={photoUrl} onChangeText={setPhotoUrl} autoCapitalize="none" placeholder="MVP preparado para storage/foto" />
      <Button title="Confirmar check-in" loading={loading} onPress={submit} variant={alreadyDone ? "secondary" : "primary"} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  copy: { ...typography.body, color: colors.muted },
  done: { color: colors.accent, fontWeight: "800" },
  section: { color: colors.text, fontSize: 18, fontWeight: "900" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.surface },
  chipText: { color: colors.muted, fontWeight: "800" }
});
