"use client";

import { createMessage, markMessagesAsReadAction } from "@/app/actions";
import { ChatFooter } from "@/components/chat-footer";
import { Messages } from "@/components/chat-messages";
import { supabase } from "@/lib/supabase";
import { useConversation } from "@/providers/conversation-provider";
import { useSession } from "@/providers/SessionProvider";
import { MessageWithSender } from "@/types";
import { Conversation } from "@prisma/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type AdminChatWindowProps = {
  conversation: Conversation;
  serverMessages: MessageWithSender[];
  initialUnreadMessagesCount: number;
};

export function AdminChatWindow({
  conversation,
  serverMessages,
  initialUnreadMessagesCount,
}: AdminChatWindowProps) {
  const { user } = useSession();
  const [messages, setMessages] = useState<MessageWithSender[]>(serverMessages);
  const [message, setMessage] = useState("");
  const channel = useRef<RealtimeChannel | null>(null);
  const adminChannel = useRef<RealtimeChannel | null>(null);
  const { inputRef, setSelectedConvoId } = useConversation();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(initialUnreadMessagesCount);

  useEffect(() => {
    setSelectedConvoId(conversation.id);
    channel.current = supabase.channel(`room-${conversation.id}`);
    adminChannel.current = supabase.channel("admin-conversations");
    markMessagesAsRead();

    channel.current
      .on("broadcast", { event: "message" }, async ({ payload }) => {
        setMessages((prevMessages) => [...prevMessages, payload.message]);

        if (inputRef.current === document.activeElement) {
          await markMessagesAsReadAction(conversation.id);
        } else {
          setUnreadMessagesCount((prev) => prev + 1);
        }
      })
      .subscribe();

    return () => {
      setSelectedConvoId(null);
      channel.current?.unsubscribe();
      channel.current = null;
      adminChannel.current?.unsubscribe();
      adminChannel.current = null;
    };
  }, [conversation.id]);

  async function markMessagesAsRead() {
    if (unreadMessagesCount <= 0 || !adminChannel.current) return;
    setUnreadMessagesCount(0);
    adminChannel.current.send({
      type: "broadcast",
      event: "conversation:message-read",
      payload: {
        conversation: {
          id: conversation.id,
        },
      },
    });
    await markMessagesAsReadAction(conversation.id);
  }

  async function sendMessage() {
    if (!channel.current || !adminChannel.current || message.trim().length === 0 || !user) return;

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
    await createMessage(newMessage.id, conversation.id, user.id, newMessage.content);

    channel.current.send({
      type: "broadcast",
      event: "message",
      payload: { message: newMessage },
    });
  }

  return (
    <>
      <Messages messages={messages} user={user} />

      <ChatFooter
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        inputRef={inputRef}
        markMessagesAsRead={markMessagesAsRead}
      />
    </>
  );
}
