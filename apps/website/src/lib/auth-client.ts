"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Better Auth serves its own API at /api/auth/*
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}`
    : undefined,
});

export const { signIn, signOut, signUp, useSession } = authClient;
