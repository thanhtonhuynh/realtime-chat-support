"use server";

import { createUser, getUserByEmail, getUserByUsername } from "@/data-access/user";
import { createSession, generateSessionToken, setSessionTokenCookie } from "@/lib/auth/session";
import { SignupSchema, SignupSchemaTypes } from "@/lib/validations/auth";
import { rateLimitByIp, unauthenticatedRateLimit } from "@/utils/rate-limiter";
import { redirect } from "next/navigation";

export async function signUpAction(data: SignupSchemaTypes) {
  try {
    if (
      !(await unauthenticatedRateLimit()) ||
      !(await rateLimitByIp({ key: "signup", limit: 3, interval: 30000 }))
    ) {
      return { error: "Too many requests. Please try again later." };
    }

    const { name, username, email, password } = SignupSchema.parse(data);

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return { error: "Email already in use" };
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return { error: "Username already in use" };
    }

    const user = await createUser(name, username, email, password);

    const sessionToken = generateSessionToken();

    const session = await createSession(sessionToken, user.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (error) {
    console.error(error);
    return { error: "Signup failed. Please try again." };
  }

  redirect(`/`);
}
