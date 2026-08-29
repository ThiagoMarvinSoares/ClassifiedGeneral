import { ChronicleCover } from "@/components/chronicles/chronicle-cover";
import { ChroniclesPanel } from "@/components/chronicles/chronicles-panel";

export default function ChroniclesPage() {
  return (
    <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] xl:items-start">
      <div className="@container mx-auto w-full max-w-[380px] xl:mx-0">
        <ChronicleCover />
      </div>
      <ChroniclesPanel />
    </div>
  );
}
