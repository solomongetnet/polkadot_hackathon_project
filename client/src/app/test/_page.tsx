"use client";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "./actions";
import { LikeButton } from "./like";
import Link from "next/link";
export default async function HomePage() {
  const postId = "abc123";

  return <PostContent postId={postId} />;
}

function PostContent({ postId }: { postId: string }) {
  const { data } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
  });

  if (!data) return <div>Loading...</div>;

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <LikeButton
        postId={postId}
        initialLiked={data.liked}
        initialCount={data.likeCount}
      />

      <Link href={"/characters/ddfgdfs"}>Oh</Link>
    </main>
  );
}
