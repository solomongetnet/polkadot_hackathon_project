'use server'

let likedPosts: Record<string, { liked: boolean; likeCount: number }> = {}

export async function likePost(postId: string) {
  await new Promise((res) => setTimeout(res, 4000)) // simulate delay

  const existing = likedPosts[postId] ?? { liked: false, likeCount: 0 }
  const newLiked = !existing.liked
  const newLikeCount = existing.likeCount + (newLiked ? 1 : -1)

  likedPosts[postId] = {
    liked: newLiked,
    likeCount: newLikeCount,
  }

  return { liked: newLiked, likeCount: newLikeCount }
}

export async function getPost(postId: string) {
  await new Promise((res) => setTimeout(res, 300)) // simulate delay

  return {
    id: postId,
    title: "Dummy Post",
    ...(
      likedPosts[postId] ?? {
        liked: false,
        likeCount: 0,
      }
    ),
  }
}
