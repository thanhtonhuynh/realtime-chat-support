"use client";

import { ChatFooter } from "@/components/chat-footer";
import { Messages } from "@/components/chat-messages";
import { Button } from "@/components/ui/button";
import { UnreadMessagesIndicator } from "@/components/UnreadMessagesIndicator";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/providers/SessionProvider";
import { MessageWithSender } from "@/types";
import { Conversation } from "@prisma/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Minus } from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createConversation, createMessage, markMessagesAsReadAction } from "./actions";

type CustomerChatWindowProps = {
  initialConversation: Conversation | null;
  initialMessages: MessageWithSender[];
  initialUnreadMessagesCount: number;
};

export function CustomerChatWindow({
  initialConversation,
  initialMessages,
  initialUnreadMessagesCount,
}: CustomerChatWindowProps) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(initialConversation);
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const channel = useRef<RealtimeChannel | null>(null);
  const adminChannel = useRef<RealtimeChannel | null>(null);
  const [message, setMessage] = useState("");
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(initialUnreadMessagesCount);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function joinChannel(conversationId: string, channel: RefObject<RealtimeChannel | null>) {
    channel.current = supabase.channel(`room-${conversationId}`);
    channel.current
      .on("broadcast", { event: "message" }, async ({ payload }) => {
        setMessages((prev) => [...prev, payload.message]);

        if (inputRef.current === document.activeElement) {
          await markMessagesAsReadAction(conversationId);
        } else {
          setUnreadMessagesCount((prev) => prev + 1);
        }
      })
      .subscribe();
  }

  useEffect(() => {
    if (initialConversation) {
      joinChannel(initialConversation.id, channel);
    }

    return () => {
      channel.current?.unsubscribe();
      channel.current = null;
      adminChannel.current?.unsubscribe();
      adminChannel.current = null;
    };
  }, [initialConversation]);

  async function markMessagesAsRead() {
    if (unreadMessagesCount <= 0 || !conversation) return;
    setUnreadMessagesCount(0);
    await markMessagesAsReadAction(conversation.id);
  }

  async function openConversation() {
    setOpen(true);
    adminChannel.current = supabase.channel("admin-conversations");

    if (!conversation && user) {
      const newConvo = await createConversation(user!.id);
      setConversation(newConvo);

      adminChannel.current.send({
        type: "broadcast",
        event: "conversation:new",
        payload: {
          conversation: {
            id: newConvo.id,
            createdAt: newConvo.createdAt,
            customerName: user.name,
            messages: [],
          },
        },
      });

      joinChannel(newConvo.id, channel);
    }
  }

  async function sendMessage() {
    if (
      !channel.current ||
      !adminChannel.current ||
      message.trim().length === 0 ||
      !user ||
      !conversation
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
      <div className="fixed bottom-20 right-10">
        <Button onClick={openConversation} className="rounded-full">
          Support
        </Button>

        {unreadMessagesCount > 0 && (
          <UnreadMessagesIndicator
            count={unreadMessagesCount}
            className="absolute -right-1 -top-3"
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-5 flex h-[500px] w-[400px] flex-col rounded-t-xl border bg-background pr-1 shadow">
      <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col">
        <header className="flex items-center justify-between space-x-3 border-b p-4 py-2">
          <div className="relative flex items-center space-x-3">
            <div className="size-10 rounded-full bg-gray-200"></div>
            <h1 className="font-semibold">Customer Support</h1>
            {unreadMessagesCount > 0 && (
              <UnreadMessagesIndicator
                className="absolute -left-5 top-0"
                count={unreadMessagesCount}
              />
            )}
          </div>

          <Button
            variant={"ghost"}
            size={"icon"}
            className="absolute right-2 top-2 rounded-full"
            onClick={() => setOpen(false)}
          >
            <Minus size={20} />
          </Button>
        </header>

        <Messages messages={messages} user={user} />

        <ChatFooter
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          inputRef={inputRef}
          markMessagesAsRead={markMessagesAsRead}
        />
      </div>
    </div>
  );
}
