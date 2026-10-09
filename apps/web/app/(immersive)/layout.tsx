import type { ReactNode } from "react";
import { ImmersiveChrome } from "@/components/layout/ImmersiveChrome";
import { getCurrentUserCached } from "@/lib/auth/getCurrentUserCached";

export default async function ImmersiveLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserCached();

  return <ImmersiveChrome user={user}>{children}</ImmersiveChrome>;
}
