import { MessageWithSender } from "@/types";

export function countUnreadMessages(messages: MessageWithSender[], userId: string) {
  return messages.filter((m) => m.senderId !== userId && !m.isRead).length;
}
