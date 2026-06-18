import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { CommentIcon, ReactionFlameIcon, ReactionThumbIcon, ThumbIcon } from "@/components/icons/SocialIcons";
import { useAuth } from "@/features/auth/AuthProvider";
import { commentPost, getLeagueFeed, likePost } from "@/features/feed/feedService";
import { MainStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { FeedPost } from "@/types/domain";

type Props = NativeStackScreenProps<MainStackParamList, "Feed">;

export function FeedScreen({ route }: Props) {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(posts.length === 0);
        try {
          setPosts(await getLeagueFeed(route.params.leagueId));
        } finally {
          setLoading(false);
        }
      }
      load();
    }, [route.params.leagueId, posts.length])
  );

  async function toggleLike(postId: string) {
    const previousPosts = posts;
    const currentPost = posts.find((post) => post.id === postId);
    if (!currentPost) return;

    setPosts((items) =>
      items.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked_by_me: !post.liked_by_me,
              likes_count: Math.max(0, post.likes_count + (post.liked_by_me ? -1 : 1))
            }
          : post
      )
    );

    try {
      const result = await likePost(postId, "");
      setPosts((items) =>
        items.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked_by_me: result.liked,
                likes_count: result.likesCount
              }
            : post
        )
      );
    } catch (error) {
      setPosts(previousPosts);
      Alert.alert("Não foi possível curtir", error instanceof Error ? error.message : "Tente novamente.");
    }
  }

  async function submitComment(postId: string) {
    const body = (commentDrafts[postId] || "").trim();
    if (!body) return;

    try {
      setCommentingPostId(postId);
      const comment = await commentPost(postId, body);
      setPosts((items) =>
        items.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments_count: post.comments_count + 1,
                comments: [...post.comments, comment].slice(-3)
              }
            : post
        )
      );
      setCommentDrafts((drafts) => ({ ...drafts, [postId]: "" }));
      setOpenCommentPostId(null);
    } catch (error) {
      Alert.alert("Não foi possível comentar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setCommentingPostId(null);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Feed da liga</Text>
      <Text style={styles.copy}>Check-ins validados por foto aparecem aqui para a liga curtir e comentar.</Text>
      {loading && posts.length === 0 ? <ActivityIndicator color={colors.primary} /> : null}
      {posts.map((post) => (
        <Card key={post.id} style={styles.post}>
          <View style={styles.postHeader}>
            <Avatar name={post.users?.name} uri={post.users?.avatar_url} size={42} />
            <View style={styles.postHeaderText}>
              <Text style={styles.name}>{post.users?.name ?? "Atleta"}</Text>
              <Text style={styles.time}>{new Date(post.created_at).toLocaleString("pt-BR")}</Text>
            </View>
          </View>
          <Text style={styles.message}>{post.message}</Text>
          {post.checkins?.photo_url ? <Image source={{ uri: post.checkins.photo_url }} style={styles.photo} /> : null}
          {post.checkins?.note ? <Text style={styles.note}>{post.checkins.note}</Text> : null}
          <View style={styles.socialSummary}>
            <View style={styles.reactionStack}>
              <View style={styles.reactionBubble}>
                <ReactionThumbIcon size={24} />
              </View>
              <View style={styles.reactionBubbleAccent}>
                <ReactionFlameIcon size={24} />
              </View>
            </View>
            <Text style={styles.summaryText}>{post.likes_count} curtida{post.likes_count === 1 ? "" : "s"}</Text>
            <Text style={styles.summaryText}>{post.comments_count} comentário{post.comments_count === 1 ? "" : "s"}</Text>
          </View>
          <View style={styles.actionBar}>
            <Pressable onPress={() => toggleLike(post.id)} style={styles.feedAction}>
              <ThumbIcon size={21} color={post.liked_by_me ? colors.primary : colors.muted} filled={post.liked_by_me} />
              <Text style={[styles.feedActionText, post.liked_by_me && styles.feedActionActive]}>Gostei</Text>
            </Pressable>
            <Pressable
              onPress={() => setOpenCommentPostId((current) => (current === post.id ? null : post.id))}
              style={styles.feedAction}
            >
              <CommentIcon size={21} color={openCommentPostId === post.id ? colors.primary : colors.muted} filled={openCommentPostId === post.id} />
              <Text style={[styles.feedActionText, openCommentPostId === post.id && styles.feedActionActive]}>Comentar</Text>
            </Pressable>
          </View>
          {post.comments.length > 0 ? (
            <View style={styles.comments}>
              {post.comments.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <Avatar name={comment.users?.name} uri={comment.users?.avatar_url} size={30} />
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentName}>{comment.users?.name ?? "Atleta"}</Text>
                    <Text style={styles.commentBody}>{comment.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
          {openCommentPostId === post.id ? (
            <View style={styles.commentComposer}>
              <Avatar name={profile?.name} uri={profile?.avatar_url} size={34} />
              <TextInput
                value={commentDrafts[post.id] || ""}
                onChangeText={(value) => setCommentDrafts((drafts) => ({ ...drafts, [post.id]: value }))}
                placeholder="Comentar..."
                placeholderTextColor={colors.muted}
                style={styles.commentInput}
                maxLength={280}
                autoFocus
              />
              <Button
                title="Enviar"
                variant="secondary"
                loading={commentingPostId === post.id}
                onPress={() => submitComment(post.id)}
                style={styles.commentButton}
              />
            </View>
          ) : null}
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
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  postHeaderText: { flex: 1, minWidth: 0, gap: 2 },
  name: { color: colors.primary, fontWeight: "900" },
  message: { color: colors.text, fontSize: 16, fontWeight: "700" },
  photo: { width: "100%", aspectRatio: 4 / 3, borderRadius: 8, backgroundColor: colors.surface },
  note: { color: colors.muted, lineHeight: 20 },
  socialSummary: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 2 },
  reactionStack: { flexDirection: "row", alignItems: "center", width: 42 },
  reactionBubble: { width: 24, height: 24, borderRadius: 12, overflow: "hidden", zIndex: 2 },
  reactionBubbleAccent: { width: 24, height: 24, borderRadius: 12, overflow: "hidden", marginLeft: -7 },
  summaryText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  actionBar: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, minHeight: 46 },
  feedAction: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  feedActionText: { color: colors.muted, fontWeight: "900" },
  feedActionActive: { color: colors.primary },
  comments: { gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  comment: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  commentBubble: { flex: 1, minWidth: 0, backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  commentName: { color: colors.text, fontWeight: "900", fontSize: 13 },
  commentBody: { color: colors.muted, lineHeight: 19 },
  commentComposer: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentInput: { flex: 1, minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: 12 },
  commentButton: { minHeight: 44 },
  time: { color: colors.muted, fontSize: 12 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 24 }
});
