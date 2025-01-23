import { Dispatch, RefObject, SetStateAction } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type ChatFooterProps = {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  sendMessage: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  markMessagesAsRead: () => void;
};

export function ChatFooter({
  message,
  setMessage,
  sendMessage,
  inputRef,
  markMessagesAsRead,
}: ChatFooterProps) {
  return (
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
        onFocus={markMessagesAsRead}
      />

      <Button
        size="sm"
        className="rounded-full bg-blue-600 shadow-md hover:bg-blue-600/90"
        onClick={sendMessage}
      >
        Send
      </Button>
    </footer>
  );
}
