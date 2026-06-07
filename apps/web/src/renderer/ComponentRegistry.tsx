import type { ReactNode } from 'react';
import { Badge, Button, Input, Label, Select } from '../components/atomic/atoms/Atoms';

export type StudioRenderer = (props: { label?: string; children?: ReactNode }) => ReactNode;

export const componentRegistry: Record<string, StudioRenderer> = {
  BUTTON: ({ label }) => <Button>{label ?? 'Button'}</Button>,
  TEXT_INPUT: ({ label }) => <Input value="" placeholder={label ?? 'Text'} onChange={() => undefined} />,
  TEXT_AREA: ({ label }) => <textarea className="studio-input" placeholder={label ?? 'Text area'} />,
  TEXTAREA: ({ label }) => <textarea className="studio-input" placeholder={label ?? 'Text area'} />,
  NUMBER_INPUT: ({ label }) => <Input value="" type="number" placeholder={label ?? 'Number'} onChange={() => undefined} />,
  DATE_PICKER: ({ label }) => <Input value="" type="date" placeholder={label ?? 'Date'} onChange={() => undefined} />,
  SELECT: () => <Select value="" options={['']} onChange={() => undefined} />,
  LOOKUP: ({ label }) => <Input value="" placeholder={label ?? 'Lookup'} onChange={() => undefined} />,
  BADGE: ({ label }) => <Badge>{label ?? 'Badge'}</Badge>,
  LABEL: ({ label }) => <Label>{label ?? 'Label'}</Label>,
  CARD: ({ children }) => <div className="studio-card">{children}</div>,
  TABLE: ({ children }) => <div className="studio-card">{children ?? 'Table'}</div>,
  FORM_FIELD: ({ children }) => <div className="studio-form-field">{children}</div>,
  ACTION_BAR: ({ children }) => <div className="studio-action-row">{children}</div>,
  DETAIL_CARD: ({ children }) => <div className="studio-card">{children}</div>,
  TIMELINE: () => <div className="studio-card">Timeline</div>,
};

export function renderRegisteredComponent(component: string, label?: string, children?: ReactNode): ReactNode {
  const Renderer = componentRegistry[component] ?? ((props: { children?: ReactNode }) => <div className="studio-card">{props.children ?? component}</div>);
  return <Renderer label={label}>{children}</Renderer>;
}
