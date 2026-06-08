import { useState } from 'react';
import { Input, Select } from '../../components/atomic/atoms/Atoms';
import { StudioButton, StudioCard, StudioEmptyState } from '../design-system/StudioDesignSystem';
import type { CreationEntityInput, CreationFieldInput, CreationFieldType } from '../create/creation-types';
import { term, terminologyMode } from '../terminology/terminology.service';

const fieldTypes: CreationFieldType[] = ['Text', 'Number', 'Money', 'Date', 'Lookup', 'Attachment', 'User'];

export function FieldBuilder({
  entities,
  objectName,
  onAddField,
  expertMode = false,
}: {
  entities: CreationEntityInput[];
  objectName: string;
  onAddField: (field: CreationFieldInput) => void;
  expertMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<CreationFieldType>('Text');
  const [required, setRequired] = useState(false);
  const [unique, setUnique] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [helpText, setHelpText] = useState('');
  const [relatedObject, setRelatedObject] = useState('');
  const [displayField, setDisplayField] = useState('');
  const relatedObjectOptions = entities.map((entity) => entity.name);
  const relatedEntity = entities.find((entity) => entity.name === relatedObject);
  const displayFieldOptions = relatedEntity?.fields.map((field) => field.label) ?? [];
  const mode = terminologyMode(expertMode);
  const informationLabel = term('FIELD', mode);
  const objectLabel = term('ENTITY', mode);

  function addField() {
    if (!label.trim()) {
      return;
    }

    const resolvedRelatedObject = relatedObject || relatedObjectOptions[0];
    const resolvedDisplayField = displayField || displayFieldOptions[0];

    onAddField({
      label,
      type,
      required,
      unique,
      defaultValue,
      helpText,
      relatedObject: type === 'Lookup' ? resolvedRelatedObject : undefined,
      displayField: type === 'Lookup' ? resolvedDisplayField : undefined,
    });
    setLabel('');
    setDefaultValue('');
    setHelpText('');
    setRelatedObject('');
    setDisplayField('');
    setRequired(false);
    setUnique(false);
    setOpen(false);
  }

  return (
    <StudioCard>
      <div className="studio-section-header">
        <div>
          <h4>{objectName} {informationLabel}</h4>
          <p className="studio-muted">Add details users will see on screens and lists.</p>
        </div>
        <StudioButton onClick={() => setOpen(true)}>+ Add {informationLabel}</StudioButton>
      </div>
      {!open ? (
        <StudioEmptyState title={`No ${informationLabel.toLowerCase()} dialog open`} description={`Click Add ${informationLabel} to define a name, type, and advanced options.`} />
      ) : (
        <div className="studio-field-dialog">
          <h4>{informationLabel} Details</h4>
          <Input value={label} placeholder="Stock Quantity" onChange={setLabel} />
          <Select value={type} options={fieldTypes} onChange={(value) => setType(value as CreationFieldType)} />
          {type === 'Lookup' ? (
            relatedObjectOptions.length > 0 ? (
              <>
                <label className="studio-muted">Related {objectLabel}</label>
                <Select value={relatedObject || relatedObjectOptions[0]} options={relatedObjectOptions} onChange={setRelatedObject} />
                {displayFieldOptions.length > 0 ? (
                  <>
                    <label className="studio-muted">Display {informationLabel}</label>
                    <Select value={displayField || displayFieldOptions[0]} options={displayFieldOptions} onChange={setDisplayField} />
                  </>
                ) : (
                  <div className="studio-muted">Add information to the related {objectLabel.toLowerCase()} before choosing a display value.</div>
                )}
              </>
            ) : (
              <StudioEmptyState title={`No related ${objectLabel.toLowerCase()} yet`} description={`Create another ${objectLabel.toLowerCase()} before adding a lookup connection.`} />
            )
          ) : null}
          <details>
            <summary>Advanced</summary>
            <label className="studio-check-row">
              <input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} />
              Required
            </label>
            <label className="studio-check-row">
              <input type="checkbox" checked={unique} onChange={(event) => setUnique(event.target.checked)} />
              Unique
            </label>
            <Input value={defaultValue} placeholder="Default value" onChange={setDefaultValue} />
            <Input value={helpText} placeholder="Help text" onChange={setHelpText} />
          </details>
          <div className="studio-action-row">
            <StudioButton onClick={addField} disabled={!label.trim() || (type === 'Lookup' && relatedObjectOptions.length === 0)}>
              Save {informationLabel}
            </StudioButton>
            <StudioButton variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </StudioButton>
          </div>
        </div>
      )}
    </StudioCard>
  );
}
