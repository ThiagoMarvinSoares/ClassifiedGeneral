import { redirect } from "next/navigation";

import { CharacterProvider } from "@/components/character-provider";
import { AppShell } from "@/components/shell/app-shell";
import { readCharacter } from "@/lib/character-store";
import { hasClearance } from "@/lib/session";

export default async function SystemLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasClearance())) redirect("/");

  return (
    <CharacterProvider initial={await readCharacter()}>
      <AppShell>{children}</AppShell>
    </CharacterProvider>
  );
}
