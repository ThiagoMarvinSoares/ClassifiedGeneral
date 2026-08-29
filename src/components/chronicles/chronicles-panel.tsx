"use client";

import { useState } from "react";

import { useCharacter } from "@/components/character-provider";
import { TypedBlocks, useTypewriter } from "@/components/chronicles/typewriter";
import { EditText } from "@/components/editable";
import { PaperSurface } from "@/components/paper";
import { SectionPanel } from "@/components/shell/section-panel";
import type { Chapter } from "@/lib/character";

export function ChroniclesPanel() {
  const { character, update } = useCharacter();

  return (
    <SectionPanel
      title="War Chronicles"
      subtitle="Cada capítulo revela o caminho de um comandante."
      footer={
        <>
          <p className="text-[0.58rem] uppercase tracking-[0.16em] text-bone-dim/60">
            ★ More chapters coming soon…
          </p>
          <button
            type="button"
            onClick={() =>
              update((draft) => {
                draft.chronicles.push({
                  id: `chapter-${draft.chronicles.length}-${Date.now()}`,
                  title: "New chapter",
                  summary: "",
                  locked: true,
                  paragraphs: [],
                });
              })
            }
            className="rounded-[2px] border border-line px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em]
                       text-bone-dim transition-colors hover:border-mil-dim hover:text-mil-bright"
          >
            + Add chapter
          </button>
        </>
      }
    >
      <ul className="space-y-3">
        {character.chronicles.map((chapter, index) => (
          <li key={chapter.id}>
            <ChapterCard chapter={chapter} index={index} />
          </li>
        ))}
      </ul>
    </SectionPanel>
  );
}

