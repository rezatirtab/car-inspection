import { SectionCard, type SopSectionData } from "./SectionCard";
import { AddSectionForm } from "./AddSectionForm";

export function SopManager({ sections }: { sections: SopSectionData[] }) {
  const nextDisplayOrder = sections.length + 1;

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}
      <AddSectionForm nextDisplayOrder={nextDisplayOrder} />
    </div>
  );
}
