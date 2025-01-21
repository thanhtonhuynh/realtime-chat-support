"use client";

import { cn } from "@/lib/utils";
import { useSession } from "@/providers/SessionProvider";
import { ReshapedConversation } from "@/types";
import moment from "moment";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

type ConversationItemProps = {
  conversation: ReshapedConversation;
};

export function ConversationItem({ conversation }: ConversationItemProps) {
  const { user } = useSession();
  const params = useParams();

  const getLastMessage = useMemo(() => {
    if (!conversation.latestMessage) return null;
    return conversation.latestMessage;
  }, [conversation.latestMessage]);

  const getLastMessageText = useMemo(() => {
    const lastMessage = getLastMessage;
    if (!lastMessage) return "Started a conversation";
    return lastMessage.content;
  }, [getLastMessage]);

  const hasNewMessage = useMemo(() => {
    const lastMessage = getLastMessage;
    if (!lastMessage) return false;
    return lastMessage.senderId !== user?.id && !lastMessage.isRead;
  }, [getLastMessage, user?.id]);

  return (
    <Link
      href={`/admin-chat/${conversation.id}`}
      className={cn(
        "relative cursor-pointer rounded-xl p-2",
        params.conversationId === conversation.id ? "bg-blue-50" : "hover:bg-muted",
      )}
    >
      {hasNewMessage && (
        <span className="absolute left-2 top-2 size-3 rounded-full bg-blue-600"></span>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>

          <div className="flex-1">
            <div className={cn("font-medium", hasNewMessage && "font-bold")}>
              {conversation.customerName}
            </div>

            <div className={cn("line-clamp-1 text-sm", hasNewMessage && "font-bold")}>
              {getLastMessage?.senderId === user?.id ? "You: " : ""}
              {getLastMessageText}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {moment(getLastMessage?.createdAt || conversation.createdAt).format("HH:mm")}
        </div>
      </div>
    </Link>
  );
}
