"use client";

import { createMessage, markLastMessageRead } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useConversation } from "@/providers/conversation-provider";
import { useSession } from "@/providers/SessionProvider";
import { MessageWithSender } from "@/types";
import { Conversation } from "@prisma/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type ChatWindowProps = {
  conversation: Conversation;
  serverMessages: MessageWithSender[];
};

export function ChatWindow({ conversation, serverMessages }: ChatWindowProps) {
  const { user } = useSession();
  const [messages, setMessages] = useState<MessageWithSender[]>(serverMessages);
  const [message, setMessage] = useState("");
  const channel = useRef<RealtimeChannel | null>(null);
  const adminChannel = useRef<RealtimeChannel | null>(null);
  const { inputRef, setSelectedConvoId } = useConversation();

  useEffect(() => {
    setSelectedConvoId(conversation.id);

    return () => {
      setSelectedConvoId(null);
    };
  }, [conversation.id, setSelectedConvoId]);

  useEffect(() => {
    channel.current = supabase.channel(`room-${conversation.id}`);
    adminChannel.current = supabase.channel("admin-conversations");

    channel.current
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages((prevMessages) => [...prevMessages, payload.message]);
      })
      .subscribe();

    return () => {
      channel.current?.unsubscribe();
      channel.current = null;
      adminChannel.current?.unsubscribe();
      adminChannel.current = null;
    };
  }, [supabase, conversation.id, setMessages]);

  useEffect(() => {
    async function markDBMessageAsRead() {
      await markLastMessageRead(conversation.id);
    }

    if (document.activeElement === inputRef.current) {
      markDBMessageAsRead();
    }
  }, [messages, conversation.id, inputRef]);

  const markMessageAsRead = async () => {
    const latestMessage = messages[messages.length - 1];
    if (
      !latestMessage ||
      latestMessage.senderId === user?.id ||
      latestMessage.isRead ||
      !adminChannel.current
    )
      return;

    setMessages((prev) =>
      prev.map((m) => (m.id === latestMessage.id ? { ...m, isRead: true } : m)),
    );

    adminChannel.current.send({
      type: "broadcast",
      event: "conversation:message-read",
      payload: {
        conversation: {
          id: conversation.id,
        },
      },
    });

    await markLastMessageRead(conversation.id);
  };

  async function sendMessage() {
    if (!channel.current || message.trim().length === 0 || !user || !adminChannel.current) return;

    const newMessage = {
      id: uuidv4(),
      content: message,
      sender: { id: user.id, name: user.name },
      createdAt: new Date(),
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

  return (
    <>
      <main className="flex flex-1 flex-col-reverse overflow-y-auto">
        <div className="flex flex-1 flex-col justify-end">
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
          ref={inputRef}
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
          onFocus={markMessageAsRead}
        />

        <Button size="sm" className="rounded-full bg-blue-600" onClick={sendMessage}>
          Send
        </Button>
      </footer>
    </>
  );
}
