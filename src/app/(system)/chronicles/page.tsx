import { ChronicleCover } from "@/components/chronicles/chronicle-cover";
import { ChroniclesPanel } from "@/components/chronicles/chronicles-panel";
import { SectionTheme } from "@/components/section-theme";

export default function ChroniclesPage() {
  return (
    <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] xl:items-start">
      {/* as trilhas se revezam enquanto esta página está montada */}
      <SectionTheme tracks={["/typewriter-theme.mp3", "/save-theme.mp3"]} />
      <div className="@container mx-auto w-full max-w-[380px] xl:mx-0">
        <ChronicleCover />
      </div>
      <ChroniclesPanel />
    </div>
  );
}
