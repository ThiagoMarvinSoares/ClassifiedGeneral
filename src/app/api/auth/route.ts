import { NextResponse } from "next/server";

import {
  grantClearance,
  isAuthConfigured,
  revokeClearance,
  verifyCredentials,
} from "@/lib/session";

/** Atraso fixo: encarece tentativa em massa e vende o drama da verificação. */
const VERIFY_DELAY_MS = 450;

type Payload = { username?: unknown; password?: unknown };

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { ok: false, code: "SYSTEM_OFFLINE", message: "SYSTEM NOT CONFIGURED — ARMADA_ACCESS_CODE MISSING" },
      { status: 503 },
    );
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, code: "MALFORMED", message: "CORRUPTED TRANSMISSION" },
      { status: 400 },
    );
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  await new Promise((resolve) => setTimeout(resolve, VERIFY_DELAY_MS));

  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { ok: false, code: "DENIED", message: "INVALID CREDENTIALS" },
      { status: 401 },
    );
  }

  await grantClearance();
  return NextResponse.json({ ok: true, clearance: "LV4", callsign: "ARMADA" });
}

export async function DELETE() {
  await revokeClearance();
  return NextResponse.json({ ok: true });
}
