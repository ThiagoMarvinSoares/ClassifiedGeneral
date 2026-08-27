import { TacticsPanel } from "@/components/war-tactics/tactics-panel";
import { WarTacticsPanel } from "@/components/war-tactics/war-tactics-panel";

export default function WarTacticsPage() {
  return (
    <div className="space-y-4">
      <WarTacticsPanel />
      <TacticsPanel />
    </div>
  );
}
