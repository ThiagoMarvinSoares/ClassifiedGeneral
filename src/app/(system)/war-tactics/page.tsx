import { SectionLayout } from "@/components/shell/section-layout";
import { TacticsPanel } from "@/components/war-tactics/tactics-panel";
import { WarTacticsPanel } from "@/components/war-tactics/war-tactics-panel";

export default function WarTacticsPage() {
  return <SectionLayout aside={<WarTacticsPanel />} below={<TacticsPanel />} />;
}
