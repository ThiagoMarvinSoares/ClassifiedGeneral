import { FootlockerPanel } from "@/components/footlocker/footlocker-panel";
import { SectionLayout } from "@/components/shell/section-layout";

export default function FootlockerPage() {
  return <SectionLayout aside={<FootlockerPanel />} />;
}
