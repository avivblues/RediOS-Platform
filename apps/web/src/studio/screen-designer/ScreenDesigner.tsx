import { useMemo, useState } from 'react';
import { StudioButton, StudioPanel } from '../design-system/StudioDesignSystem';
import { Input } from '../../components/atomic/atoms/Atoms';
import type { CreationEntityInput, CreationFieldInput } from '../create/creation-types';
import { autoDesignLayout, createInitialScreenLayout, toDesignedField, type DesignedScreenField, type DesignedScreenLayout, type PreviewDevice, type ScreenComponentType } from './screen-designer-types';
import { ComponentPalette } from './ComponentPalette';
import { Canvas } from './Canvas';
import { PropertyPanel } from './PropertyPanel';
import { PreviewPanel } from './PreviewPanel';

export function ScreenDesigner({
  entity,
  expertMode = false,
  onApply,
  onLayoutChange,
  onAddInformation,
}: {
  entity?: CreationEntityInput;
  expertMode?: boolean;
  onApply: (layout: DesignedScreenLayout) => void;
  onLayoutChange?: (layout: DesignedScreenLayout) => void;
  onAddInformation?: (field: CreationFieldInput, layout: DesignedScreenLayout) => void;
}) {
  const initialLayout = useMemo(() => createInitialScreenLayout(entity), [entity]);
  const [layout, setLayout] = useState<DesignedScreenLayout>(initialLayout);
  const [selectedField, setSelectedField] = useState<DesignedScreenField | undefined>(layout.sections[0]?.fields[0]);
  const [device, setDevice] = useState<PreviewDevice>('Desktop');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newField, setNewField] = useState<CreationFieldInput>({
    label: '',
    type: 'Text',
    required: false,
    unique: false,
    searchable: true,
    showInList: true,
  });
  const hasInformation = layout.sections.some((section) => section.fields.length > 0);

  function updateLayout(updater: (current: DesignedScreenLayout) => DesignedScreenLayout): DesignedScreenLayout {
    const nextLayout = updater(layout);
    setLayout(nextLayout);
    onLayoutChange?.(nextLayout);
    return nextLayout;
  }

  function applyAutoDesign() {
    const nextLayout = autoDesignLayout(entity);
    setLayout(nextLayout);
    setSelectedField(nextLayout.sections[0]?.fields[0]);
    onLayoutChange?.(nextLayout);
    onApply(nextLayout);
  }

  function handleComponentSelect(component: ScreenComponentType) {
    if (component === 'Section') {
      updateLayout((current) => ({
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
      return;
    }

    const preset = fieldPresetForComponent(component, layout.entityName);

    if (!preset) {
      return;
    }

    addFieldToCanvas(preset, !preset.designerOnly);
  }

  function updateField(nextField: DesignedScreenField) {
    setSelectedField(nextField);
    setDrawerOpen(true);
    updateLayout((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => (field.id === nextField.id ? nextField : field)),
      })),
    }));
  }

  function addInformationFromWizard() {
    if (!newField.label.trim()) {
      return;
    }

    const field: CreationFieldInput = {
      ...newField,
      label: newField.label.trim(),
    };
    addFieldToCanvas(field, true);
  }

  function addFieldToCanvas(field: CreationFieldInput, shouldCreateInformation: boolean) {
    const normalizedField = field.type === 'Lookup' && !field.relatedObject ? { ...field, relatedObject: layout.entityName } : field;
    const designedField = toDesignedField(normalizedField, layout.sections[0]?.fields.length ?? 0);
    const nextLayout: DesignedScreenLayout = {
      ...layout,
      sections: layout.sections.length > 0
        ? layout.sections.map((section, index) => index === 0 ? { ...section, fields: [...section.fields, designedField] } : section)
        : [{ id: 'basic', title: 'Basic Info', columns: 2, fields: [designedField] }],
    };

    setLayout(nextLayout);
    setSelectedField(designedField);
    setDrawerOpen(true);
    setWizardOpen(false);
    setNewField({ label: '', type: 'Text', required: false, unique: false, searchable: true, showInList: true });
    if (shouldCreateInformation) {
      onAddInformation?.(normalizedField, nextLayout);
    } else {
      onLayoutChange?.(nextLayout);
    }
  }

  function moveField(fieldId: string, direction: 'UP' | 'DOWN', targetSectionId?: string) {
    updateLayout((current) => ({
      ...current,
      sections: moveFieldAcrossSections(current.sections, fieldId, direction, targetSectionId),
    }));
  }

  function moveFieldAcrossSections(
    sections: DesignedScreenLayout['sections'],
    fieldId: string,
    direction: 'UP' | 'DOWN',
    targetSectionId?: string,
  ): DesignedScreenLayout['sections'] {
    const sourceSection = sections.find((section) => section.fields.some((field) => field.id === fieldId));
    const field = sourceSection?.fields.find((candidate) => candidate.id === fieldId);

    if (!sourceSection || !field) {
      return sections;
    }

    if (targetSectionId && targetSectionId !== sourceSection.id) {
      return sections.map((section) => {
        if (section.id === sourceSection.id) {
          return { ...section, fields: section.fields.filter((candidate) => candidate.id !== fieldId) };
        }

        if (section.id === targetSectionId) {
          return { ...section, fields: [...section.fields, field] };
        }

        return section;
      });
    }

    return sections.map((section) => {
        const index = section.fields.findIndex((field) => field.id === fieldId);

        if (index < 0) {
          return section;
        }

        const nextIndex = direction === 'UP' ? Math.max(0, index - 1) : Math.min(section.fields.length - 1, index + 1);
        const fields = [...section.fields];
        const [field] = fields.splice(index, 1);
        fields.splice(nextIndex, 0, field);
        return { ...section, fields };
      });
  }

  return (
    <StudioPanel title="Screen Design">
      <div className="studio-section-header studio-screen-designer-header">
        <div>
          <h3>{layout.screen}</h3>
          <p className="studio-muted">Tambah informasi, susun screen, dan lihat preview sebelum launch.</p>
        </div>
        <div className="studio-action-row">
          <StudioButton onClick={() => setWizardOpen(true)} tooltip="Tambah informasi dan langsung tampilkan di screen.">
            + Add Information
          </StudioButton>
          <StudioButton variant="secondary" onClick={applyAutoDesign} tooltip="Susun otomatis: name di atas, deskripsi besar, number/date dikelompokkan, status disorot.">
            Auto Design
          </StudioButton>
          <StudioButton
            variant="secondary"
            onClick={() => onApply(layout)}
            disabled={!hasInformation}
            tooltip={expertMode ? 'Use this layout for generated FORM and UI composition metadata.' : 'Gunakan desain screen ini untuk preview dan launch aplikasi.'}
          >
            Use This Design
          </StudioButton>
        </div>
      </div>
      <div className="studio-screen-builder-shell">
        <ComponentPalette expertMode={expertMode} onSelect={handleComponentSelect} onAddInformation={() => setWizardOpen(true)} />
        <Canvas
          layout={layout}
          selectedFieldId={selectedField?.id}
          onAddInformation={() => setWizardOpen(true)}
          onSelectField={(field) => {
            setSelectedField(field);
            setDrawerOpen(true);
          }}
          onMoveField={moveField}
        />
        <PreviewPanel layout={layout} device="Mobile" onDeviceChange={() => undefined} compact />
      </div>
      <PropertyPanel field={selectedField} entityName={layout.entityName} open={drawerOpen} expertMode={expertMode} onClose={() => setDrawerOpen(false)} onChange={updateField} />
      {wizardOpen ? (
        <section className="studio-card studio-field-wizard" aria-label="Add information wizard">
          <div className="studio-section-header">
            <div>
              <span className="studio-kicker">Add Information</span>
              <h4>What do you want to add?</h4>
              <p className="studio-muted">Examples: Product Name, Price, Quantity, Customer Email.</p>
            </div>
          </div>
          <label className="studio-form-field">
            Name
            <Input value={newField.label} placeholder="Stock Quantity" onChange={(label) => setNewField((current) => ({ ...current, label }))} />
          </label>
          <div className="studio-field-type-grid">
            {(['Text', 'Number', 'Date', 'Dropdown', 'Link Data', 'File'] as const).map((type) => (
              <label key={type} className="studio-check-row">
                <input
                  type="radio"
                  checked={fieldTypeLabel(newField) === type}
                  onChange={() => setNewField((current) => ({ ...current, ...fieldPresetFromWizard(type) }))}
                />
                {type}
              </label>
            ))}
          </div>
          <div className="studio-card-grid">
            <label className="studio-check-row">
              <input type="checkbox" checked={newField.required} onChange={(event) => setNewField((current) => ({ ...current, required: event.target.checked }))} />
              Required
            </label>
            <label className="studio-check-row">
              <input type="checkbox" checked={Boolean(newField.searchable)} onChange={(event) => setNewField((current) => ({ ...current, searchable: event.target.checked }))} />
              Searchable
            </label>
            <label className="studio-check-row">
              <input type="checkbox" checked={Boolean(newField.showInList)} onChange={(event) => setNewField((current) => ({ ...current, showInList: event.target.checked }))} />
              Show in List
            </label>
          </div>
          <div className="studio-action-row">
            <StudioButton onClick={addInformationFromWizard} disabled={!newField.label.trim()} tooltip="Tambah informasi dan langsung tampilkan di screen.">CREATE</StudioButton>
            <StudioButton variant="secondary" onClick={() => setWizardOpen(false)} tooltip="Tutup wizard tanpa menambahkan informasi.">Cancel</StudioButton>
          </div>
        </section>
      ) : null}
      <PreviewPanel layout={layout} device={device} onDeviceChange={setDevice} />
    </StudioPanel>
  );
}

