import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { PencilIcon } from "@/components/icons/SocialIcons";
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

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Libere a galeria para escolher sua foto de perfil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.65,
      base64: true
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAvatarUrl(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
    }
  }

  async function submit() {
    if (!user) return;
    try {
      setLoading(true);
      await updateProfile(user.id, { name, goal, current_gym: currentGym, avatar_url: avatarUrl || null });
      await refreshProfile();
      Alert.alert("Perfil atualizado", "Sua foto e seus dados já aparecem na liga.");
    } catch (error) {
      Alert.alert("Erro ao salvar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Perfil</Text>
      <Card style={styles.heroCard}>
        <LinearGradient colors={["#1B2C46", "#0E182A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cover}>
          <View style={styles.coverLine} />
        </LinearGradient>
        <View style={styles.avatarWrap}>
          <Pressable onPress={pickAvatar} style={styles.avatarPressable}>
            <Avatar name={name} uri={avatarUrl || null} size={104} style={styles.avatar} />
            <View style={styles.avatarEdit}>
              <PencilIcon size={16} />
            </View>
          </Pressable>
        </View>
        <Text style={styles.name}>{name || "Atleta Gym League"}</Text>
        <Text style={styles.copy}>{goal || "Defina seu objetivo para sua liga entender sua meta."}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaLabel}>Academia</Text>
            <Text numberOfLines={1} style={styles.metaValue}>{currentGym || "Não informada"}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>Competindo</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.formCard}>
        <TextField label="Nome" value={name} onChangeText={setName} />
        <TextField label="Objetivo" value={goal} onChangeText={setGoal} placeholder="Ex: ganhar massa, secar, correr 5km" />
        <TextField label="Academia atual" value={currentGym} onChangeText={setCurrentGym} />
      </Card>

      <Button title="Salvar perfil" loading={loading} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  heroCard: { alignItems: "center", gap: 10, paddingTop: 0, overflow: "hidden" },
  cover: { width: "120%", height: 98, borderBottomWidth: 1, borderBottomColor: colors.border, justifyContent: "flex-end", alignItems: "center" },
  coverLine: { width: 96, height: 3, borderRadius: 999, backgroundColor: colors.primary, opacity: 0.85, marginBottom: 18 },
  avatarWrap: { marginTop: -58, alignItems: "center" },
  avatarPressable: { width: 112, height: 112, alignItems: "center", justifyContent: "center" },
  avatar: { borderWidth: 4, borderColor: colors.card },
  avatarEdit: { position: "absolute", right: 2, bottom: 4, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.card, alignItems: "center", justifyContent: "center" },
  name: { color: colors.text, fontWeight: "900", fontSize: 22 },
  copy: { color: colors.muted, textAlign: "center", lineHeight: 20 },
  metaRow: { flexDirection: "row", gap: 10, width: "100%" },
  metaPill: { flex: 1, minWidth: 0, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 4 },
  metaLabel: { color: colors.muted, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  metaValue: { color: colors.text, fontWeight: "900" },
  formCard: { gap: 14 }
});
