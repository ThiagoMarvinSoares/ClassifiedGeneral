"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Texto longo: um editor só para o documento inteiro, em vez de um campo por
 * parágrafo. Corrigir uma frase funcionava bem campo a campo; *escrever* não —
 * quem escreve precisa ver o texto todo e mover coisas de lugar.
 *
 * O armazenamento continua sendo uma lista de blocos; a conversão acontece na
 * entrada e na saída do editor.
 */
export function LongForm({
  blocks,
  onCommit,
  label,
  empty = "Ainda não escrito.",
  tone = "paper",
}: {
  blocks: string[];
  onCommit: (blocks: string[]) => void;
  label: string;
  empty?: string;
  /** O editor vive tanto sobre papel quanto sobre o painel escuro. */
  tone?: Tone;
}) {
  const skin = TONES[tone];
  const [draft, setDraft] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const editing = draft !== null;

  // cresce com o conteúdo: rolagem dentro de caixa é péssima para escrever
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [draft]);

  // só ao entrar em edição; digitar depois não deve mexer no cursor
  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  function commit() {
    const next = (draft ?? "")
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);
    setDraft(null);
    onCommit(next);
  }

  if (editing) {
    return (
      <div>
        <textarea
          ref={ref}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label={label}
          spellCheck
          onKeyDown={(event) => {
            if (event.key === "Escape") setDraft(null);
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) commit();
          }}
          className={`block w-full resize-none rounded-[2px] border p-5 outline-none
                      ${PROSE.body} ${skin.area}`}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={commit}
            className={`rounded-[2px] border px-4 py-2 text-[0.55rem] font-medium uppercase
                        tracking-[0.22em] transition-colors ${skin.save}`}
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className={`text-[0.55rem] uppercase tracking-[0.22em] transition-colors ${skin.cancel}`}
          >
            Cancelar
          </button>
          <p className={`ml-auto text-[0.5rem] uppercase tracking-[0.18em] ${skin.hint}`}>
            Linha em branco separa parágrafos · <code>##</code> subtítulo ·{" "}
            <code>---</code> quebra de cena
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {blocks.length === 0 ? (
        <p className={`text-[0.8rem] uppercase tracking-[0.16em] ${skin.empty}`}>{empty}</p>
      ) : (
        <div>
          {blocks.map((block, index) => (
            <Block key={index} block={block} first={index === 0} tone={tone} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setDraft(blocks.join("\n\n"))}
        className={`mt-6 rounded-[2px] border px-4 py-2 text-[0.55rem] font-medium uppercase
                    tracking-[0.22em] transition-colors ${skin.open}`}
      >
        {blocks.length === 0 ? "Escrever" : "Editar texto"}
      </button>
    </div>
  );
}

type Tone = "paper" | "panel";

/**
 * Tipografia do texto longo, num lugar só: a datilografia e o editor precisam
 * casar exatamente, senão o texto "pula" quando a máquina termina de escrever.
 */
export const PROSE = {
  body: "text-[1rem] leading-[1.75]",
  heading: "text-[1.15rem] font-bold uppercase tracking-[0.12em]",
  rule: "text-[0.85rem]",
  gapBody: "mt-5",
  gapHeading: "mt-10",
} as const;

const TONES = {
  paper: {
    area: "border-ink/25 bg-paper-50/50 text-ink focus:border-ink/50",
    save: "border-ink/40 bg-ink/10 text-ink hover:border-ink/70",
    cancel: "text-ink-soft hover:text-stamp",
    hint: "text-ink-soft/70",
    open: "border-ink/30 text-ink-soft hover:border-ink/60 hover:text-ink",
    empty: "text-ink-soft/70",
    heading: "text-ink",
    body: "text-ink/90",
    rule: "text-ink-soft/50",
  },
  panel: {
    area: "border-line bg-black/40 text-bone focus:border-mil-dim",
    save: "border-mil-dim/70 bg-mil-dim/20 text-bone hover:border-mil",
    cancel: "text-bone-dim hover:text-alert",
    hint: "text-bone-dim/60",
    open: "border-line text-bone-dim hover:border-mil-dim hover:text-mil-bright",
    empty: "text-bone-dim/70",
    heading: "text-bone",
    body: "text-bone-dim",
    rule: "text-bone-dim/50",
  },
} as const;

/** Um bloco já formatado: subtítulo, quebra de cena ou parágrafo. */
export function Block({
  block,
  first = false,
  tone = "paper",
}: {
  block: string;
  first?: boolean;
  tone?: Tone;
}) {
  const skin = TONES[tone];

  if (block.startsWith("## ")) {
    return (
      <p
        className={`${PROSE.heading} ${skin.heading} ${first ? "" : PROSE.gapHeading}`}
      >
        {block.replace(/^##\s+/, "")}
      </p>
    );
  }

  if (block.trim() === "---") {
    return <p className={`my-7 text-center ${PROSE.rule} ${skin.rule}`}>★</p>;
  }

  return (
    <p className={`${PROSE.body} ${skin.body} ${first ? "" : PROSE.gapBody}`}>{block}</p>
  );
}
