import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { DEFAULT_CHARACTER, sanitizeCharacter, type Character } from "@/lib/character";

/** Uma ficha, um arquivo. Trocar de storage depois é trocar só este módulo. */
const FILE = join(process.cwd(), "data", "character.json");

export async function readCharacter(): Promise<Character> {
  try {
    return sanitizeCharacter(JSON.parse(await readFile(FILE, "utf8")));
  } catch {
    // arquivo ausente ou corrompido: cai na ficha inicial em vez de quebrar
    return DEFAULT_CHARACTER;
  }
}

export async function writeCharacter(input: unknown): Promise<Character> {
  const character = sanitizeCharacter(input);
  await mkdir(dirname(FILE), { recursive: true });
  await writeFile(FILE, `${JSON.stringify(character, null, 2)}\n`, "utf8");
  return character;
}
