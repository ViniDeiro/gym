import { supabase } from "@/lib/supabase";
import { FeedPost } from "@/types/domain";

export async function getLeagueFeed(leagueId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*, users(name, avatar_url)")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    throw error;
  }

  return (data ?? []) as FeedPost[];
}

export async function likePost(postId: string, userId: string) {
  const { error } = await supabase.from("post_likes").upsert({ post_id: postId, user_id: userId });
  if (error) {
    throw error;
  }
}
