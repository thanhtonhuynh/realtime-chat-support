"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/SessionProvider";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

export function RealtimeChat() {
  const channel = useRef<RealtimeChannel | null>(null);
  const { user } = useSession();
  const [messages, setMessages] = useState<{ user: User | null; message: string }[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!channel.current) {
      channel.current = supabase.channel("chat-room", {
        config: {
          broadcast: {
            self: true,
          },
        },
      });

      channel.current
        .on("broadcast", { event: "message" }, ({ payload }) => {
          setMessages((prev) => [...prev, payload.message]);
        })
        .subscribe();
    }

    return () => {
      channel.current?.unsubscribe();
      channel.current = null;
    };
  }, []);

  function onSend() {
    if (!channel.current || message.trim().length === 0 || !user) return;
    channel.current.send({
      type: "broadcast",
      event: "message",
      payload: { message: { message, user } },
    });
    setMessage("");
  }

  return (
    <section className="mt-4 flex w-1/2 flex-col gap-4 rounded-xl border p-4 shadow">
      <div className="flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg border bg-gray-200 p-2",
              user?.id === msg.user?.id ? "self-end bg-blue-200" : "self-start bg-gray-200",
            )}
          >
            {msg.user?.name}: {msg.message}
          </div>
        ))}
      </div>

      <Input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            onSend();
          }
        }}
      />
      <Button onClick={onSend}>Send</Button>
    </section>
  );
}
