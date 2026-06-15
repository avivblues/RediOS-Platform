import type { CSSProperties } from 'react';
import type { CanvasComponent } from '../../studio/builder/types';

export interface TemplateRenderContext {
  columns?: Array<{ key: string; label: string }>;
  onValueChange?: (value: string) => void;
  records?: Array<Record<string, unknown>>;
  onAction?: (actionLabelOrCode?: string) => void;
  value?: string;
}

export function isTailAdminTemplateComponent(type: string) {
  return type.startsWith('Template');
}

export function RediosTemplateComponent({
  component,
  context = {},
  mode,
}: {
  component: CanvasComponent;
  context?: TemplateRenderContext;
  mode: 'builder' | 'runtime';
}) {
  const templateKind = component.template?.templateKind;

  if (component.type === 'TemplateMetricGroup') {
    return <TemplateMetricGroup component={component} />;
  }

  if (['TemplateChartPanel', 'TemplateLineChart', 'TemplateBarChart'].includes(component.type)) {
    return <TemplateChartPanel component={component} />;
  }

  if (component.type === 'TemplateMapPanel') {
    return <TemplateMapPanel component={component} />;
  }

  if (['TemplateRecentOrders', 'TemplateBasicTable'].includes(component.type)) {
    return <TemplateTable component={component} context={context} />;
  }

  if (component.type === 'TemplateCalendarBoard') {
    return <TemplateCalendarBoard component={component} context={context} />;
  }

  if (component.type === 'TemplateProfileCard') {
    return <TemplateProfileCard component={component} context={context} />;
  }

  if (component.type === 'TemplateAuthForm') {
    return <TemplateAuthForm component={component} context={context} mode={mode} />;
  }

  if (component.type === 'TemplateAlert') {
    return <TemplateAlert component={component} />;
  }

  if (component.type === 'TemplateBadge') {
    return <TemplateBadge component={component} />;
  }

  if (component.type === 'TemplateAvatar') {
    return <TemplateAvatar component={component} />;
  }

  if (['TemplateImageCard', 'TemplateVideoCard'].includes(component.type)) {
    return <TemplateMediaCard component={component} />;
  }

  if (component.type === 'TemplateDropzone') {
    return <TemplateDropzone component={component} />;
  }

  if (isTemplateInputComponent(component.type)) {
    return <TemplateInputVariant component={component} context={context} mode={mode} />;
  }

  if (component.type === 'TemplateAppHeader') {
    return <TemplateAppHeader component={component} />;
  }

  if (component.type === 'TemplateAppSidebar') {
    return <TemplateAppSidebar component={component} />;
  }

  if (component.type === 'TemplateNotificationList') {
    return <TemplateNotificationList component={component} />;
  }

  if (component.type === 'TemplateErrorState') {
    return <TemplateErrorState component={component} context={context} />;
  }

  if (component.type === 'TemplateBreadcrumb') {
    return <TemplateBreadcrumb component={component} />;
  }

  return (
    <section className="redios-template-card">
      <span className="redios-template-eyebrow">{templateKind ?? 'Template'}</span>
      <strong>{component.label}</strong>
      <small>{component.type}</small>
    </section>
  );
}

function TemplateMetricGroup({ component }: { component: CanvasComponent }) {
  const metrics = component.template?.metrics?.length ? component.template.metrics : [
    { label: 'Customers', value: '3,782' },
    { label: 'Orders', value: '5,359' },
    { label: 'Revenue', value: '$18,650' },
    { label: 'Growth', value: '11.2%' },
  ];

  return (
    <section className="redios-template-metrics">
      {metrics.map((metric, index) => (
        <article key={metric.label} className="redios-template-metric">
          <div className="redios-template-metric-icon" aria-hidden="true">{index % 2 === 0 ? '◎' : '□'}</div>
          <div>
            <span>{metric.label}</span>
            <strong>{metric.value ?? metric.field ?? '-'}</strong>
          </div>
          <small className={index % 2 === 0 ? 'redios-template-trend-up' : 'redios-template-trend-down'}>
            {index % 2 === 0 ? '↗ 11.01%' : '↘ 9.05%'}
          </small>
        </article>
      ))}
    </section>
  );
}

