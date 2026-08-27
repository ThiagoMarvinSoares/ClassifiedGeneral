import { NextResponse } from "next/server";

import { revokeClearance } from "@/lib/session";

export async function POST(request: Request) {
  await revokeClearance();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
