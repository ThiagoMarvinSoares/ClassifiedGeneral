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

/**
 * Acha a credencial do Redis no ambiente. Procura por sufixo em vez de nome
 * exato porque cada integração batiza as variáveis à sua maneira — e algumas
 * prefixam com o nome do recurso, como `ROSE_HOUSE_KV_REST_API_URL`.
 */
function credentials() {
  const suffix = /(KV_REST_API_URL|UPSTASH_REDIS_REST_URL|REDIS_REST_URL)$/;

  for (const [key, url] of Object.entries(process.env)) {
    if (!url || !suffix.test(key)) continue;
    const token = process.env[key.replace(/URL$/, "TOKEN")];
    if (token) return { url, token };
  }
  return null;
}

/** Qual armazenamento está valendo — a rota expõe isso para diagnóstico. */
export function storageKind(): "redis" | "file" {
  return credentials() ? "redis" : "file";
}

function redis() {
  const found = credentials();
  return found ? new Redis(found) : null;
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
