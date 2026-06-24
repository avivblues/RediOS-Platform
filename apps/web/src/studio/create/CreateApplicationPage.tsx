import { useState } from 'react';
import type { StudioTarget } from '../builder/types';
import { HelpTip } from '../guide/AdminGuide';
import { seedApplicationMetadata, setActiveApplicationCode, toApplicationSlug, toMetadataCode } from '../metadata/metadata-store';

interface StudioApplicationDraft {
  code: string;
  name: string;
  slug: string;
  template: string;
  target: StudioTarget;
  createdAt: string;
}

const APPLICATIONS_KEY = 'redios:studio:applications';

const templates = [
  {
    code: 'BLANK_EXPERIENCE',
    label: 'Blank Experience',
    description: 'Empty canvas — compose visually.',
  },
  {
    code: 'INVENTORY_EXPERIENCE',
    label: 'Inventory Experience',
    description: 'Product, stock, dashboard starter.',
  },
  {
    code: 'SERVICE_EXPERIENCE',
    label: 'Service Experience',
    description: 'Ticket, assignment, field flow.',
  },
];

export function CreateApplicationPage() {
  const [name, setName] = useState('Inventory');
  const [template, setTemplate] = useState(templates[1].code);
  const [target, setTarget] = useState<StudioTarget>('web');
  const selectedTemplate = templates.find((item) => item.code === template) ?? templates[0];

  function createApplication() {
    const nextApp: StudioApplicationDraft = {
      code: toMetadataCode(name),
      name: name.trim() || 'New Application',
      slug: toApplicationSlug(name),
      template,
      target,
      createdAt: new Date().toISOString(),
    };
    const currentApps = loadApplications();
    window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([nextApp, ...currentApps.filter((app) => app.code !== nextApp.code)]));
    setActiveApplicationCode(target, nextApp.code);
    seedApplicationMetadata(nextApp.code, template);
    window.location.href = target === 'android' ? '/studio/builder/android' : '/studio/builder/web';
  }

  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">Create Application</span>
          <h1>
            Create Application
            {' '}
            <HelpTip label="Create Application" text="Name + starter template → visual builder. Guide: docs/handbook/02 §4." />
          </h1>
        </div>
        <div className="redos-actions">
          <button type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
          <button type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata</button>
          <button type="button" onClick={() => { window.location.href = '/studio/query'; }}>Query Builder</button>
          <button type="button" onClick={() => { window.location.href = '/studio/api'; }}>API Builder</button>
        </div>
      </header>

      <section className="redos-create-flow">
        <div className="redos-metadata-card">
          <div className="redos-panel-heading">
            <span className="redos-kicker">Step 1</span>
            <h3>
              Application
              {' '}
              <HelpTip label="Application Name" text="Business process name, e.g. Asset Maintenance." />
            </h3>
          </div>
          <label>
            Application Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Asset Maintenance" />
          </label>
          <label>
            Runtime Target
            <select value={target} onChange={(event) => setTarget(event.target.value as StudioTarget)}>
              <option value="web">Web</option>
              <option value="android">Android</option>
            </select>
          </label>
        </div>

        <div className="redos-metadata-card redos-metadata-card-wide">
          <div className="redos-panel-heading">
            <span className="redos-kicker">Step 2</span>
            <h3>Starter Experience</h3>
          </div>
          <div className="redos-template-grid">
            {templates.map((item) => (
              <button
                key={item.code}
                className={template === item.code ? 'redos-template-card redos-template-card-active' : 'redos-template-card'}
                type="button"
                onClick={() => setTemplate(item.code)}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="redos-metadata-card">
          <div className="redos-panel-heading">
            <span className="redos-kicker">Step 3</span>
            <h3>Open Builder</h3>
          </div>
          <div className="redos-organism-preview-card">
            <strong>{name || 'New Application'}</strong>
            <span>{selectedTemplate.label} · {target === 'android' ? 'Android' : 'Web'}</span>
          </div>
          <button className="redos-primary-action" type="button" onClick={createApplication}>
            Create and Open Builder
          </button>
        </div>
      </section>
    </main>
  );
}

function loadApplications(): StudioApplicationDraft[] {
  try {
    const rawValue = window.localStorage.getItem(APPLICATIONS_KEY);

    return rawValue ? JSON.parse(rawValue) as StudioApplicationDraft[] : [];
  } catch {
    return [];
  }
}
