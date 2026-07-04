"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginResult = { error: string } | undefined;

export async function login(
  _prevState: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "wrong username or password" };
    }
    throw err;
  }
}
