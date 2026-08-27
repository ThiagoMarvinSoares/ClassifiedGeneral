import { NextResponse } from "next/server";

import { readCharacter, writeCharacter } from "@/lib/character-store";
import { hasClearance } from "@/lib/session";

export async function GET() {
  if (!(await hasClearance())) {
    return NextResponse.json({ ok: false, message: "NO CLEARANCE" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, character: await readCharacter() });
}

export async function PUT(request: Request) {
  if (!(await hasClearance())) {
    return NextResponse.json({ ok: false, message: "NO CLEARANCE" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "MALFORMED RECORD" }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, character: await writeCharacter(body) });
  } catch (error) {
    // disco somente-leitura é o caso normal em hospedagem serverless
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      return NextResponse.json(
        { ok: false, code: "READ_ONLY", message: "STORAGE READ-ONLY — CHANGES NOT SAVED" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { ok: false, code: "WRITE_FAILED", message: "RECORD WRITE FAILED" },
      { status: 500 },
    );
  }
}
