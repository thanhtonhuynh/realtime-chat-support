"use client";

import { supabase } from "@/lib/supabase";
import { useConversation } from "@/providers/conversation-provider";
import { ReshapedConversation } from "@/types";
import { useEffect, useState } from "react";
import { ConversationItem } from "./conversation-item";

type ConversationListProps = {
  initialConversations: ReshapedConversation[];
};

export function ConversationList({ initialConversations }: ConversationListProps) {
  const [conversations, setConversations] = useState<ReshapedConversation[]>(initialConversations);
  const { inputRef, selectedConvoId } = useConversation();

  useEffect(() => {
    const channel = supabase
      .channel("admin-conversations")
      .on("broadcast", { event: "conversation:new" }, ({ payload }) => {
        setConversations((prev) => [payload.conversation, ...prev]);
      })
      .on("broadcast", { event: "conversation:update" }, async ({ payload }) => {
        setConversations((prev) => {
          const updatedConversations = prev.map((c) => {
            if (c.id === payload.conversation.id) {
              if (
                selectedConvoId === payload.conversation.id &&
                inputRef.current === document.activeElement
              ) {
                return {
                  ...c,
                  latestMessage: { ...payload.conversation.latestMessage, isRead: true },
                };
              }
              return { ...c, latestMessage: payload.conversation.latestMessage };
            }
            return c;
          });

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
      .on("broadcast", { event: "conversation:message-read" }, async ({ payload }) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === payload.conversation.id) {
              return { ...c, latestMessage: { ...c.latestMessage, isRead: true } };
            }
            return c;
          }),
        );

        // await markLastMessageRead(payload.conversation.id);
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
