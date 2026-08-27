"use client";

import { useEffect, useRef, useState } from "react";

type Common = {
  label: string;
  className?: string;
  placeholder?: string;
};

/** Texto editável ao clique. Enter confirma, Esc descarta, blur confirma. */
export function EditText({
  value,
  onCommit,
  label,
  className = "",
  placeholder = "—",
  multiline = false,
}: Common & {
  value: string;
  onCommit: (next: string) => void;
  multiline?: boolean;
}) {
  // `null` = fora de edição. Um estado só, então não há rascunho para
  // ressincronizar quando o valor muda por fora.
  const [draft, setDraft] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (draft === null) return;
    const node = ref.current;
    node?.focus();
    node?.select();
    // só ao entrar em edição: o valor digitado depois não deve reselecionar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft === null]);

  function commit() {
    const next = (draft ?? "").trim();
    setDraft(null);
    if (next !== value) onCommit(next);
  }

  if (draft !== null) {
    const shared = {
      value: draft,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(event.target.value),
      onBlur: commit,
      className: `editable-input ${className}`,
      "aria-label": label,
    };

    if (multiline) {
      return (
        <textarea
          {...shared}
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          rows={2}
          onKeyDown={(event) => {
            if (event.key === "Escape") setDraft(null);
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) commit();
          }}
        />
      );
    }

    return (
      <input
        {...shared}
        ref={ref as React.RefObject<HTMLInputElement>}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") setDraft(null);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setDraft(value)}
      aria-label={`${label}: ${value || placeholder}. Clique para editar`}
      className={`editable ${className}`}
    >
      {value || <span className="opacity-40">{placeholder}</span>}
    </button>
  );
}

/** Igual ao EditText, mas devolve número e recusa lixo. */
export function EditNumber({
  value,
  onCommit,
  label,
  className = "",
  min = 0,
  max = 999,
  format,
}: Common & {
  value: number;
  onCommit: (next: number) => void;
  min?: number;
  max?: number;
  format?: (value: number) => string;
}) {
  return (
    <EditText
      label={label}
      className={className}
      value={format ? format(value) : String(value)}
      onCommit={(next) => {
        const parsed = Number(next.replace(/[^\d.-]/g, ""));
        if (!Number.isFinite(parsed)) return;
        onCommit(Math.min(max, Math.max(min, Math.round(parsed))));
      }}
    />
  );
}
