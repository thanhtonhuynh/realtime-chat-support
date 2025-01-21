"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/SessionProvider";
import { MessageWithSender } from "@/types";
import { Conversation } from "@prisma/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { X } from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createConversation, createMessage } from "./actions";

type ChatWindowProps = {
  serverConversation: Conversation | null;
  serverMessages: MessageWithSender[];
};

export function ChatWindow({ serverConversation, serverMessages }: ChatWindowProps) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(serverConversation);
  const [messages, setMessages] = useState<MessageWithSender[]>(serverMessages);
  const channel = useRef<RealtimeChannel | null>(null);
  const adminChannel = useRef<RealtimeChannel | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (serverConversation) {
      channel.current = supabase.channel(`room-${serverConversation.id}`);

      channel.current
        .on("broadcast", { event: "message" }, ({ payload }) => {
          setMessages((prev) => [...prev, payload.message]);
        })
        .subscribe();
    }

    return () => {
      channel.current?.unsubscribe();
      channel.current = null;
      adminChannel.current?.unsubscribe();
      adminChannel.current = null;
    };
  }, [supabase, serverConversation, setMessages]);

  async function openConversation() {
    setOpen(true);

    adminChannel.current = supabase.channel("admin-conversations");

    if (!conversation) {
      const newConvo = await createConversation(user!.id);
      setConversation(newConvo);

      adminChannel.current.send({
        type: "broadcast",
        event: "conversation:new",
        payload: {
          conversation: {
            id: newConvo.id,
            createdAt: newConvo.createdAt,
            customerName: user!.name,
            messages: [],
          },
        },
      });

      if (!channel.current) {
        channel.current = supabase.channel(`room-${newConvo.id}`);

        channel.current
          .on("broadcast", { event: "message" }, ({ payload }) => {
            setMessages((prev) => [...prev, payload.message]);
          })
          .subscribe();
      }
    }
  }

  async function sendMessage() {
    if (
      !channel.current ||
      message.trim().length === 0 ||
      !user ||
      !conversation ||
      !adminChannel.current
    )
      return;

    const newMessage = {
      id: uuidv4(),
      content: message,
      createdAt: new Date(),
      sender: { id: user.id, name: user.name },
      senderId: user.id,
      isRead: false,
      conversationId: conversation.id,
    };

    setMessage("");

    setMessages((prev) => [...prev, newMessage]);

    await createMessage(newMessage.id, conversation.id, user.id, newMessage.content);

    channel.current.send({
      type: "broadcast",
      event: "message",
      payload: { message: newMessage },
    });

    adminChannel.current.send({
      type: "broadcast",
      event: "conversation:update",
      payload: {
        conversation: {
          id: conversation.id,
          latestMessage: newMessage,
        },
      },
    });
  }

  if (!open) {
    return (
      <>
        <Button onClick={openConversation} className="fixed bottom-20 right-10 rounded-full">
          Support
        </Button>
      </>
    );
  }

  return (
    <div className="fixed bottom-0 right-5 flex h-[500px] w-[400px] flex-col rounded-t-xl border bg-background pr-1 shadow">
      <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col">
        <header className="flex items-center gap-4 border-b p-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <h1 className="font-semibold">Support</h1>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="absolute right-2 top-2 rounded-full"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </Button>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col-reverse overflow-y-auto">
            <ul className="flex flex-col gap-1 px-4">
              {messages.map((message, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-center space-x-2",
                    user?.id === message.sender.id ? "justify-end" : "justify-start",
                  )}
                >
                  <p className="rounded-md bg-muted px-3 py-1">{message.content}</p>
                  {/* Make this a tooltip later */}
                  <p>{moment(message.createdAt).format("HH:mm")}</p>
                </li>
              ))}
            </ul>
          </div>
        </main>

        <footer className="mt-4 flex items-center space-x-2 p-2 px-6">
          <Input
            autoFocus
            type="text"
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-full border p-2 px-4"
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <Button size="sm" className="rounded-full" onClick={sendMessage}>
            Send
          </Button>
        </footer>
      </div>
    </div>
  );
}
