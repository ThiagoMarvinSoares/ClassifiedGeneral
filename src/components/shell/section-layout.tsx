import { DossierSheet } from "@/components/dossier/dossier-sheet";

/**
 * Grade da seção: a ficha em papel à esquerda, o painel da seção à direita e,
 * opcionalmente, um painel que ocupa a largura inteira embaixo dos dois.
 *
 * No celular tudo empilha na ordem de leitura do dossiê: a ficha primeiro e os
 * painéis da seção abaixo dela.
 */
export function SectionLayout({
  aside,
  below,
}: {
  aside: React.ReactNode;
  below?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] xl:items-start">
      <div className="order-1 min-w-0 xl:col-start-1 xl:row-start-1">
        <DossierSheet />
      </div>
      <div className="order-2 min-w-0 xl:col-start-2 xl:row-start-1">{aside}</div>
      {below && (
        <div className="order-3 min-w-0 xl:col-span-2 xl:row-start-2">{below}</div>
      )}
    </div>
  );
}
