import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { Redis } from "@upstash/redis";

import { DEFAULT_CHARACTER, sanitizeCharacter, type Character } from "@/lib/character";

/**
 * A ficha vive em dois lugares, conforme o ambiente:
 *
 * - **Redis**, quando há credencial. É o caso da hospedagem serverless, onde o
 *   disco é somente-leitura e cada requisição pode cair em outra instância.
 * - **Arquivo**, no resto — em desenvolvimento é bom que a ficha seja um JSON
 *   que dá para abrir, versionar e editar à mão.
 *
 * Este é o único módulo que sabe disso. Trocar de armazenamento é mexer aqui.
 */

const KEY = "armada:character";
const FILE = join(process.cwd(), "data", "character.json");

function redis() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** A ficha versionada no repo, usada como semente na primeira leitura. */
async function readFromFile(): Promise<Character> {
  try {
    return sanitizeCharacter(JSON.parse(await readFile(FILE, "utf8")));
  } catch {
    // arquivo ausente ou corrompido: cai na ficha inicial em vez de quebrar
    return DEFAULT_CHARACTER;
  }
}

export async function readCharacter(): Promise<Character> {
  const client = redis();
  if (!client) return readFromFile();

  try {
    const stored = await client.get<unknown>(KEY);
    if (stored) return sanitizeCharacter(stored);

    // primeira leitura com o Redis vazio: semeia com o que veio no deploy,
    // senão o primeiro acesso mostraria a ficha inicial no lugar da sua
    const seed = await readFromFile();
    await client.set(KEY, seed);
    return seed;
  } catch {
    // Redis fora do ar não pode derrubar a página; a escrita ainda vai falhar
    // de forma visível, que é o comportamento honesto
    return readFromFile();
  }
}

export async function writeCharacter(input: unknown): Promise<Character> {
  const character = sanitizeCharacter(input);
  const client = redis();

  if (client) {
    await client.set(KEY, character);
    return character;
  }

  await mkdir(dirname(FILE), { recursive: true });
  await writeFile(FILE, `${JSON.stringify(character, null, 2)}\n`, "utf8");
  return character;
}