function fieldPresetForComponent(component: ScreenComponentType, entityName: string): CreationFieldInput | undefined {
  if (component === 'Text Input') {
    return baseField('Text Input', 'Text', 'Information');
  }

  if (component === 'Number') {
    return baseField('Number', 'Number', 'Information');
  }

  if (component === 'Date') {
    return baseField('Date', 'Date', 'Information');
  }

  if (component === 'Dropdown') {
    return {
      ...baseField('Dropdown', 'Text', 'Dropdown'),
      choiceOptions: ['Option 1', 'Option 2'],
    };
  }

  if (component === 'Table') {
    return {
      ...baseField('Linked Data', 'Lookup', 'Link Data'),
      relatedObject: entityName,
    };
  }

  if (component === 'Button') {
    return {
      ...baseField(`Save ${entityName}`, 'Boolean', 'Button'),
      designerOnly: true,
      showInList: false,
      searchable: false,
      actionType: 'Save',
    };
  }

  return undefined;
}

function baseField(label: string, type: CreationFieldInput['type'], componentKind: CreationFieldInput['componentKind']): CreationFieldInput {
  return {
    label,
    type,
    componentKind,
    required: false,
    unique: false,
    searchable: true,
    showInList: true,
  };
}

function fieldPresetFromWizard(type: 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Link Data' | 'File'): Partial<CreationFieldInput> {
  if (type === 'Dropdown') {
    return { type: 'Text', componentKind: 'Dropdown', choiceOptions: ['Option 1', 'Option 2'] };
  }

  if (type === 'Link Data') {
    return { type: 'Lookup', componentKind: 'Link Data' };
  }

  if (type === 'File') {
    return { type: 'Attachment', componentKind: 'File' };
  }

  return { type, componentKind: 'Information' };
}

function fieldTypeLabel(field: CreationFieldInput): 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Link Data' | 'File' {
  if (field.componentKind === 'Dropdown') {
    return 'Dropdown';
  }

  if (field.componentKind === 'Link Data' || field.type === 'Lookup') {
    return 'Link Data';
  }

  if (field.type === 'Attachment') {
    return 'File';
  }

  if (field.type === 'Date' || field.type === 'Date Time') {
    return 'Date';
  }

  if (field.type === 'Number' || field.type === 'Money') {
    return 'Number';
  }

  return 'Text';
}