function ChapterCard({ chapter, index }: { chapter: Chapter; index: number }) {
  const { update } = useCharacter();
  const edit = (recipe: (draft: Chapter) => void) =>
    update((draft) => recipe(draft.chronicles[index]));

  const number = String(index + 1).padStart(2, "0");

  // o capítulo é datilografado ao abrir; enquanto sai, não se edita
  const [open, setOpen] = useState(false);
  const typing = useTypewriter(chapter.paragraphs, open && chapter.paragraphs.length > 0);

  return (
    <PaperSurface crease={false} className="shadow-[0_10px_26px_-14px_rgba(0,0,0,0.85)]">
      {/* aberto de forma controlada: o onToggle do <details> não é confiável
          para disparar a datilografia no momento certo */}
      <details open={open} className="group/chapter">
        <summary
          className={`flex list-none items-stretch gap-4 [&::-webkit-details-marker]:hidden ${
            chapter.locked ? "cursor-default" : "cursor-pointer"
          }`}
          onClick={(event) => {
            event.preventDefault();
            // capítulo trancado não abre; o cadeado é a explicação
            if (!chapter.locked) setOpen((value) => !value);
          }}
        >
          {/* número do capítulo */}
          <span
            className={`flex w-16 shrink-0 flex-col items-center justify-center py-4 text-center ${
              chapter.locked ? "bg-ink/85 text-paper-200/60" : "bg-mil-dim text-paper-50"
            }`}
          >
            <span className="text-xl font-bold leading-none tabular-nums">{number}</span>
            <span className="mt-0.5 text-[0.42rem] font-medium uppercase tracking-[0.2em] opacity-80">
              Chapter
            </span>
          </span>

          <span className="min-w-0 flex-1 py-3 pr-2">
            <EditText
              label={`Título do capítulo ${number}`}
              value={chapter.title}
              onCommit={(next) => edit((c) => void (c.title = next))}
              className="text-[0.95rem] font-bold uppercase tracking-[0.1em] text-ink"
            />
            <EditText
              label={`Chamada do capítulo ${number}`}
              value={chapter.summary}
              placeholder="Sem chamada"
              multiline
              onCommit={(next) => edit((c) => void (c.summary = next))}
              className="mt-1 block w-full text-[0.7rem] leading-snug text-ink-soft"
            />
          </span>

          <span className="flex shrink-0 items-center gap-2 pr-3">
            {/* preventDefault: sem ele o clique aqui dentro abriria o <details> */}
            <button
              type="button"
              onClick={(event) => {
                // o clique não pode chegar ao summary e abrir o capítulo
                event.preventDefault();
                event.stopPropagation();
                edit((c) => void (c.locked = !c.locked));
              }}
              aria-label={`Capítulo ${number}: ${
                chapter.locked ? "trancado" : "liberado"
              }. Clique para alternar`}
              className="rounded-[2px] border border-ink/30 px-2 py-1.5 text-[0.45rem] font-medium
                         uppercase tracking-[0.18em] text-ink-soft transition-colors
                         hover:border-stamp hover:text-stamp"
            >
              {chapter.locked ? "Unlock" : "Lock"}
            </button>

            {chapter.locked ? (
              <LockIcon className="h-8 w-8 rounded-[2px] border border-ink/25 bg-ink/10 p-2 text-ink/45" />
            ) : (
              <span
                className="flex items-center gap-2 rounded-[2px] bg-mil-dim px-4 py-2 text-[0.6rem]
                           font-medium uppercase tracking-[0.2em] text-paper-50"
              >
                Open
                <span aria-hidden className="transition-transform group-open/chapter:rotate-90">
                  ›
                </span>
              </span>
            )}
          </span>
        </summary>

        {/* o capítulo em si */}
        <div className="border-t border-ink/20 px-5 py-5 sm:px-8">
          <div className="max-w-[68ch]">
            {chapter.paragraphs.length === 0 && (
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-ink-soft/70">
                Capítulo ainda não escrito.
              </p>
            )}

            {!typing.done ? (
              <TypedBlocks
                blocks={chapter.paragraphs}
                lengthOf={typing.lengthOf}
                onSkip={typing.skip}
              />
            ) : (
              <div className="space-y-4">
                {chapter.paragraphs.map((paragraph, paragraphIndex) => {
                  const commit = (next: string) =>
                    edit((c) => {
                      // parágrafo esvaziado é parágrafo removido
                      if (next) c.paragraphs[paragraphIndex] = next;
                      else c.paragraphs.splice(paragraphIndex, 1);
                    });
                  const label = `Parágrafo ${paragraphIndex + 1} do capítulo ${number}`;

                  // convenção de escrita: "## " abre um subtítulo, "---" é
                  // quebra de cena. Editando, o texto cru aparece.
                  if (paragraph.startsWith("## ")) {
                    return (
                      <EditText
                        key={paragraphIndex}
                        label={label}
                        value={paragraph}
                        onCommit={commit}
                        format={(value) => value.replace(/^##\s+/, "")}
                        className="mt-8 block text-[0.95rem] font-bold uppercase tracking-[0.14em] text-ink first:mt-0"
                      />
                    );
                  }

                  if (paragraph.trim() === "---") {
                    return (
                      <EditText
                        key={paragraphIndex}
                        label={label}
                        value={paragraph}
                        onCommit={commit}
                        format={() => "★"}
                        className="my-6 block w-full text-center text-[0.7rem] text-ink-soft/50"
                      />
                    );
                  }

                  return (
                    <EditText
                      key={paragraphIndex}
                      label={label}
                      value={paragraph}
                      multiline
                      onCommit={commit}
                      className="block w-full text-[0.8rem] leading-[1.9] text-ink/90"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {typing.done && (
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-ink/15 pt-3">
            <button
              type="button"
              onClick={() => edit((c) => void c.paragraphs.push("—"))}
              className="editable px-2 py-1 text-[0.5rem] uppercase tracking-[0.2em] text-ink-soft"
            >
              + Parágrafo
            </button>
            <button
              type="button"
              onClick={() => update((draft) => void draft.chronicles.splice(index, 1))}
              className="editable ml-auto px-2 py-1 text-[0.5rem] uppercase tracking-[0.2em] text-ink-soft"
            >
              − Remove chapter
            </button>
          </div>
          )}
        </div>
      </details>
    </PaperSurface>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M6 10.5V7.5a6 6 0 1112 0v3h1.5v11h-15v-11zm3 0h6V7.5a3 3 0 10-6 0z" />
    </svg>
  );
}
