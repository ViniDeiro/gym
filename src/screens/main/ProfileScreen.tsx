import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/features/auth/AuthProvider";
import { updateProfile } from "@/features/profile/profileService";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export function ProfileScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [goal, setGoal] = useState(profile?.goal ?? "");
  const [currentGym, setCurrentGym] = useState(profile?.current_gym ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? "");
    setGoal(profile?.goal ?? "");
    setCurrentGym(profile?.current_gym ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
  }, [profile]);

  async function submit() {
    if (!user) return;
    try {
      setLoading(true);
      await updateProfile(user.id, { name, goal, current_gym: currentGym, avatar_url: avatarUrl || null });
      await refreshProfile();
      Alert.alert("Perfil atualizado", "Seu atleta está pronto para competir.");
    } catch (error) {
      Alert.alert("Erro ao salvar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Perfil</Text>
      <Card style={styles.card}>
        <Text style={styles.avatar}>{name?.slice(0, 1).toUpperCase() || "G"}</Text>
        <Text style={styles.name}>{name || "Atleta Gym League"}</Text>
        <Text style={styles.copy}>{goal || "Defina seu objetivo para sua liga entender sua meta."}</Text>
      </Card>
      <TextField label="Nome" value={name} onChangeText={setName} />
      <TextField label="Objetivo" value={goal} onChangeText={setGoal} placeholder="Ex: ganhar massa, secar, correr 5km" />
      <TextField label="Academia atual" value={currentGym} onChangeText={setCurrentGym} />
      <TextField label="URL da foto" value={avatarUrl} onChangeText={setAvatarUrl} autoCapitalize="none" />
      <Button title="Salvar perfil" loading={loading} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  card: { alignItems: "center", gap: 8 },
  avatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.primary, color: colors.background, textAlign: "center", lineHeight: 74, fontSize: 30, fontWeight: "900" },
  name: { color: colors.text, fontWeight: "900", fontSize: 20 },
  copy: { color: colors.muted, textAlign: "center", lineHeight: 20 }
});
