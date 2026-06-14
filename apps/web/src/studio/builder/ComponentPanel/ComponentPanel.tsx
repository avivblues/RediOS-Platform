import { useMemo, useState } from 'react';
import { atomComponents } from '../../atomic/atoms/catalog';
import { moleculeComponents } from '../../atomic/molecules/catalog';
import { organismComponents } from '../../atomic/organisms/catalog';
import { customOrganismsAsComponents } from '../../metadata/metadata-store';
import { HelpTip } from '../../guide/AdminGuide';
import type { BuilderComponentDefinition, StudioTarget } from '../types';

const REDIOS_COMPONENT_MIME = 'application/x-redios-component';

const androidComponents: BuilderComponentDefinition[] = [
  { type: 'Camera', label: 'Camera', layer: 'ANDROID' },
  { type: 'GPS', label: 'GPS', layer: 'ANDROID' },
  { type: 'Barcode', label: 'Barcode', layer: 'ANDROID' },
  { type: 'OfflineStorage', label: 'Offline Storage', layer: 'ANDROID' },
  { type: 'PushNotification', label: 'Push Notification', layer: 'ANDROID' },
];

export function ComponentPanel({
  applicationCode,
  target,
  onAdd,
}: {
  applicationCode: string;
  target: StudioTarget;
  onAdd: (component: BuilderComponentDefinition) => void;
}) {
  const customOrganisms = useMemo(() => customOrganismsAsComponents(applicationCode), [applicationCode]);
  const [activeCatalog, setActiveCatalog] = useState<'Fields' | 'Static' | 'Structure'>('Fields');
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const fieldComponents = useMemo(() => [
    ...atomComponents.filter((component) => !['Button', 'Icon', 'Paragraph', 'Image', 'Link'].includes(component.type)),
    ...moleculeComponents,
    ...(target === 'android' ? androidComponents : []),
  ], [target]);
  const staticComponents = useMemo(() => [
    ...atomComponents.filter((component) => ['Paragraph', 'Image', 'Link', 'Icon'].includes(component.type)),
    ...organismComponents.filter((component) => ['FormHeading', 'SectionHeading', 'Subheading', 'Divider', 'Spacer'].includes(component.type)),
  ], []);
  const structureComponents = useMemo(() => [
    ...atomComponents.filter((component) => component.type === 'Button'),
    ...organismComponents.filter((component) => !['FormHeading', 'SectionHeading', 'Subheading', 'Divider', 'Spacer'].includes(component.type)),
    ...customOrganisms,
  ], [customOrganisms]);
  const customStructureGroups = useMemo(() => [
    {
      description: 'Single controls and static atoms',
      title: 'Atoms',
      components: atomComponents.filter((component) => activeCatalog === 'Fields'
        ? !['Button', 'Icon', 'Paragraph', 'Image', 'Link'].includes(component.type)
        : activeCatalog === 'Static'
          ? ['Icon', 'Paragraph', 'Image', 'Link'].includes(component.type)
          : ['Button'].includes(component.type)),
    },
    {
      description: 'Field groups, uploads, choices, and date inputs',
      title: 'Molecules',
      components: activeCatalog === 'Fields' ? moleculeComponents : [],
    },
    {
      description: 'Containers, tables, modals, headings, and layout blocks',
      title: 'Organisms',
      components: organismComponents.filter((component) => activeCatalog === 'Static'
        ? ['FormHeading', 'SectionHeading', 'Subheading', 'Divider', 'Spacer'].includes(component.type)
        : activeCatalog === 'Structure'
          ? !['FormHeading', 'SectionHeading', 'Subheading', 'Divider', 'Spacer'].includes(component.type)
          : false),
    },
    {
      description: 'Reusable organisms created in Advanced Mode',
      title: 'Custom Organisms',
      components: activeCatalog === 'Structure' ? customOrganisms : [],
    },
    {
      description: 'Mobile runtime capabilities',
      title: 'Android',
      components: activeCatalog === 'Fields' && target === 'android' ? androidComponents : [],
    },
  ].map((group) => ({
    ...group,
    components: normalizedSearch
      ? group.components.filter((component) => [
        component.label,
        component.type,
        component.description,
        component.layer,
      ].filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch))
      : group.components,
  })).filter((group) => group.components.length > 0), [activeCatalog, customOrganisms, normalizedSearch, target]);

  return (
    <div className="redos-panel-content">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Toolbox</span>
        <h3>Components <HelpTip label="Components" text="Komponen adalah bagian layar seperti input, dropdown, tombol, tabel, dan custom organism." /></h3>
        <p className="redos-muted">Drag atau klik component untuk menambahkannya ke screen.</p>
      </div>
      <label className="redos-component-search">
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="Search components"
          placeholder="Search elements"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </label>
      <div className="redos-toolbox-tabs" aria-label="Component catalog">
        {(['Fields', 'Static', 'Structure'] as const).map((catalog) => (
          <button
            key={catalog}
            className={activeCatalog === catalog ? 'redos-toolbox-tab-active' : ''}
            type="button"
            onClick={() => setActiveCatalog(catalog)}
          >
            {catalog}
          </button>
        ))}
      </div>
      {customStructureGroups.map((group) => (
        <ComponentGroup
          key={group.title}
          description={group.description}
          title={group.title}
          components={group.components}
          onAdd={onAdd}
        />
      ))}
      {customStructureGroups.length === 0 ? (
        <p className="redos-component-empty">No components match “{searchQuery}”.</p>
      ) : null}
    </div>
  );
}

