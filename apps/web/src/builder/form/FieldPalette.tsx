import type { EntityDefinition } from '@redios/shared';
import { Badge, Select } from '../../components/atomic/atoms/Atoms';
import type { RuntimeForm } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio/empty/EmptyState';
import { HelpTooltip } from '../../studio/help/HelpTooltip';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';

const componentOptions = ['TEXT_INPUT', 'NUMBER_INPUT', 'DATE_PICKER', 'LOOKUP', 'TEXT_AREA', 'SELECT'];

export function FieldPalette({
  entity,
  form,
  selectedFieldCode,
  selectedComponent,
  expertMode,
  onSelect,
  onComponentChange,
}: {
  entity?: EntityDefinition;
  form?: RuntimeForm;
  selectedFieldCode?: string;
  selectedComponent: string;
  expertMode: boolean;
  onSelect: (fieldCode: string) => void;
  onComponentChange: (component: string) => void;
}) {
  const usedFields = new Set(form?.sections.flatMap((section) => section.fields.map((field) => field.fieldCode)) ?? []);

  if (!entity) {
    return (
      <EmptyState
        title="No Data Object selected yet"
        description="Choose a Data Object or Input Screen to load available information."
      />
    );
  }

  return (
    <div className="studio-card">
      <h4>
        Data Object
        <HelpTooltip label="Data Object">A Data Object is the thing your business manages, like Product, Asset, or Customer.</HelpTooltip>
      </h4>
      <div className="studio-muted">
        {humanizeCode(entity.code)}
        {expertMode ? ` | Technical Code: ${entity.code}` : ''}
      </div>
      <h4>
        How should it appear?
        <HelpTooltip label="Component">Choose the control users will see, such as text, number, date, or lookup.</HelpTooltip>
      </h4>
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
      <h4>
        Available Information
        <HelpTooltip label="Information">Information is a detail stored inside the Data Object, such as Name, Price, or Status.</HelpTooltip>
      </h4>
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
          {expertMode ? <span className="studio-muted">{fieldCode}</span> : null}
          {usedFields.has(fieldCode) ? <Badge>on screen</Badge> : null}
        </button>
      ))}
    </div>
  );
}
