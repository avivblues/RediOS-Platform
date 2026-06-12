import { useState } from 'react';
import type { StudioTarget } from '../builder/types';
import { AdminGuidePanel, HelpTip } from '../guide/AdminGuide';
import { toMetadataCode } from '../metadata/metadata-store';

interface StudioApplicationDraft {
  code: string;
  name: string;
  template: string;
  target: StudioTarget;
  createdAt: string;
}

const APPLICATIONS_KEY = 'redios:studio:applications';

const templates = [
  {
    code: 'BLANK_EXPERIENCE',
    label: 'Blank Experience',
    description: 'Start with an empty screen and compose everything visually.',
  },
  {
    code: 'INVENTORY_EXPERIENCE',
    label: 'Inventory Experience',
    description: 'Product screen, stock action, inventory data, and starter dashboard.',
  },
  {
    code: 'SERVICE_EXPERIENCE',
    label: 'Service Experience',
    description: 'Ticket intake, assignment action, status timeline, and mobile-ready field flow.',
  },
];

export function CreateApplicationPage() {
  const [name, setName] = useState('Asset Maintenance');
  const [template, setTemplate] = useState(templates[1].code);
  const [target, setTarget] = useState<StudioTarget>('web');
  const selectedTemplate = templates.find((item) => item.code === template) ?? templates[0];

  function createApplication() {
    const nextApp: StudioApplicationDraft = {
      code: toMetadataCode(name),
      name: name.trim() || 'New Application',
      template,
      target,
      createdAt: new Date().toISOString(),
    };
    const currentApps = loadApplications();
    window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([nextApp, ...currentApps.filter((app) => app.code !== nextApp.code)]));
    window.localStorage.setItem(`redios:studio:active-app:${target}`, nextApp.code);
    window.location.href = target === 'android' ? '/studio/builder/android' : '/studio/builder/web';
  }

  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">Create Application</span>
          <h1>Buat Aplikasi dari Experience</h1>
          <p>Admin cukup memberi nama aplikasi, memilih starter, lalu mendesain layar secara visual.</p>
        </div>
        <div className="redos-actions">
          <button data-redos-tooltip="Kembali ke canvas builder untuk menyusun layar aplikasi." type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
          <button data-redos-tooltip="Advanced Mode untuk admin teknis: Data, Action, Connector, dan Organism." type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata</button>
        </div>
      </header>

      <AdminGuidePanel
        title="Cara tercepat membuat aplikasi"
        description="Ikuti alur ini tanpa perlu membuat database, endpoint, atau kode manual."
        steps={[
          'Tulis nama aplikasi sesuai proses bisnis.',
          'Pilih target Web atau Android.',
          'Pilih starter experience atau Blank Experience.',
          'Klik Create and Open Builder, lalu susun screen dengan drag and drop.',
        ]}
      />

      <section className="redos-create-flow">
        <div className="redos-metadata-card">
          <div className="redos-panel-heading">
            <span className="redos-kicker">Step 1</span>
            <h3>Identitas Aplikasi <HelpTip label="Identitas aplikasi" text="Nama ini dipakai agar admin dan user bisnis mudah mengenali aplikasi yang sedang dibuat." /></h3>
            <p>Mulai dari kebutuhan user, bukan dari struktur database.</p>
          </div>
          <label>
            Application Name <HelpTip label="Application Name" text="Gunakan nama proses bisnis, misalnya Asset Maintenance atau Inventory Request." />
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Runtime Target <HelpTip label="Runtime Target" text="Pilih Web untuk aplikasi browser, Android untuk pengalaman mobile dengan device capability." />
            <select value={target} onChange={(event) => setTarget(event.target.value as StudioTarget)}>
              <option value="web">Web</option>
              <option value="android">Android</option>
            </select>
          </label>
        </div>

        <div className="redos-metadata-card redos-metadata-card-wide">
          <div className="redos-panel-heading">
            <span className="redos-kicker">Step 2</span>
            <h3>Pilih Starter Experience <HelpTip label="Starter Experience" text="Template membuat screen, data, action, dan connector awal di belakang layar." /></h3>
            <p>Template membantu admin mulai dari contoh pengalaman kerja yang sudah siap diedit.</p>
          </div>
          <div className="redos-template-grid">
            {templates.map((item) => (
              <button
                key={item.code}
                className={template === item.code ? 'redos-template-card redos-template-card-active' : 'redos-template-card'}
                type="button"
                data-redos-tooltip={`Pilih ${item.label}: ${item.description}`}
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
            <h3>Bangun Secara Visual <HelpTip label="Visual Builder" text="Setelah dibuat, admin tinggal drag component, bind data, dan pilih action." /></h3>
            <p>{selectedTemplate.label} akan dibuka di {target === 'android' ? 'Android' : 'Web'} builder.</p>
          </div>
          <div className="redos-organism-preview-card">
            <strong>{name || 'New Application'}</strong>
            <p>{selectedTemplate.description}</p>
            <div>Screen → Components → Data Binding → Action → Runtime</div>
          </div>
          <button className="redos-primary-action" data-redos-tooltip="Buat draft aplikasi dan lanjut ke canvas visual builder." type="button" onClick={createApplication}>
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
