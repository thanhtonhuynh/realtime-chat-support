"use server";

import { getUserByEmailOrUsername, getUserPasswordHash } from "@/data-access/user";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, generateSessionToken, setSessionTokenCookie } from "@/lib/auth/session";
import { LoginSchema, LoginSchemaTypes } from "@/lib/validations/auth";
import { rateLimitByKey, unauthenticatedRateLimit } from "@/utils/rate-limiter";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export async function loginAction(data: LoginSchemaTypes) {
  try {
    if (!(await unauthenticatedRateLimit())) {
      return { error: "Too many requests. Please try again later." };
    }

    const { identifier, password } = LoginSchema.parse(data);

    if (!(await rateLimitByKey({ key: identifier, limit: 3, interval: 10000 }))) {
      return { error: "Too many requests. Please try again later." };
    }

    const existingUser = await getUserByEmailOrUsername(identifier);
    if (!existingUser) {
      return { error: "Invalid email, username, or password" };
    }

    const passwordHash = await getUserPasswordHash(existingUser.id);
    if (!passwordHash) {
      return { error: "Invalid email, username, or password" };
    }

    const validPassword = await verifyPassword(passwordHash, password);
    if (!validPassword) {
      return { error: "Invalid email, username, or password" };
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(error);
    return { error: "Login failed. Please try again." };
  }

  redirect("/");
}
