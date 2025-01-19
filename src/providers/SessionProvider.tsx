"use client";

import { Session } from "@prisma/client";
import { SessionValidationResult, User } from "@/lib/auth/session";
import { createContext, ReactNode, use, useContext, useMemo } from "react";

interface SessionContext {
  user: User | null;
  session: Session | null;
}

const SessionContext = createContext({} as SessionContext);

export function SessionProvider({
  children,
  sessionPromise,
}: {
  children: ReactNode;
  sessionPromise: Promise<SessionValidationResult>;
}) {
  const { session, user } = use(sessionPromise);

  const value = useMemo(() => ({ session, user }), [session, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
