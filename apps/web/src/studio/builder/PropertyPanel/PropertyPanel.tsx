import { useMemo, useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import { loadActions } from '../../metadata/metadata-store';
import type { BuilderDataObject, CanvasComponent } from '../types';

type BuilderTheme = 'Light' | 'Mint' | 'Dark';
type RightPanelTab = 'Settings' | 'Theme' | 'Export';
type ThemePropertyKind = 'color' | 'value';
type EventKey = keyof NonNullable<CanvasComponent['events']>;
interface ThemeProperty {
  label: string;
  value: string;
  unit?: string;
  swatch?: string;
}

type ThemePropertyValueMap = Record<string, string>;

const eventLabels: Record<EventKey, string> = {
  onBlur: 'On Blur',
  onChange: 'On Change',
  onClick: 'On Click',
  onFocus: 'On Focus',
  onLoad: 'On Load',
  onSubmit: 'On Submit',
};

const themePropertySections: Array<{ title: string; rows: ThemeProperty[] }> = [
  {
    title: 'Colors',
    rows: [
      { label: 'Primary', value: '#07bf9b', swatch: '#07bf9b' },
      { label: 'Primary darker', value: '#06ac8b', swatch: '#06ac8b' },
      { label: 'On primary', value: '#ffffff', swatch: '#ffffff' },
      { label: 'Danger text', value: '#ef4444', swatch: '#ef4444' },
      { label: 'Danger background', value: '#fee2e2', swatch: '#fee2e2' },
      { label: 'Success text', value: '#10b981', swatch: '#10b981' },
      { label: 'Success background', value: '#d1fae5', swatch: '#d1fae5' },
      { label: 'Gray 50', value: '#f9fafb', swatch: '#f9fafb' },
      { label: 'Gray 100', value: '#f3f4f6', swatch: '#f3f4f6' },
      { label: 'Gray 200', value: '#e5e7eb', swatch: '#e5e7eb' },
      { label: 'Gray 300', value: '#d1d5db', swatch: '#d1d5db' },
      { label: 'Gray 400', value: '#9ca3af', swatch: '#9ca3af' },
      { label: 'Gray 500', value: '#6b7280', swatch: '#6b7280' },
      { label: 'Gray 700', value: '#374151', swatch: '#374151' },
      { label: 'Dark 700', value: '#323232', swatch: '#323232' },
      { label: 'Dark 900', value: '#191919', swatch: '#191919' },
    ],
  },
  {
    title: 'Fonts',
    rows: [
      { label: 'Font family', value: 'Inter, system-ui' },
      { label: 'Font size', value: '16', unit: 'px' },
      { label: 'Line height', value: '24', unit: 'px' },
      { label: 'Letter spacing', value: '0', unit: 'px' },
      { label: 'Font size small', value: '14', unit: 'px' },
      { label: 'Line height small', value: '20', unit: 'px' },
      { label: 'Heading weight', value: '800' },
    ],
  },
  {
    title: 'General',
    rows: [
      { label: 'Gutter', value: '16', unit: 'px' },
      { label: 'Link color', value: 'Primary' },
      { label: 'Link decoration', value: 'inherit' },
      { label: 'Muted text color', value: 'Gray 500' },
      { label: 'Passive text color', value: 'Gray 700' },
      { label: 'Passive background', value: 'Gray 300' },
      { label: 'Selected background', value: '#1118270d', swatch: '#111827' },
      { label: 'Small radius', value: '4', unit: 'px' },
      { label: 'Handle shadow', value: '0 1px 2px rgba(0,0,0,.12)' },
    ],
  },
  {
    title: 'Input',
    rows: [
      { label: 'Height', value: '40', unit: 'px' },
      { label: 'Padding X', value: '12', unit: 'px' },
      { label: 'Background', value: '#ffffff', swatch: '#ffffff' },
      { label: 'Border color', value: '#d1d5db', swatch: '#d1d5db' },
      { label: 'Focus border', value: '#07bf9b', swatch: '#07bf9b' },
      { label: 'Placeholder color', value: 'Gray 400' },
      { label: 'Disabled opacity', value: '0.55' },
    ],
  },
  {
    title: 'Select',
    rows: [
      { label: 'Height', value: '40', unit: 'px' },
      { label: 'Caret color', value: 'Gray 500' },
      { label: 'Option background', value: '#ffffff', swatch: '#ffffff' },
      { label: 'Option hover', value: '#f3f4f6', swatch: '#f3f4f6' },
      { label: 'Selected color', value: 'Primary' },
    ],
  },
  {
    title: 'Tags',
    rows: [
      { label: 'Tag radius', value: '999', unit: 'px' },
      { label: 'Tag background', value: '#e0f2fe', swatch: '#e0f2fe' },
      { label: 'Tag text', value: '#0369a1', swatch: '#0369a1' },
      { label: 'Tag gap', value: '6', unit: 'px' },
    ],
  },
  {
    title: 'Signature',
    rows: [
      { label: 'Canvas height', value: '160', unit: 'px' },
      { label: 'Stroke color', value: '#111827', swatch: '#111827' },
      { label: 'Stroke width', value: '2', unit: 'px' },
      { label: 'Upload background', value: '#f9fafb', swatch: '#f9fafb' },
    ],
  },
  {
    title: 'Datepicker',
    rows: [
      { label: 'Popup background', value: '#ffffff', swatch: '#ffffff' },
      { label: 'Selected day', value: 'Primary' },
      { label: 'Today border', value: '#07bf9b', swatch: '#07bf9b' },
      { label: 'Range background', value: '#d1fae5', swatch: '#d1fae5' },
    ],
  },
  {
    title: 'Checkbox & radio',
    rows: [
      { label: 'Size', value: '16', unit: 'px' },
      { label: 'Border radius', value: '4', unit: 'px' },
      { label: 'Checked background', value: 'Primary' },
      { label: 'Checked mark', value: '#ffffff', swatch: '#ffffff' },
      { label: 'Label gap', value: '8', unit: 'px' },
    ],
  },
  {
    title: 'Table',
    rows: [
      { label: 'Header background', value: '#f9fafb', swatch: '#f9fafb' },
      { label: 'Border color', value: '#e5e7eb', swatch: '#e5e7eb' },
      { label: 'Cell padding', value: '10', unit: 'px' },
      { label: 'Row hover', value: '#f3f4f6', swatch: '#f3f4f6' },
      { label: 'Sticky header', value: 'enabled' },
    ],
  },
  {
    title: 'Slider',
    rows: [
      { label: 'Track height', value: '6', unit: 'px' },
      { label: 'Track background', value: '#e5e7eb', swatch: '#e5e7eb' },
      { label: 'Fill background', value: 'Primary' },
      { label: 'Thumb size', value: '18', unit: 'px' },
    ],
  },
  {
    title: 'Toggle',
    rows: [
      { label: 'Width', value: '42', unit: 'px' },
      { label: 'Height', value: '24', unit: 'px' },
      { label: 'On background', value: 'Primary' },
      { label: 'Off background', value: '#d1d5db', swatch: '#d1d5db' },
    ],
  },
  {
    title: 'Images',
    rows: [
      { label: 'Preview height', value: '128', unit: 'px' },
      { label: 'Object fit', value: 'cover' },
      { label: 'Dropzone background', value: '#eff6ff', swatch: '#eff6ff' },
      { label: 'Dropzone border', value: '#93c5fd', swatch: '#93c5fd' },
    ],
  },
  {
    title: 'Buttons',
    rows: [
      { label: 'Height', value: '40', unit: 'px' },
      { label: 'Padding X', value: '16', unit: 'px' },
      { label: 'Primary background', value: 'Primary' },
      { label: 'Primary text', value: '#ffffff', swatch: '#ffffff' },
      { label: 'Radius', value: '10', unit: 'px' },
      { label: 'Shadow', value: '0 10px 20px rgba(7,191,155,.18)' },
    ],
  },
  {
    title: 'Static',
    rows: [
      { label: 'Heading margin', value: '12', unit: 'px' },
      { label: 'Paragraph color', value: 'Muted text' },
      { label: 'Divider color', value: '#e5e7eb', swatch: '#e5e7eb' },
      { label: 'Spacer height', value: '32', unit: 'px' },
    ],
  },
];

export function PropertyPanel({
  components,
  dataObjects,
  selected,
  theme,
  onChange,
  onDelete,
  onThemeChange,
}: {
  components: CanvasComponent[];
  dataObjects: BuilderDataObject[];
  selected?: CanvasComponent;
  theme: BuilderTheme;
  onChange: (next: Partial<CanvasComponent>) => void;
  onDelete: () => void;
  onThemeChange: (theme: BuilderTheme) => void;
}) {
  const actionOptions = useMemo(() => ['None', ...loadActions().map((action) => action.label)], []);
  const [activeTab, setActiveTab] = useState<RightPanelTab>('Settings');

  if (!selected) {
    return (
      <aside className="redos-property-panel">
        <RightPanelTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="redos-right-panel-content">
          {activeTab === 'Settings' ? (
            <>
              <div className="redos-panel-heading">
                <span className="redos-kicker">Inspector</span>
                <h3>Properties <HelpTip label="Inspector" text="Panel ini muncul setelah memilih component di canvas. Di sini admin mengatur label, layout, data, dan action." /></h3>
              </div>
              <p className="redos-muted">Pilih component di canvas untuk mengatur tampilannya.</p>
            </>
          ) : activeTab === 'Theme' ? (
            <ThemePanel theme={theme} onThemeChange={onThemeChange} />
          ) : (
            <ExportPanel components={components} />
          )}
        </div>
      </aside>
    );
  }

  const selectedObject = selected.binding?.object ?? dataObjects[0]?.name ?? '';
  const fieldOptions = dataObjects.find((object) => object.name === selectedObject)?.fields ?? [];
  const selectedField = selected.binding?.field ?? fieldOptions[0] ?? '';
  const showPlaceholder = supportsPlaceholder(selected.type);
  const eventKeys = eventKeysForComponent(selected.type);

  return (
    <aside className="redos-property-panel">
      <RightPanelTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="redos-right-panel-content">
        {activeTab === 'Settings' ? (
          <>
            <div className="redos-panel-heading">
              <span className="redos-kicker">Inspector</span>
              <h3>{selected.label}</h3>
              <p className="redos-muted">{selected.type} · {selected.id}</p>
            </div>

            <section>
              <h4>General <HelpTip label="General" text="Atur nama tampilan, placeholder, ukuran, dan posisi component di screen." /></h4>
              <label>
                Component ID
                <input value={selected.id} readOnly />
              </label>
              <label>
                Label <HelpTip label="Label" text="Teks yang dilihat user di layar aplikasi." />
                <input value={selected.label} onChange={(event) => onChange({ label: event.target.value })} />
              </label>
              {showPlaceholder ? (
                <label>
                  Placeholder <HelpTip label="Placeholder" text="Contoh teks bantuan di dalam input sebelum user mengisi data. Kosongkan jika tidak ingin menampilkan placeholder." />
                  <input value={selected.placeholder ?? ''} onChange={(event) => onChange({ placeholder: event.target.value })} />
                </label>
              ) : null}
              <label>
                Width <HelpTip label="Width" text="Lebar component di canvas. Full untuk satu baris penuh, Half untuk dua kolom." />
                <select value={selected.width} onChange={(event) => onChange({ width: Number(event.target.value) })}>
                  <option value={12}>Full</option>
                  <option value={6}>Half</option>
                  <option value={4}>Third</option>
                  <option value={3}>Quarter</option>
                </select>
              </label>
              <label>
                Column <HelpTip label="Column" text="Posisi horizontal component pada grid 12 kolom." />
                <select value={selected.x} onChange={(event) => onChange({ x: Number(event.target.value) })}>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index} value={index}>{index + 1}</option>
                  ))}
                </select>
              </label>
              <label>
                Height <HelpTip label="Height" text="Tinggi component. Bisa juga diubah dengan handle Resize di canvas." />
                <input type="number" value={selected.height} onChange={(event) => onChange({ height: Number(event.target.value) })} />
              </label>
            </section>

            <section>
              <h4>Data Binding <HelpTip label="Data Binding" text="Hubungkan component ke Data agar nilai bisa disimpan atau ditampilkan oleh runtime." /></h4>
              <label>
                Object
                <select
                  value={selectedObject}
                  onChange={(event) => {
                    const nextObject = dataObjects.find((object) => object.name === event.target.value);
                    onChange({ binding: { object: event.target.value, field: nextObject?.fields[0] ?? '' } });
                  }}
                >
                  {dataObjects.map((object) => <option key={object.name}>{object.name}</option>)}
                </select>
              </label>
              <label>
                Field
                <select
                  value={selectedField}
                  onChange={(event) => onChange({ binding: { object: selectedObject, field: event.target.value } })}
                >
                  {fieldOptions.map((field) => <option key={field}>{field}</option>)}
                </select>
              </label>
              <p className="redos-muted">This generates DATA binding metadata behind the scenes.</p>
            </section>

            <section>
              <h4>Events <HelpTip label="Events" text="Event menentukan kapan Action berjalan, misalnya saat button diklik, value berubah, form submit, atau screen load." /></h4>
              {eventKeys.map((eventKey) => (
                <label key={eventKey}>
                  {eventLabels[eventKey]}
                  <select
                    value={selected.events?.[eventKey] ?? 'None'}
                    onChange={(event) => onChange({ events: nextEvents(selected.events, eventKey, event.target.value) })}
                  >
                    {actionOptions.map((action) => <option key={action}>{action}</option>)}
                  </select>
                </label>
              ))}
              <p className="redos-muted">Components bind to Action Metadata. Runtime menjalankan action berdasarkan event yang dipilih, bukan memanggil endpoint langsung dari builder.</p>
            </section>

            <section className="redos-danger-zone">
              <h4>Delete <HelpTip label="Delete" text="Menghapus component dari screen. Data dan Action yang sudah dibuat tetap ada di Advanced Mode." /></h4>
              <p className="redos-muted">Remove this component from the screen. Saved backend metadata will be updated when metadata sync is connected.</p>
              <button type="button" onClick={onDelete}>
                Delete selected component
              </button>
            </section>
          </>
        ) : activeTab === 'Theme' ? (
          <ThemePanel selected={selected} theme={theme} onComponentThemeChange={(themeOverrides) => onChange({ themeOverrides })} onThemeChange={onThemeChange} />
        ) : (
          <ExportPanel components={components} />
        )}
      </div>
    </aside>
  );
}

