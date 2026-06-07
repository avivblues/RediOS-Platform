import type { EntityDefinition } from '@redios/shared';
import { Badge, Select } from '../../components/atomic/atoms/Atoms';
import type { RuntimeForm } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio/empty/EmptyState';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';

const componentOptions = ['TEXT_INPUT', 'NUMBER_INPUT', 'DATE_PICKER', 'LOOKUP', 'TEXT_AREA', 'SELECT'];

export function FieldPalette({
  entity,
  form,
  selectedFieldCode,
  selectedComponent,
  onSelect,
  onComponentChange,
}: {
  entity?: EntityDefinition;
  form?: RuntimeForm;
  selectedFieldCode?: string;
  selectedComponent: string;
  onSelect: (fieldCode: string) => void;
  onComponentChange: (component: string) => void;
}) {
  const usedFields = new Set(form?.sections.flatMap((section) => section.fields.map((field) => field.fieldCode)) ?? []);

  if (!entity) {
    return (
      <EmptyState
        title="No data model selected yet"
        description="Choose an entity or form to load available fields."
      />
    );
  }

  return (
    <div className="studio-card">
      <h4>Fields</h4>
      <div className="studio-component-palette">
        {componentOptions.slice(0, 4).map((component) => (
          <button
            key={component}
            className={selectedComponent === component ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'}
            onClick={() => onComponentChange(component)}
          >
            {humanizeCode(component)}
          </button>
        ))}
      </div>
      <Select value={selectedComponent} options={componentOptions} onChange={onComponentChange} />
      {entity.fieldCodes.map((fieldCode) => (
        <button
          key={fieldCode}
          className={selectedFieldCode === fieldCode ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('application/redios-field', fieldCode);
            onSelect(fieldCode);
          }}
          onClick={() => onSelect(fieldCode)}
        >
          <span>{humanizeCode(fieldCode)}</span>
          {usedFields.has(fieldCode) ? <Badge>on form</Badge> : null}
        </button>
      ))}
    </div>
  );
}
