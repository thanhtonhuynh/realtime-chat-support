import { User } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { MessageWithSender } from "@/types";
import moment from "moment";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function Messages({ messages, user }: { messages: MessageWithSender[]; user: User | null }) {
  return (
    // <main className="flex flex-1 flex-col-reverse overflow-y-auto">
    // <div className="flex flex-1 flex-col justify-end">
    <main className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 flex-col-reverse overflow-y-auto">
        <ul className="my-4 flex flex-col px-2">
          {messages.map((message, i) => (
            <li
              key={i}
              className={cn(
                "flex",
                user?.id === message.sender.id ? "justify-end" : "justify-start",
              )}
            >
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="max-w-[60%] cursor-text select-text">
                    <p
                      className={cn(
                        "break-words px-3 py-2 text-left text-sm leading-[1.33]",
                        user?.id === message.sender.id
                          ? "rounded-[18px] bg-primary/95 text-white"
                          : "rounded-[18px] bg-muted text-primary",
                        messages[i + 1]?.sender.id !== message.sender.id ? "mb-4" : "mb-[2px]",
                        messages[i - 1]?.sender.id !== message.sender.id &&
                          (user?.id === message.sender.id ? "rounded-br" : "rounded-bl"),
                        messages[i + 1]?.sender.id !== message.sender.id &&
                          (user?.id === message.sender.id ? "rounded-tr" : "rounded-tl"),
                        messages[i + 1]?.sender.id === messages[i - 1]?.sender.id &&
                          message.sender.id === messages[i - 1]?.sender.id &&
                          (user?.id === message.sender.id ? "rounded-r" : "rounded-l"),
                        messages[i + 1]?.sender.id === messages[i - 1]?.sender.id &&
                          message.sender.id !== messages[i - 1]?.sender.id &&
                          (user?.id === message.sender.id ? "rounded-[18px]" : "rounded-[18px]"),
                        messages[i + 1] === undefined &&
                          messages[i - 1]?.sender.id !== message.sender.id &&
                          (user?.id === message.sender.id ? "rounded-[18px]" : "rounded-[18px]"),
                      )}
                    >
                      {message.content}
                    </p>
                  </TooltipTrigger>

                  <TooltipContent side="right">
                    <p>{moment(message.createdAt).format("HH:mm")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
