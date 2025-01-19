import prisma from "@/lib/prisma";
import { Post } from "@prisma/client";
import { RealtimeChat } from "./realtime-chat";
import { RealtimePosts } from "./realtime-posts";

async function getPosts() {
  return await prisma.post.findMany();
}

export default async function Home() {
  const posts: Post[] = await getPosts();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <p className="text-2xl font-extrabold">Realtime Chat Customer Support</p>

      <RealtimePosts initialPosts={posts} />

      <RealtimeChat />
    </div>
  );
}
