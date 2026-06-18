import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { getLeagueFeed } from "@/features/feed/feedService";
import { MainStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { FeedPost } from "@/types/domain";

type Props = NativeStackScreenProps<MainStackParamList, "Feed">;

export function FeedScreen({ route }: Props) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(true);
        setPosts(await getLeagueFeed(route.params.leagueId));
        setLoading(false);
      }
      load();
    }, [route.params.leagueId])
  );

  return (
    <Screen>
      <Text style={styles.title}>Feed da liga</Text>
      <Text style={styles.copy}>Check-ins, conquistas e subidas no ranking aparecem aqui.</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {posts.map((post) => (
        <Card key={post.id} style={styles.post}>
          <Text style={styles.name}>{post.users?.name ?? "Atleta"}</Text>
          <Text style={styles.message}>{post.message}</Text>
          <Text style={styles.time}>{new Date(post.created_at).toLocaleString("pt-BR")}</Text>
        </Card>
      ))}
      {!loading && posts.length === 0 ? <Text style={styles.empty}>A liga ainda não tem atividade. O primeiro check-in abre o placar.</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  copy: { ...typography.body, color: colors.muted },
  post: { gap: 8 },
  name: { color: colors.primary, fontWeight: "900" },
  message: { color: colors.text, fontSize: 16, fontWeight: "700" },
  time: { color: colors.muted, fontSize: 12 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 24 }
});
