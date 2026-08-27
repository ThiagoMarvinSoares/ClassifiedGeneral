import { SkillsPanel } from "@/components/dossier/skills-panel";
import { SectionLayout } from "@/components/shell/section-layout";

export default function DossierPage() {
  return <SectionLayout aside={<SkillsPanel />} />;
}
