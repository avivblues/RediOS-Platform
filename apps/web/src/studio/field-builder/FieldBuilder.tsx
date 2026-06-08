import { useState } from 'react';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import type { CreationEntityInput, CreationFieldInput, CreationFieldType } from '../create/creation-types';

const fieldTypes: CreationFieldType[] = [
  'Text',
  'Long Text',
  'Number',
  'Money',
  'Date',
  'Date Time',
  'Boolean',
  'Lookup',
  'Attachment',
  'User',
];

export function FieldBuilder({
  entities,
  onAddField,
}: {
  entities: CreationEntityInput[];
  onAddField: (field: CreationFieldInput) => void;
}) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<CreationFieldType>('Text');
  const [required, setRequired] = useState(false);
  const [unique, setUnique] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [helpText, setHelpText] = useState('');
  const [relatedObject, setRelatedObject] = useState('');
  const [displayField, setDisplayField] = useState('');
  const relatedEntity = entities.find((entity) => entity.name === relatedObject);

  function addField() {
    if (!label.trim()) {
      return;
    }

    onAddField({
      label,
      type,
      required,
      unique,
      defaultValue,
      helpText,
      relatedObject: type === 'Lookup' ? relatedObject : undefined,
      displayField: type === 'Lookup' ? displayField : undefined,
    });
    setLabel('');
    setDefaultValue('');
    setHelpText('');
    setRelatedObject('');
    setDisplayField('');
    setRequired(false);
    setUnique(false);
  }

  return (
    <div className="studio-card">
      <h4>Add Field</h4>
      <Input value={label} placeholder="Field label" onChange={setLabel} />
      <Select value={type} options={fieldTypes} onChange={(value) => setType(value as CreationFieldType)} />
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
      {type === 'Lookup' ? (
        <>
          <Select value={relatedObject} options={['', ...entities.map((entity) => entity.name)]} onChange={setRelatedObject} />
          <Select value={displayField} options={['', ...(relatedEntity?.fields.map((field) => field.label) ?? [])]} onChange={setDisplayField} />
        </>
      ) : null}
      <Button onClick={addField} disabled={!label.trim()}>
        Add Field
      </Button>
    </div>
  );
}