function RightPanelTabs({ activeTab, onTabChange }: { activeTab: RightPanelTab; onTabChange: (tab: RightPanelTab) => void }) {
  return (
    <div className="redos-right-tabs" aria-label="Right panel tabs">
      {(['Settings', 'Theme', 'Export'] as const).map((tab) => (
        <button key={tab} className={activeTab === tab ? 'redos-right-tab-active' : ''} type="button" onClick={() => onTabChange(tab)}>
          {tab}
        </button>
      ))}
    </div>
  );
}

function ThemePanel({
  onComponentThemeChange,
  onThemeChange,
  selected,
  theme,
}: {
  onComponentThemeChange?: (themeOverrides: Record<string, string>) => void;
  onThemeChange: (theme: BuilderTheme) => void;
  selected?: CanvasComponent;
  theme: BuilderTheme;
}) {
  const [propertyValues, setPropertyValues] = useState<ThemePropertyValueMap>(() =>
    Object.fromEntries(
      themePropertySections.flatMap((section) =>
        section.rows.flatMap((row) => {
          const valueKey = themePropertyKey(section.title, row.label, 'value');
          const colorKey = themePropertyKey(section.title, row.label, 'color');
          return row.swatch ? [[valueKey, row.value], [colorKey, row.swatch]] : [[valueKey, row.value]];
        }),
      ),
    ),
  );

  const updatePropertyValue = (sectionTitle: string, property: ThemeProperty, kind: ThemePropertyKind, value: string) => {
    const key = themePropertyKey(sectionTitle, property.label, kind);
    setPropertyValues((current) => ({ ...current, [key]: value }));
    applyThemeProperty(sectionTitle, property, value, selected, onComponentThemeChange);
  };

  return (
    <div className="redos-theme-editor">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Theme</span>
        <h3>CSS Properties</h3>
        <p className="redos-muted">
          {selected ? `Override style untuk ${selected.label || selected.type}.` : 'Atur token style global seperti warna, font, input, table, dan button.'}
        </p>
      </div>
      <section className="redos-theme-save-card">
        <h4>Theme</h4>
        <div className="redos-theme-save-row">
          <label>
            Theme name
            <input placeholder="Name" />
          </label>
          <button type="button">Save</button>
        </div>
        <div className="redos-theme-save-row">
          <label>
            Load theme
            <select value={theme} onChange={(event) => onThemeChange(event.target.value as BuilderTheme)}>
              <option>Light</option>
              <option>Mint</option>
              <option>Dark</option>
            </select>
          </label>
          <button type="button">Load</button>
        </div>
        <div className="redos-theme-segmented">
          {(['Small', 'Medium', 'Large'] as const).map((size) => (
            <button key={size} className={size === 'Medium' ? 'redos-theme-active' : ''} type="button">{size}</button>
          ))}
        </div>
      </section>
      {themePropertySections.map((section) => (
        <ThemePropertySection
          key={section.title}
          defaultOpen={['Colors', 'Fonts', 'General'].includes(section.title)}
          onValueChange={updatePropertyValue}
          propertyValues={propertyValues}
          selected={selected}
          title={section.title}
          rows={section.rows}
        />
      ))}
    </div>
  );
}

