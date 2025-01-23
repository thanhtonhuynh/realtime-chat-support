"use client";

import { supabase } from "@/lib/supabase";
import { useConversation } from "@/providers/conversation-provider";
import { useSession } from "@/providers/SessionProvider";
import { ReshapedConversation } from "@/types";
import { useEffect, useState } from "react";
import { ConversationItem } from "./conversation-item";

type ConversationListProps = {
  initialConversations: ReshapedConversation[];
};

export function ConversationList({ initialConversations }: ConversationListProps) {
  const { user } = useSession();
  const [conversations, setConversations] = useState<ReshapedConversation[]>(initialConversations);
  const { inputRef, selectedConvoId } = useConversation();

  useEffect(() => {
    const channel = supabase
      .channel("admin-conversations")
      .on("broadcast", { event: "conversation:new" }, ({ payload }) => {
        setConversations((prev) => [payload.conversation, ...prev]);
      })
      .on("broadcast", { event: "conversation:update" }, ({ payload }) => {
        setConversations((prev) => {
          const updatedConversations = prev.map((c) => {
            if (c.id === payload.conversation.id) {
              if (
                (selectedConvoId === payload.conversation.id &&
                  inputRef.current === document.activeElement) ||
                payload.conversation.latestMessage.senderId === user?.id
              ) {
                return {
                  ...c,
                  latestMessage: payload.conversation.latestMessage,
                };
              }
              return {
                ...c,
                latestMessage: payload.conversation.latestMessage,
                unreadMessagesCount: c.unreadMessagesCount + 1,
              };
            }
            return c;
          });

          // Move the updated conversation to the top
          const updatedConversation = updatedConversations.find(
            (c) => c.id === payload.conversation.id,
          );
          if (!updatedConversation) return prev;
          return [
            updatedConversation,
            ...updatedConversations.filter((c) => c.id !== payload.conversation.id),
          ];
        });
      })
      .on("broadcast", { event: "conversation:message-read" }, ({ payload }) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === payload.conversation.id ? { ...c, unreadMessagesCount: 0 } : c,
          ),
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setConversations, inputRef, selectedConvoId]);

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}
