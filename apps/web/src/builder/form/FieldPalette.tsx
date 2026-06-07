import type { EntityDefinition } from '@redios/shared';
import { Badge } from '../../components/atomic/atoms/Atoms';
import type { RuntimeForm } from '../../core/renderer/runtime-types';

export function FieldPalette({
  entity,
  form,
  selectedFieldCode,
  onSelect,
}: {
  entity?: EntityDefinition;
  form?: RuntimeForm;
  selectedFieldCode?: string;
  onSelect: (fieldCode: string) => void;
}) {
  const usedFields = new Set(form?.sections.flatMap((section) => section.fields.map((field) => field.fieldCode)) ?? []);

  if (!entity) {
    return <div className="studio-empty">Select an entity or form to load fields.</div>;
  }

  return (
    <div className="studio-card">
      <h4>Field Palette</h4>
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
          <span>{fieldCode}</span>
          {usedFields.has(fieldCode) ? <Badge>on form</Badge> : null}
        </button>
      ))}
    </div>
  );
}
