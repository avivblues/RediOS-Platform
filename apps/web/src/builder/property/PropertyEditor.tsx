import { Input, Select } from '../../components/atomic/atoms/Atoms';
import { PropertyRow } from '../../components/atomic/molecules/Molecules';

export function PropertyEditor({
  node,
  onChange,
}: {
  node?: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  if (!node) {
    return <div className="studio-empty">Select metadata to edit properties.</div>;
  }

  return (
    <div>
      {Object.entries(node).map(([key, value]) => (
        <PropertyRow key={key} name={key}>
          <PropertyValueEditor
            value={value}
            onChange={(nextValue) =>
              onChange({
                ...node,
                [key]: nextValue,
              })
            }
          />
        </PropertyRow>
      ))}
    </div>
  );
}

function PropertyValueEditor({ value, onChange }: { value: unknown; onChange: (value: unknown) => void }) {
  if (typeof value === 'boolean') {
    return <Select value={String(value)} options={['true', 'false']} onChange={(next) => onChange(next === 'true')} />;
  }

  if (typeof value === 'number') {
    return <Input type="number" value={String(value)} onChange={(next) => onChange(Number(next))} />;
  }

  if (typeof value === 'string') {
    return <Input value={value} onChange={onChange} />;
  }

  return <textarea className="studio-input" value={JSON.stringify(value ?? {}, null, 2)} onChange={(event) => onChange(parseObject(event.target.value))} />;
}

function parseObject(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