function ThemePropertySection({
  defaultOpen = false,
  onValueChange,
  propertyValues,
  rows,
  selected,
  title,
}: {
  defaultOpen?: boolean;
  onValueChange: (sectionTitle: string, property: ThemeProperty, kind: ThemePropertyKind, value: string) => void;
  propertyValues: ThemePropertyValueMap;
  rows: ThemeProperty[];
  selected?: CanvasComponent;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="redos-theme-accordion">
      <button className="redos-theme-section-header" type="button" onClick={() => setIsOpen((current) => !current)}>
        <strong>{title}</strong>
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen ? (
        <div className="redos-theme-property-list">
          {rows.map((row) => {
            const valueKey = themePropertyKey(title, row.label, 'value');
            const colorKey = themePropertyKey(title, row.label, 'color');
            const selectedValue = selectedThemeOverrideValue(selected, title, row);
            const propertyValue = selected ? selectedValue ?? row.value : propertyValues[valueKey] ?? row.value;
            const swatchValue = selected ? selectedValue ?? row.swatch ?? row.value : propertyValues[colorKey] ?? row.swatch ?? row.value;

            return (
              <div className="redos-theme-property-row" key={row.label}>
                <label htmlFor={valueKey}>{row.label}</label>
                <div className="redos-theme-property-control">
                  <input
                    id={valueKey}
                    type={row.unit ? 'number' : 'text'}
                    value={propertyValue}
                    onChange={(event) => onValueChange(title, row, 'value', event.target.value)}
                  />
                  {row.unit ? <span className="redos-theme-unit">{row.unit}</span> : null}
                  {row.swatch ? (
                    <input
                      aria-label={`${row.label} color`}
                      className="redos-theme-color-picker"
                      type="color"
                      value={swatchValue}
                      onChange={(event) => {
                        onValueChange(title, row, 'color', event.target.value);
                        onValueChange(title, row, 'value', event.target.value);
                      }}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function themePropertyKey(sectionTitle: string, propertyLabel: string, kind: ThemePropertyKind) {
  return `${sectionTitle}:${propertyLabel}:${kind}`;
}

function selectedThemeOverrideValue(selected: CanvasComponent | undefined, sectionTitle: string, property: ThemeProperty) {
  const variableName = themeCssVariable(sectionTitle, property.label);

  if (!selected || !variableName) {
    return undefined;
  }

  const value = selected.themeOverrides?.[variableName];

  if (!value) {
    return undefined;
  }

  if (property.unit && value.endsWith(property.unit)) {
    return value.slice(0, -property.unit.length);
  }

  return value;
}

function supportsPlaceholder(type: string) {
  return [
    'TextInput',
    'NumberInput',
    'Search',
    'EmailInput',
    'PhoneInput',
    'PasswordInput',
    'UrlInput',
    'LocationInput',
    'TextArea',
    'TextEditor',
    'Dropdown',
    'Lookup',
  ].includes(type);
}

function eventKeysForComponent(type: string): EventKey[] {
  if (type === 'Form') {
    return ['onSubmit', 'onLoad'];
  }

  if (['Button', 'Submit', 'ConfirmModal'].includes(type)) {
    return ['onClick', 'onFocus', 'onBlur'];
  }

  if ([
    'TextInput',
    'NumberInput',
    'Search',
    'EmailInput',
    'PhoneInput',
    'PasswordInput',
    'UrlInput',
    'LocationInput',
    'TextArea',
    'TextEditor',
    'Dropdown',
    'Lookup',
    'Checkbox',
    'SingleChoice',
    'MultipleChoice',
    'DecisionBox',
    'Tags',
    'ToggleSwitch',
    'DateInput',
    'TimeInput',
    'DateTimeInput',
    'MultipleDates',
    'DateRange',
    'Slider',
    'RangeSlider',
    'InputTable',
    'MatrixTable',
    'UploadField',
    'ImageUpload',
    'MultiFileUpload',
    'MultiImageUpload',
  ].includes(type)) {
    return ['onChange', 'onFocus', 'onBlur'];
  }

  return ['onLoad'];
}

function nextEvents(currentEvents: CanvasComponent['events'], eventKey: EventKey, action: string): CanvasComponent['events'] | undefined {
  const next = { ...currentEvents };

  if (action === 'None') {
    delete next[eventKey];
  } else {
    next[eventKey] = action;
  }

  return Object.values(next).some(Boolean) ? next : undefined;
}

function applyThemeProperty(
  sectionTitle: string,
  property: ThemeProperty,
  rawValue: string,
  selected?: CanvasComponent,
  onComponentThemeChange?: (themeOverrides: Record<string, string>) => void,
) {
  const variableName = themeCssVariable(sectionTitle, property.label);

  if (!variableName) {
    return;
  }

  const value = normalizeThemeCssValue(rawValue, property.unit);

  if (selected && onComponentThemeChange) {
    onComponentThemeChange({ ...selected.themeOverrides, [variableName]: value });
    return;
  }

  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.style.setProperty(variableName, value);
}

function themeCssVariable(sectionTitle: string, propertyLabel: string) {
  const key = `${sectionTitle}:${propertyLabel}`;
  const variables: Record<string, string> = {
    'Colors:Primary': '--redos-builder-primary',
    'Colors:Primary darker': '--redos-builder-primary-dark',
    'Colors:On primary': '--redos-builder-on-primary',
    'Colors:Danger text': '--redos-builder-danger',
    'Colors:Danger background': '--redos-builder-danger-bg',
    'Colors:Success text': '--redos-builder-success',
    'Colors:Success background': '--redos-builder-success-bg',
    'Colors:Gray 50': '--redos-builder-gray-50',
    'Colors:Gray 100': '--redos-builder-gray-100',
    'Colors:Gray 200': '--redos-builder-gray-200',
    'Colors:Gray 300': '--redos-builder-gray-300',
    'Colors:Gray 400': '--redos-builder-gray-400',
    'Colors:Gray 500': '--redos-builder-gray-500',
    'Colors:Gray 700': '--redos-builder-gray-700',
    'Fonts:Font family': '--redos-builder-font-family',
    'Fonts:Font size': '--redos-builder-font-size',
    'Fonts:Line height': '--redos-builder-line-height',
    'Fonts:Letter spacing': '--redos-builder-letter-spacing',
    'General:Gutter': '--redos-builder-gutter',
    'General:Link color': '--redos-builder-link-color',
    'General:Link decoration': '--redos-builder-link-decoration',
    'General:Muted text color': '--redos-builder-muted-text',
    'General:Passive text color': '--redos-builder-passive-text',
    'General:Passive background': '--redos-builder-passive-bg',
    'General:Selected background': '--redos-builder-selected-bg',
    'General:Small radius': '--redos-builder-radius-small',
    'General:Handle shadow': '--redos-builder-handle-shadow',
    'Input:Height': '--redos-builder-input-height',
    'Input:Padding X': '--redos-builder-input-padding-x',
    'Input:Background': '--redos-builder-input-bg',
    'Input:Border color': '--redos-builder-input-border',
    'Input:Focus border': '--redos-builder-input-focus',
    'Input:Placeholder color': '--redos-builder-placeholder',
    'Select:Height': '--redos-builder-select-height',
    'Select:Caret color': '--redos-builder-select-caret',
    'Select:Option background': '--redos-builder-option-bg',
    'Select:Option hover': '--redos-builder-option-hover',
    'Select:Selected color': '--redos-builder-selected-color',
    'Tags:Tag radius': '--redos-builder-tag-radius',
    'Tags:Tag background': '--redos-builder-tag-bg',
    'Tags:Tag text': '--redos-builder-tag-text',
    'Tags:Tag gap': '--redos-builder-tag-gap',
    'Signature:Canvas height': '--redos-builder-signature-height',
    'Signature:Stroke color': '--redos-builder-signature-stroke',
    'Signature:Stroke width': '--redos-builder-signature-stroke-width',
    'Signature:Upload background': '--redos-builder-signature-bg',
    'Checkbox & radio:Size': '--redos-builder-checkbox-size',
    'Checkbox & radio:Border radius': '--redos-builder-checkbox-radius',
    'Checkbox & radio:Checked background': '--redos-builder-checkbox-checked-bg',
    'Checkbox & radio:Checked mark': '--redos-builder-checkbox-checked-mark',
    'Checkbox & radio:Label gap': '--redos-builder-checkbox-label-gap',
    'Table:Header background': '--redos-builder-table-header-bg',
    'Table:Border color': '--redos-builder-table-border',
    'Table:Cell padding': '--redos-builder-table-cell-padding',
    'Table:Row hover': '--redos-builder-table-row-hover',
    'Slider:Track height': '--redos-builder-slider-track-height',
    'Slider:Track background': '--redos-builder-slider-track-bg',
    'Slider:Fill background': '--redos-builder-slider-fill-bg',
    'Slider:Thumb size': '--redos-builder-slider-thumb-size',
    'Toggle:Width': '--redos-builder-toggle-width',
    'Toggle:Height': '--redos-builder-toggle-height',
    'Toggle:On background': '--redos-builder-toggle-on-bg',
    'Toggle:Off background': '--redos-builder-toggle-off-bg',
    'Images:Preview height': '--redos-builder-image-height',
    'Images:Object fit': '--redos-builder-image-fit',
    'Images:Dropzone background': '--redos-builder-dropzone-bg',
    'Images:Dropzone border': '--redos-builder-dropzone-border',
    'Buttons:Height': '--redos-builder-button-height',
    'Buttons:Padding X': '--redos-builder-button-padding-x',
    'Buttons:Primary background': '--redos-builder-button-bg',
    'Buttons:Primary text': '--redos-builder-button-text',
    'Buttons:Radius': '--redos-builder-button-radius',
    'Buttons:Shadow': '--redos-builder-button-shadow',
    'Static:Heading margin': '--redos-builder-heading-margin',
    'Static:Paragraph color': '--redos-builder-paragraph-color',
    'Static:Divider color': '--redos-builder-divider',
    'Static:Spacer height': '--redos-builder-spacer-height',
  };

  return variables[key];
}

function normalizeThemeCssValue(value: string, unit?: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const tokenValue = themeTokenValue(trimmed);

  if (tokenValue) {
    return tokenValue;
  }

  if (unit && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}${unit}`;
  }

  return trimmed;
}

function themeTokenValue(value: string) {
  const normalized = value.toLowerCase();
  const tokenVariables: Record<string, string> = {
    primary: 'var(--redos-builder-primary, var(--redios-color-primary))',
    'primary darker': 'var(--redos-builder-primary-dark, var(--redos-builder-primary, var(--redios-color-primary)))',
    'on primary': 'var(--redos-builder-on-primary, #ffffff)',
    'gray 50': 'var(--redos-builder-gray-50, #f9fafb)',
    'gray 100': 'var(--redos-builder-gray-100, #f3f4f6)',
    'gray 200': 'var(--redos-builder-gray-200, #e5e7eb)',
    'gray 300': 'var(--redos-builder-gray-300, #d1d5db)',
    'gray 400': 'var(--redos-builder-gray-400, #9ca3af)',
    'gray 500': 'var(--redos-builder-gray-500, #6b7280)',
    'gray 700': 'var(--redos-builder-gray-700, #374151)',
    'muted text': 'var(--redos-builder-gray-500, var(--redios-color-muted))',
  };

  return tokenVariables[normalized];
}

function ExportPanel({ components }: { components: CanvasComponent[] }) {
  return (
    <>
      <div className="redos-panel-heading">
        <span className="redos-kicker">Export</span>
        <h3>Generated Metadata</h3>
        <p className="redos-muted">Preview draft metadata yang dibuat dari experience canvas.</p>
      </div>
      <section>
        <h4>Canvas JSON</h4>
        <textarea className="redos-export-preview" readOnly value={JSON.stringify({ components }, null, 2)} />
      </section>
    </>
  );
}
