import { redirect } from "next/navigation";

import { AuthSequence } from "@/components/auth-sequence";
import { hasClearance } from "@/lib/session";

/** Tela 02 — só existe para quem já passou pelo login. */
export default async function AuthenticatingPage() {
  if (!(await hasClearance())) redirect("/");
  return <AuthSequence />;
}