function TemplateChartPanel({ component }: { component: CanvasComponent }) {
  const chartKind = component.template?.chart?.kind ?? (component.type === 'TemplateBarChart' ? 'bar' : 'line');
  const categories = component.template?.chart?.categories?.length ? component.template.chart.categories : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const series = component.template?.chart?.series?.length ? component.template.chart.series : [{ name: 'Sales', data: [168, 385, 201, 298, 187, 195, 291] }];
  const primaryData = series[0]?.data ?? [];
  const secondaryData = series[1]?.data ?? [];
  const maxValue = Math.max(...series.flatMap((item) => item.data), 1);
  const radialValue = Math.round(primaryData[0] ?? 75);

  return (
    <section className="redios-template-card redios-template-chart">
      <div className="redios-template-chart-header">
        <TemplateHeader component={component} eyebrow={`${chartKind} chart`} />
        <button type="button" aria-label="Chart options">•••</button>
      </div>
      {chartKind === 'radial' ? (
        <div className="redios-template-radial" aria-hidden="true">
          <i style={{ '--redios-template-radial-value': `${Math.max(0, Math.min(radialValue, 100))}%` } as CSSProperties}>{radialValue}%</i>
          <span>+10%</span>
        </div>
      ) : chartKind === 'line' || chartKind === 'area' ? (
        <LineChartPreview categories={categories} maxValue={maxValue} primaryData={primaryData} secondaryData={secondaryData} />
      ) : (
        <BarChartPreview categories={categories} maxValue={maxValue} values={primaryData} />
      )}
      <div className="redios-template-chart-footer">
        <span>{series.map((item) => item.name).join(' · ')}</span>
        <small>Query: {component.template?.dataSource?.query || 'Select Query in metadata settings'}</small>
      </div>
    </section>
  );
}

function BarChartPreview({ categories, maxValue, values }: { categories: string[]; maxValue: number; values: number[] }) {
  return (
    <div className="redios-template-bar-chart" aria-label="Dummy bar chart preview">
      <div className="redios-template-bars">
        {values.map((value, index) => (
          <i key={`${value}-${index}`} style={{ height: `${Math.max(8, (value / maxValue) * 100)}%` }} />
        ))}
      </div>
      <div className="redios-template-chart-axis">
        {categories.slice(0, values.length).map((category) => <span key={category}>{category}</span>)}
      </div>
    </div>
  );
}

function LineChartPreview({
  categories,
  maxValue,
  primaryData,
  secondaryData,
}: {
  categories: string[];
  maxValue: number;
  primaryData: number[];
  secondaryData: number[];
}) {
  const primaryPoints = chartPoints(primaryData, maxValue);
  const secondaryPoints = chartPoints(secondaryData.length ? secondaryData : primaryData.map((value) => Math.max(10, value * 0.45)), maxValue);

  return (
    <div className="redios-template-line-chart" aria-label="Dummy line chart preview">
      <svg viewBox="0 0 320 150" role="img">
        <path className="redios-template-grid-line" d="M0 30 H320 M0 75 H320 M0 120 H320" />
        <path className="redios-template-area-fill" d={`M${primaryPoints} L320 150 L0 150 Z`} />
        <polyline className="redios-template-line-primary" points={primaryPoints} />
        <polyline className="redios-template-line-secondary" points={secondaryPoints} />
      </svg>
      <div className="redios-template-chart-axis">
        {categories.slice(0, 6).map((category) => <span key={category}>{category}</span>)}
      </div>
    </div>
  );
}

function chartPoints(values: number[], maxValue: number) {
  const step = values.length > 1 ? 320 / (values.length - 1) : 320;

  return values.map((value, index) => {
    const x = Math.round(index * step);
    const y = Math.round(138 - (value / maxValue) * 112);
    return `${x},${Math.max(12, Math.min(138, y))}`;
  }).join(' ');
}

function TemplateMapPanel({ component }: { component: CanvasComponent }) {
  return (
    <section className="redios-template-card redios-template-map">
      <TemplateHeader component={component} eyebrow="Demographic map" />
      <div aria-hidden="true">
        {['ID', 'SG', 'AU', 'US', 'EU'].map((country) => <span key={country}>{country}</span>)}
      </div>
      <small>Geo data source: {component.template?.dataSource?.object || 'Metadata object'}</small>
    </section>
  );
}

