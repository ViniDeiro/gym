import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/features/auth/AuthProvider";
import { signUpWithEmail } from "@/features/auth/authService";
import { AuthStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { setAuthSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      const data = await signUpWithEmail(email.trim(), password, name.trim());
      await setAuthSession(data.token, data.user);
    } catch (error) {
      Alert.alert("Não foi possível cadastrar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Crie seu atleta</Text>
      <Text style={styles.copy}>Seu perfil entra nos rankings, feed e desafios das ligas.</Text>
      <TextField label="Nome" value={name} onChangeText={setName} />
      <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Cadastrar" loading={loading} onPress={submit} />
      <Button title="Já tenho conta" variant="ghost" onPress={() => navigation.navigate("Login")} />
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
