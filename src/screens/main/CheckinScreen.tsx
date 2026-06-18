import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
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
    if (!photoUri) {
      Alert.alert("Foto obrigatória", "Para validar o treino, tire ou selecione uma foto do treino.");
      return;
    }

    try {
      setLoading(true);
      await createDailyCheckin({
        userId: user.id,
        leagueId: route.params.leagueId,
        workoutType,
        note,
        photoUrl: photoUri
      });
      Alert.alert("Check-in confirmado", "+10 pontos na conta.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Check-in bloqueado", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function takePhoto() {
    if (alreadyDone) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Libere a câmera para validar o treino com foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.65,
      base64: true
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPhotoUri(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
    }
  }

  async function choosePhoto() {
    if (alreadyDone) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Libere a galeria para selecionar uma foto do treino.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.65,
      base64: true
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPhotoUri(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
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
      <Card style={styles.photoCard}>
        <Text style={styles.section}>Foto de validação</Text>
        <Text style={styles.copy}>O treino só pontua quando vem com foto. No simulador, a galeria ajuda a testar.</Text>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : <View style={styles.emptyPhoto}><Text style={styles.emptyPhotoText}>Sem foto</Text></View>}
        <View style={styles.photoActions}>
          <Button title="Tirar foto" onPress={takePhoto} variant="primary" style={styles.photoButton} />
          <Button title="Galeria" onPress={choosePhoto} variant="secondary" style={styles.photoButton} />
        </View>
      </Card>
      <Button title="Confirmar check-in" loading={loading} onPress={submit} variant={alreadyDone || !photoUri ? "secondary" : "primary"} />
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
  chipText: { color: colors.muted, fontWeight: "800" },
  photoCard: { gap: 12 },
  photo: { width: "100%", aspectRatio: 4 / 3, borderRadius: 8, backgroundColor: colors.surface },
  emptyPhoto: { width: "100%", aspectRatio: 4 / 3, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  emptyPhotoText: { color: colors.muted, fontWeight: "800" },
  photoActions: { flexDirection: "row", gap: 10 },
  photoButton: { flex: 1 }
});