function TemplateTable({ component, context }: { component: CanvasComponent; context: TemplateRenderContext }) {
  const columns = context.columns?.length ? context.columns : templateColumns(component);
  const rows = context.records?.length ? context.records.slice(0, 5) : demoRows(columns);

  return (
    <section className="redios-template-card redios-template-table-card">
      <TemplateHeader component={component} eyebrow="Data table" />
      <div className="redios-template-table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.key}>{column.label}</th>)}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
          <tr key={String(row.id ?? rowIndex)}>
                {columns.map((column) => <td key={column.key}>{formatValue(row[column.key])}</td>)}
                <td><button type="button" onClick={() => context.onAction?.(component.events?.onClick)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TemplateCalendarBoard({ component, context }: { component: CanvasComponent; context: TemplateRenderContext }) {
  const rows = context.records?.length ? context.records.slice(0, 4) : demoRows([{ key: 'title', label: 'Title' }, { key: 'date', label: 'Date' }]);

  return (
    <section className="redios-template-card redios-template-calendar">
      <TemplateHeader component={component} eyebrow="Calendar" />
      <div className="redios-template-calendar-grid">
        {Array.from({ length: 28 }, (_, index) => (
          <span key={index} className={index === 6 || index === 14 || index === 21 ? 'redios-template-calendar-active' : ''}>{index + 1}</span>
        ))}
      </div>
      <div className="redios-template-feed">
        {rows.map((row, index) => (
          <article key={String(row.id ?? index)}>
            <strong>{formatValue(row['title']) || `Event ${index + 1}`}</strong>
            <small>{formatValue(row['date']) || 'Mapped date field'}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function TemplateProfileCard({ component, context }: { component: CanvasComponent; context: TemplateRenderContext }) {
  const record = context.records?.[0] ?? {};

  return (
    <section className="redios-template-card redios-template-profile">
      <div className="redios-template-avatar">A</div>
      <div>
        <TemplateHeader component={component} eyebrow={component.template?.variant ?? 'Profile'} />
        <dl>
          {['name', 'email', 'role', 'address'].map((field) => (
            <div key={field}>
              <dt>{field}</dt>
              <dd>{formatValue(record[field]) || `Mapped ${field}`}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function TemplateAuthForm({ component, context, mode }: { component: CanvasComponent; context: TemplateRenderContext; mode: 'builder' | 'runtime' }) {
  const isSignup = component.template?.variant === 'signup';

  return (
    <section className="redios-template-card redios-template-auth">
      <TemplateHeader component={component} eyebrow={isSignup ? 'Register' : 'Authentication'} />
      {isSignup ? <input readOnly={mode === 'builder'} placeholder="Full name" /> : null}
      <input readOnly={mode === 'builder'} placeholder="Email address" />
      <input readOnly={mode === 'builder'} placeholder="Password" type="password" />
      <button type="button" onClick={() => context.onAction?.(component.events?.onSubmit ?? component.events?.onClick)}>
        {component.label}
      </button>
      <small>Submit via Action Metadata.</small>
    </section>
  );
}

function TemplateAlert({ component }: { component: CanvasComponent }) {
  return (
    <section className={`redios-template-alert redios-template-alert-${component.template?.variant ?? 'info'}`}>
      <strong>{component.label}</strong>
      <span>Action/process feedback will appear here.</span>
    </section>
  );
}

function TemplateBadge({ component }: { component: CanvasComponent }) {
  return <span className={`redios-template-badge redios-template-badge-${component.template?.variant ?? 'info'}`}>{component.label}</span>;
}

function TemplateAvatar({ component }: { component: CanvasComponent }) {
  return (
    <section className="redios-template-avatar-card">
      <div className="redios-template-avatar">R</div>
      <strong>{component.label}</strong>
      <small>Image field binding ready</small>
    </section>
  );
}

function TemplateMediaCard({ component }: { component: CanvasComponent }) {
  const isVideo = component.type === 'TemplateVideoCard';

  return (
    <section className="redios-template-card redios-template-media">
      <div>{isVideo ? 'Video' : 'Image'}</div>
      <TemplateHeader component={component} eyebrow="Media" />
      <small>Bind to file/image metadata.</small>
    </section>
  );
}

function TemplateDropzone({ component }: { component: CanvasComponent }) {
  return (
    <section className="redios-template-dropzone">
      <strong>{component.label}</strong>
      <span>Drop files here or bind to file attribute.</span>
    </section>
  );
}

function TemplateInputVariant({
  component,
  context,
  mode,
}: {
  component: CanvasComponent;
  context: TemplateRenderContext;
  mode: 'builder' | 'runtime';
}) {
  const label = component.label || 'Input';
  const value = context.value ?? '';
  const readOnly = mode === 'builder' || component.readonly;

  if (component.type === 'TemplatePhoneInputGroup') {
    return (
      <label className="redios-template-field-card">
        <TemplateFieldHeader label={label} variant="Phone group" />
        <div className="redios-template-phone-row">
          <select aria-label="Country code" defaultValue="+62" disabled={readOnly}>
            <option>+62</option>
            <option>+1</option>
            <option>+65</option>
          </select>
          <input
            readOnly={readOnly}
            placeholder="812 3456 7890"
            value={value}
            onChange={(event) => context.onValueChange?.(event.target.value)}
          />
        </div>
        <small>Phone field binding ready.</small>
      </label>
    );
  }

  if (component.type === 'TemplateInputState') {
    return (
      <section className="redios-template-field-card">
        <TemplateFieldHeader label={label} variant="Input states" />
        <input
          className="redios-template-input-success"
          readOnly={readOnly}
          placeholder="Success input"
          value={value}
          onChange={(event) => context.onValueChange?.(event.target.value)}
        />
        <input className="redios-template-input-error" readOnly placeholder="Error input" />
        <input disabled placeholder="Disabled input" />
        <small>Success, error, and disabled variants from TailAdmin.</small>
      </section>
    );
  }

  if (component.type === 'TemplateFileInput') {
    return (
      <section className="redios-template-field-card">
        <TemplateFieldHeader label={label} variant="File input" />
        <label className="redios-template-file-input">
          <span>Choose file</span>
          <input disabled={readOnly} type="file" onChange={(event) => context.onValueChange?.(event.target.files?.[0]?.name ?? '')} />
        </label>
        <small>{value || 'No file selected'}</small>
      </section>
    );
  }

  if (component.type === 'TemplateTextareaState') {
    return (
      <label className="redios-template-field-card">
        <TemplateFieldHeader label={label} variant="Textarea" />
        <textarea
          readOnly={readOnly}
          placeholder="Write your message..."
          value={value}
          onChange={(event) => context.onValueChange?.(event.target.value)}
        />
        <small>Textarea supports helper and validation state.</small>
      </label>
    );
  }

  if (component.type === 'TemplateRadioGroup') {
    return (
      <fieldset className="redios-template-field-card redios-template-choice-card">
        <TemplateFieldHeader label={label} variant="Radio group" />
        {['Option one', 'Option two', 'Option disabled'].map((option, index) => (
          <label key={option}>
            <input
              checked={(value || 'Option one') === option}
              disabled={readOnly || index === 2}
              name={component.id}
              type="radio"
              value={option}
              onChange={(event) => context.onValueChange?.(event.target.value)}
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (component.type === 'TemplateCheckboxGroup') {
    return (
      <fieldset className="redios-template-field-card redios-template-choice-card">
        <TemplateFieldHeader label={label} variant="Checkboxes" />
        {['Remember me', 'Send notification', 'Disabled'].map((option, index) => (
          <label key={option}>
            <input
              checked={index === 0 || value.includes(option)}
              disabled={readOnly || index === 2}
              type="checkbox"
              onChange={(event) => context.onValueChange?.(event.target.checked ? option : '')}
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (component.type === 'TemplateSwitchGroup') {
    return (
      <fieldset className="redios-template-field-card redios-template-switch-card">
        <TemplateFieldHeader label={label} variant="Switches" />
        {['Active workflow', 'Send email', 'Disabled'].map((option, index) => (
          <label key={option}>
            <span>{option}</span>
            <input
              checked={index === 0 || value === option}
              disabled={readOnly || index === 2}
              type="checkbox"
              onChange={(event) => context.onValueChange?.(event.target.checked ? option : '')}
            />
            <i aria-hidden="true" />
          </label>
        ))}
      </fieldset>
    );
  }

  if (component.type === 'TemplateSelectGroup') {
    return (
      <section className="redios-template-field-card">
        <TemplateFieldHeader label={label} variant="Select inputs" />
        <select disabled={readOnly} value={value || 'Marketing'} onChange={(event) => context.onValueChange?.(event.target.value)}>
          <option>Marketing</option>
          <option>Template</option>
          <option>Development</option>
        </select>
        <div className="redios-template-multi-select">
          {['Design', 'React', 'Admin'].map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <small>Select and multi-select variants.</small>
      </section>
    );
  }

  if (component.type === 'TemplateDatePicker') {
    return (
      <label className="redios-template-field-card">
        <TemplateFieldHeader label={label} variant="Date picker" />
        <div className="redios-template-date-input">
          <input
            readOnly={readOnly}
            placeholder="Select date"
            type="text"
            value={value}
            onChange={(event) => context.onValueChange?.(event.target.value)}
          />
          <span aria-hidden="true">Calendar</span>
        </div>
        <small>Flatpickr-style picker placeholder.</small>
      </label>
    );
  }

  return (
    <label className="redios-template-field-card">
      <TemplateFieldHeader label={label} variant="Input group" />
      <div className="redios-template-input-icon-row">
        <span aria-hidden="true">@</span>
        <input
          readOnly={readOnly}
          placeholder={component.placeholder || 'info@example.com'}
          value={value}
          onChange={(event) => context.onValueChange?.(event.target.value)}
        />
      </div>
      <small>Email input group with leading icon.</small>
    </label>
  );
}

function TemplateFieldHeader({ label, variant }: { label: string; variant: string }) {
  return (
    <span className="redios-template-field-heading">
      <strong>{label}</strong>
      <small>{variant}</small>
    </span>
  );
}

function isTemplateInputComponent(type: string) {
  return [
    'TemplateCheckboxGroup',
    'TemplateDatePicker',
    'TemplateFileInput',
    'TemplateInputGroup',
    'TemplateInputState',
    'TemplatePhoneInputGroup',
    'TemplateRadioGroup',
    'TemplateSelectGroup',
    'TemplateSwitchGroup',
    'TemplateTextareaState',
  ].includes(type);
}

function TemplateAppHeader({ component }: { component: CanvasComponent }) {
  return (
    <section className="redios-template-app-header">
      <strong>{component.label}</strong>
      <input readOnly placeholder="Search..." />
      <span>Notifications</span>
      <span>User</span>
    </section>
  );
}

function TemplateAppSidebar({ component }: { component: CanvasComponent }) {
  return (
    <section className="redios-template-app-sidebar">
      <strong>{component.label}</strong>
      {['Dashboard', 'Forms', 'Tables', 'Settings'].map((item) => <span key={item}>{item}</span>)}
    </section>
  );
}

function TemplateNotificationList({ component }: { component: CanvasComponent }) {
  return (
    <section className="redios-template-card redios-template-feed">
      <TemplateHeader component={component} eyebrow="Notifications" />
      {['Action completed', 'Approval pending', 'Connector prepared'].map((item) => (
        <article key={item}>
          <strong>{item}</strong>
          <small>Bound to process/action metadata.</small>
        </article>
      ))}
    </section>
  );
}

function TemplateErrorState({ component, context }: { component: CanvasComponent; context: TemplateRenderContext }) {
  return (
    <section className="redios-template-card redios-template-error">
      <strong>{component.label}</strong>
      <span>Halaman tidak ditemukan atau belum tersedia.</span>
      <button type="button" onClick={() => context.onAction?.(component.events?.onClick)}>Back to application</button>
    </section>
  );
}

function TemplateBreadcrumb({ component }: { component: CanvasComponent }) {
  return (
    <nav className="redios-template-breadcrumb" aria-label={component.label}>
      <span>Application</span>
      <span>/</span>
      <span>Menu</span>
      <span>/</span>
      <strong>{component.label}</strong>
    </nav>
  );
}

function TemplateHeader({ component, eyebrow }: { component: CanvasComponent; eyebrow: string }) {
  return (
    <header className="redios-template-header">
      <span className="redios-template-eyebrow">{eyebrow}</span>
      <strong>{component.label}</strong>
      <small>{component.template?.dataSource?.object ? `Object: ${component.template.dataSource.object}` : 'Metadata-aware component'}</small>
    </header>
  );
}

function templateColumns(component: CanvasComponent) {
  return component.template?.columns?.length ? component.template.columns.map((column) => ({
    key: column.field,
    label: column.label,
  })) : [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'owner', label: 'Owner' },
  ];
}

function demoRows(columns: Array<{ key: string; label: string }>): Array<Record<string, unknown>> {
  return ['Product Review', 'Stock Sync', 'Approval Queue'].map((name, index) => ({
    id: `demo_${index + 1}`,
    ...Object.fromEntries(columns.map((column) => [column.key, column.key === 'name' || column.key === 'title' ? name : index === 1 ? 'Pending' : 'Active'])),
  }));
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