function ComponentGroup({
  description,
  title,
  components,
  onAdd,
}: {
  description: string;
  title: string;
  components: BuilderComponentDefinition[];
  onAdd: (component: BuilderComponentDefinition) => void;
}) {
  return (
    <section className="redos-component-group">
      <header>
        <strong>{title}</strong>
        <span>{description}</span>
      </header>
      {components.map((component) => (
        <button
          key={component.type}
          className="redos-tool-button"
          draggable
          type="button"
          onClick={() => onAdd(component)}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'copy';
            event.dataTransfer.setData(REDIOS_COMPONENT_MIME, JSON.stringify(component));
            event.currentTarget.classList.add('redos-tool-button-dragging');
          }}
          onDragEnd={(event) => {
            event.currentTarget.classList.remove('redos-tool-button-dragging');
          }}
          data-redos-tooltip={`Drag atau klik untuk menambahkan ${component.label} ke screen.`}
          title={`Drag or click to add ${component.label}`}
        >
          <span aria-hidden="true">{componentIcon(component.type)}</span>
          <span>
            <strong>{component.label}</strong>
            <small>{component.description ?? component.layer}</small>
          </span>
        </button>
      ))}
    </section>
  );
}

function componentIcon(type: string) {
  const iconMap: Record<string, string> = {
    Barcode: '▥',
    Button: '●',
    Camera: '▣',
    Captcha: '✓',
    Checkbox: '☑',
    ConfirmModal: '!',
    DataTable: '▤',
    DateInput: '◷',
    DateRange: '↔',
    DateTimeInput: '◴',
    DecisionBox: '☑',
    Divider: '─',
    Dropdown: '▾',
    EmailInput: '@',
    Form: '□',
    FormHeading: 'H1',
    GPS: '⌖',
    Grid: '▦',
    Group: '▰',
    Icon: '◆',
    Image: '▧',
    ImageUpload: '▧',
    InputTable: '▦',
    Link: '↗',
    LocationInput: '⌖',
    MatrixTable: '▦',
    Modal: '▣',
    MultiFileUpload: '▥',
    MultiImageUpload: '▧',
    MultipleChoice: '☷',
    MultipleChoiceMatrix: '▦',
    NumberInput: '123',
    OfflineStorage: '▣',
    Pages: '▱',
    Paragraph: '¶',
    PasswordInput: '🔒',
    PhoneInput: '☎',
    PushNotification: '•',
    RangeSlider: '⇄',
    Search: '⌕',
    SectionHeading: 'H2',
    Signature: '✎',
    SingleChoice: '◉',
    SingleChoiceMatrix: '▦',
    Slider: '─',
    Spacer: '↕',
    Subheading: 'H3',
    Submit: '✓',
    Table: '▤',
    Tags: '◇',
    TextArea: '☰',
    TextEditor: 'I',
    TextInput: 'Aa',
    TimeInput: '◷',
    ToggleSwitch: '◉',
    UploadField: '▥',
    UrlInput: '↗',
    WorkflowPanel: '↬',
  };

  return iconMap[type] ?? '□';
}
