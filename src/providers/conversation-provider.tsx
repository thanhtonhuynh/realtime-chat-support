"use client";

import { createContext, useContext, useRef, useState } from "react";

type ConversationContext = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  selectedConvoId: string | null;
  setSelectedConvoId: (id: string | null) => void;
};

const ConversationContext = createContext({} as ConversationContext);

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);

  return (
    <ConversationContext.Provider value={{ inputRef, selectedConvoId, setSelectedConvoId }}>
      {children}
    </ConversationContext.Provider>
  );
};

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
}
