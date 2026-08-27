import "server-only";

import { cookies } from "next/headers";

export const SESSION_COOKIE = "armada_clearance";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12h de turno

const DEFAULT_USER = "armada";
const encoder = new TextEncoder();

function accessCode() {
  return process.env.ARMADA_ACCESS_CODE ?? "";
}

function accessUser() {
  return process.env.ARMADA_ACCESS_USER ?? DEFAULT_USER;
}

/** Comparação em tempo constante — não vaza o tamanho do acerto. */
function safeEqual(a: string, b: string) {
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/** Valor do cookie: derivado do segredo, então trocar o segredo invalida sessões. */
async function clearanceToken() {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`armada::lv4::${accessUser()}::${accessCode()}`),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isAuthConfigured() {
  return accessCode().length > 0;
}

export function verifyCredentials(username: string, password: string) {
  if (!isAuthConfigured()) return false;
  const userOk = safeEqual(username.trim().toLowerCase(), accessUser().toLowerCase());
  const codeOk = safeEqual(password, accessCode());
  return userOk && codeOk;
}

export async function grantClearance() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await clearanceToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function revokeClearance() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function hasClearance() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !isAuthConfigured()) return false;
  return safeEqual(token, await clearanceToken());
}
