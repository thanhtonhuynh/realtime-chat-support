import { User } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { MessageWithSender } from "@/types";
import moment from "moment";

export function Messages({ messages, user }: { messages: MessageWithSender[]; user: User | null }) {
  return (
    // <main className="flex flex-1 flex-col-reverse overflow-y-auto">
    // <div className="flex flex-1 flex-col justify-end">
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
  );
}
