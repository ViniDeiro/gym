import { apiRequest } from "@/lib/api";
import { FeedComment, FeedPost } from "@/types/domain";

export async function getLeagueFeed(leagueId: string) {
  const data = await apiRequest<{ posts: FeedPost[] }>(`/leagues/${leagueId}/feed`);
  return data.posts;
}

export async function likePost(postId: string, _userId: string) {
  return apiRequest<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`, { method: "POST" });
}

export async function commentPost(postId: string, body: string) {
  const data = await apiRequest<{ comment: FeedComment }>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body })
  });
  return data.comment;
}

export async function getPostComments(postId: string) {
  const data = await apiRequest<{ comments: FeedComment[] }>(`/posts/${postId}/comments`);
  return data.comments;
}
