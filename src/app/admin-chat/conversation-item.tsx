"use client";

import { UnreadMessagesIndicator } from "@/components/UnreadMessagesIndicator";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/SessionProvider";
import { ReshapedConversation } from "@/types";
import moment from "moment";
import Link from "next/link";
import { useParams } from "next/navigation";

type ConversationItemProps = {
  conversation: ReshapedConversation;
};

export function ConversationItem({ conversation }: ConversationItemProps) {
  const { user } = useSession();
  const params = useParams();
  const hasNewMessages = conversation.unreadMessagesCount > 0;

  return (
    <Link
      prefetch={false}
      href={`/admin-chat/${conversation.id}`}
      className={cn(
        "relative cursor-pointer rounded-xl p-2",
        params.conversationId === conversation.id ? "bg-blue-50" : "hover:bg-muted",
      )}
    >
      {hasNewMessages && (
        <UnreadMessagesIndicator
          count={conversation.unreadMessagesCount}
          className="absolute left-2 top-2"
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-3">
          <div className="size-14 rounded-full bg-gray-200"></div>

          <div className="flex-1">
            <div className={cn("font-medium", hasNewMessages && "font-bold")}>
              {conversation.customer.name}
            </div>

            <div className={cn("line-clamp-1 text-sm", hasNewMessages && "font-bold")}>
              {conversation.latestMessage?.senderId === user?.id ? "You: " : ""}
              {conversation.latestMessage?.content || "Started a new conversation"}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {moment(conversation.latestMessage?.createdAt || conversation.createdAt).format("HH:mm")}
        </div>
      </div>
    </Link>
  );
}
