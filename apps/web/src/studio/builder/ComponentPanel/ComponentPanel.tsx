import { useMemo, useState } from 'react';
import { atomComponents } from '../../atomic/atoms/catalog';
import { moleculeComponents } from '../../atomic/molecules/catalog';
import { organismComponents } from '../../atomic/organisms/catalog';
import { customOrganismsAsComponents } from '../../metadata/metadata-store';
import { HelpTip } from '../../guide/AdminGuide';
import type { BuilderComponentCategory, BuilderComponentDefinition, StudioTarget } from '../types';

const REDIOS_COMPONENT_MIME = 'application/x-redios-component';
const toolboxCategories: BuilderComponentCategory[] = [
  'Fields',
  'Static',
  'Layout',
  'Data Display',
  'Dashboard',
  'Charts',
  'Navigation',
  'Feedback',
  'Media',
  'Advanced',
  'Page Templates',
];

const androidComponents: BuilderComponentDefinition[] = [
  { type: 'Camera', label: 'Camera', layer: 'ANDROID', category: 'Advanced' },
  { type: 'GPS', label: 'GPS', layer: 'ANDROID', category: 'Advanced' },
  { type: 'Barcode', label: 'Barcode', layer: 'ANDROID', category: 'Advanced' },
  { type: 'OfflineStorage', label: 'Offline Storage', layer: 'ANDROID', category: 'Advanced' },
  { type: 'PushNotification', label: 'Push Notification', layer: 'ANDROID', category: 'Advanced' },
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
  const [activeCatalog, setActiveCatalog] = useState<BuilderComponentCategory>('Fields');
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const customStructureGroups = useMemo(() => {
    const allComponents = [
      ...atomComponents,
      ...moleculeComponents,
      ...organismComponents,
      ...(target === 'android' ? androidComponents : []),
      ...customOrganisms.map((component) => ({ ...component, category: 'Advanced' as const })),
    ];

    return [
    {
      description: 'Single controls, static atoms, and template atoms',
      title: 'Atoms',
      components: allComponents.filter((component) => component.layer === 'ATOM' && componentCategory(component) === activeCatalog),
    },
    {
      description: 'Field groups, navigation pieces, uploads, and template molecules',
      title: 'Molecules',
      components: allComponents.filter((component) => component.layer === 'MOLECULE' && componentCategory(component) === activeCatalog),
    },
    {
      description: 'Containers, tables, dashboard blocks, pages, and imported organisms',
      title: 'Organisms',
      components: allComponents.filter((component) => component.layer === 'ORGANISM' && componentCategory(component) === activeCatalog),
    },
    {
      description: 'Reusable organisms created in Advanced Mode',
      title: 'Custom Organisms',
      components: allComponents.filter((component) => component.layer !== 'ATOM' && component.layer !== 'MOLECULE' && component.layer !== 'ORGANISM' && componentCategory(component) === activeCatalog),
    },
    {
      description: 'Mobile runtime capabilities',
      title: 'Android',
      components: target === 'android' ? allComponents.filter((component) => component.layer === 'ANDROID' && componentCategory(component) === activeCatalog) : [],
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
  })).filter((group) => group.components.length > 0);
  }, [activeCatalog, customOrganisms, normalizedSearch, target]);

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
        {toolboxCategories.map((catalog) => (
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

function componentCategory(component: BuilderComponentDefinition): BuilderComponentCategory {
  if (component.category) {
    return component.category;
  }

  if (['Paragraph', 'Image', 'Link', 'Icon', 'FormHeading', 'SectionHeading', 'Subheading', 'Divider', 'Spacer'].includes(component.type)) {
    return 'Static';
  }

  if (['Form', 'Pages', 'Group', 'Grid', 'Modal', 'ConfirmModal', 'Submit', 'Button'].includes(component.type)) {
    return 'Layout';
  }

  if (['Table', 'DataTable', 'InputTable', 'MatrixTable'].includes(component.type)) {
    return 'Data Display';
  }

  if (['Dashboard', 'WorkflowPanel', 'Timeline', 'Captcha'].includes(component.type)) {
    return 'Advanced';
  }

  return 'Fields';
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
