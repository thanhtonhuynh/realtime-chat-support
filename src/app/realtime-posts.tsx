"use client";

import { supabase } from "@/lib/supabase";
import { Post } from "@prisma/client";
import { useEffect, useState } from "react";

export function RealtimePosts({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Post",
        },
        (payload) => {
          setPosts((prevPosts) => [...prevPosts, payload.new as Post]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setPosts]);

  return (
    <ul className="mt-4 rounded-xl border p-4 shadow">
      {posts.map((post) => (
        <li key={post.id}>
          {post.title} - {new Date(post.createdAt).toLocaleString("en-US")}
        </li>
      ))}
    </ul>
  );
}
