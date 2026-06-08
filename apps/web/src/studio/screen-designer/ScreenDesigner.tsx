import { useMemo, useState } from 'react';
import { StudioButton, StudioPanel } from '../design-system/StudioDesignSystem';
import type { CreationEntityInput } from '../create/creation-types';
import { autoDesignLayout, createInitialScreenLayout, type DesignedScreenField, type DesignedScreenLayout, type PreviewDevice, type ScreenComponentType } from './screen-designer-types';
import { ComponentPalette } from './ComponentPalette';
import { Canvas } from './Canvas';
import { PropertyPanel } from './PropertyPanel';
import { PreviewPanel } from './PreviewPanel';

export function ScreenDesigner({
  entity,
  onApply,
}: {
  entity?: CreationEntityInput;
  onApply: (layout: DesignedScreenLayout) => void;
}) {
  const initialLayout = useMemo(() => createInitialScreenLayout(entity), [entity]);
  const [layout, setLayout] = useState<DesignedScreenLayout>(initialLayout);
  const [selectedField, setSelectedField] = useState<DesignedScreenField | undefined>(layout.sections[0]?.fields[0]);
  const [device, setDevice] = useState<PreviewDevice>('Desktop');

  function applyAutoDesign() {
    const nextLayout = autoDesignLayout(entity);
    setLayout(nextLayout);
    setSelectedField(nextLayout.sections[0]?.fields[0]);
    onApply(nextLayout);
  }

  function handleComponentSelect(component: ScreenComponentType) {
    if (component === 'Section') {
      setLayout((current) => ({
        ...current,
        sections: [
          ...current.sections,
          {
            id: `section-${current.sections.length + 1}`,
            title: `Section ${current.sections.length + 1}`,
            columns: 2,
            fields: [],
          },
        ],
      }));
    }
  }

  function updateField(nextField: DesignedScreenField) {
    setSelectedField(nextField);
    setLayout((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => (field.id === nextField.id ? nextField : field)),
      })),
    }));
  }

  function moveField(fieldId: string, direction: 'UP' | 'DOWN') {
    setLayout((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        const index = section.fields.findIndex((field) => field.id === fieldId);

        if (index < 0) {
          return section;
        }

        const nextIndex = direction === 'UP' ? Math.max(0, index - 1) : Math.min(section.fields.length - 1, index + 1);
        const fields = [...section.fields];
        const [field] = fields.splice(index, 1);
        fields.splice(nextIndex, 0, field);
        return { ...section, fields };
      }),
    }));
  }

  return (
    <StudioPanel title="Screen Design">
      <div className="studio-section-header">
        <div>
          <h3>{layout.screen}</h3>
          <p className="studio-muted">Susun screen, atur komponen, dan lihat preview sebelum launch.</p>
        </div>
        <div className="studio-action-row">
          <StudioButton variant="secondary" onClick={applyAutoDesign} tooltip="Susun otomatis: name di atas, deskripsi besar, number/date dikelompokkan, status disorot.">
            Auto Design
          </StudioButton>
          <StudioButton onClick={() => onApply(layout)} tooltip="Gunakan layout screen ini untuk generated FORM dan UI composition.">
            Use This Design
          </StudioButton>
        </div>
      </div>
      <div className="studio-screen-designer-grid">
        <ComponentPalette onSelect={handleComponentSelect} />
        <Canvas layout={layout} selectedFieldId={selectedField?.id} onSelectField={setSelectedField} onMoveField={moveField} />
        <PropertyPanel field={selectedField} onChange={updateField} />
      </div>
      <PreviewPanel layout={layout} device={device} onDeviceChange={setDevice} />
    </StudioPanel>
  );
}
