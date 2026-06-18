import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/features/auth/AuthProvider";
import { signInWithEmail } from "@/features/auth/authService";
import { AuthStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { setAuthSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      const data = await signInWithEmail(email.trim(), password);
      await setAuthSession(data.token, data.user);
    } catch (error) {
      Alert.alert("Não foi possível entrar", error instanceof Error ? error.message : "Confira seus dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Voltar para a arena</Text>
      <Text style={styles.copy}>Entre para fazer seu check-in e ver quem está liderando hoje.</Text>
      <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Entrar" loading={loading} onPress={submit} />
      <Button title="Criar minha conta" variant="ghost" onPress={() => navigation.navigate("Register")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: 48
  },
  copy: {
    ...typography.body,
    color: colors.muted
  }
});
