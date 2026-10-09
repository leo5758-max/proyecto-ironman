"use server";

import { redirect } from "next/navigation";
import { buildAuthUseCases } from "@/lib/auth/composition";
import { toHumanMessage } from "@/lib/errors/toHumanMessage";

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const referralCode = formData.get("referralCode");

  const { registerUser } = await buildAuthUseCases();
  try {
    await registerUser.execute({
      email,
      password,
      ...(typeof referralCode === "string" && referralCode ? { referralCode } : {}),
    });
  } catch (error) {
    const message = toHumanMessage(error instanceof Error ? error.message : undefined);
    redirect(`/signup?error=${encodeURIComponent(message)}`);
  }
  redirect("/login?registered=1");
}
