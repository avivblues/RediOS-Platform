import { useState } from 'react';
import type { ApplicationDefinition, EntityDefinition, MetadataDefinition } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import { humanizeCode, humanizeMetadata } from '../humanizer/HumanizerEngine';
import { ApplicationHealthIndicator, applicationHealthChecks } from '../readiness/ApplicationHealthIndicator';
import { StudioPanel } from '../design-system/StudioDesignSystem';
import { createApplicationJourney, createStarterJourney } from '../journey/JourneyEngine';
import { JourneyProgress } from '../journey/JourneyProgress';

export function StudioHome({
  tree,
  applications,
  entities,
  runtimeStatus,
  onSelect,
}: {
  tree: MetadataDebugTree;
  applications: Array<MetadataDefinition<ApplicationDefinition>>;
  entities: EntityDefinition[];
  runtimeStatus?: string;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  const [starterJourney, setStarterJourney] = useState(() => createStarterJourney('Start Blank'));

  function startJourney(starter: HomeStarter) {
    window.localStorage.setItem('redios:studio:starter', starter.template);
    setStarterJourney(createStarterJourney(starter.title));
    onSelect({ type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' });
  }

  return (
    <div className="studio-home">
      <section className="studio-hero">
        <div>
          <span className="studio-kicker">Selamat datang di RediOS Studio</span>
          <h2>Apa yang ingin kamu buat?</h2>
          <p className="studio-muted">Pilih kebutuhan bisnis, lalu RediOS akan memandu dari ide sampai aplikasi siap digunakan.</p>
        </div>
      </section>

      <div className="studio-card-grid">
        {homeStarters.map((starter) => (
          <button
            key={starter.template}
            className="studio-ds-card studio-ds-card-interactive studio-home-starter"
            type="button"
            onClick={() => startJourney(starter)}
            title={starter.tooltip}
            data-tooltip={starter.tooltip}
          >
            <span className="studio-home-icon">{starter.icon}</span>
            <strong>{starter.title}</strong>
            <span className="studio-muted">{starter.description}</span>
          </button>
        ))}
      </div>

      <JourneyProgress journey={starterJourney} onSelect={onSelect} compact />

      <StudioPanel title="Aplikasi Anda">
        <div className="studio-card-grid">
          {applications.length === 0 ? (
            <EmptyWorkspaceCards onSelect={onSelect} />
          ) : null}
          {applications.map((metadata) => {
            const app = metadata.definition;
            const appEntities = entities.filter((entity) => app.entityCodes.includes(entity.code));
            const workflowCount = new Set(appEntities.map((entity) => entity.workflowCode).filter(Boolean)).size;
            const human = humanizeMetadata(app.code, 'APPLICATION', app.description);

            return (
              <article key={app.code} className="studio-app-card">
                <span className="studio-kicker">{human.icon}</span>
                <h3>{app.name || human.label}</h3>
                <p>{app.description ?? human.description}</p>
                <div className="studio-muted">{app.entityCodes.length} Data Object</div>
                <div className="studio-muted">{tree.forms.length} Screen</div>
                <div className="studio-muted">{workflowCount} Process</div>
                <ApplicationHealthIndicator
                  checks={applicationHealthChecks({
                    dataCount: app.entityCodes.length,
                    screenCount: tree.forms.length + tree.ui.length,
                    securityReady: true,
                    processCount: workflowCount,
                  })}
                />
                <JourneyProgress
                  journey={createApplicationJourney({ application: metadata, entities, tree, launched: app.enabled || runtimeStatus === 'ACTIVE' })}
                  onSelect={onSelect}
                  compact
                />
                <strong>{app.enabled ? 'Launched' : 'In progress'}</strong>
                <div className="studio-action-row">
                  <Button onClick={() => onSelect({ type: 'APPLICATION_BUILDER', code: app.code })} tooltip={`Ubah data, layar, alur kerja, dan izin akses untuk ${app.name || human.label}.`}>Customize</Button>
                </div>
              </article>
            );
          })}
        </div>
      </StudioPanel>
    </div>
  );
}

function EmptyWorkspaceCards({ onSelect }: { onSelect: (selection: ExplorerSelection) => void }) {
  return (
    <section className="studio-empty-workspace">
      <h3>Anda belum membuat apa pun.</h3>
      <p className="studio-muted">Mulai dengan membuat Data Object pertama. Contoh: Product, Customer, Asset.</p>
      <div className="studio-card-grid">
        {homeStarters.map((starter) => (
          <button
            key={starter.template}
            className="studio-ds-card studio-ds-card-interactive"
            type="button"
            onClick={() => onSelect({ type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' })}
            title={starter.tooltip}
            data-tooltip={starter.tooltip}
          >
            <strong>{starter.title}</strong>
            <span className="studio-muted">Mulai panduan pembuatan</span>
          </button>
        ))}
      </div>
    </section>
  );
}

interface HomeStarter {
  icon: string;
  title: string;
  template: string;
  description: string;
  tooltip: string;
}

const homeStarters: HomeStarter[] = [
  {
    icon: '📦',
    title: 'Manage Inventory',
    template: 'Inventory',
    description: 'Kelola produk, stok, lokasi, dan pemasok.',
    tooltip: 'Mulai aplikasi inventory dengan contoh Product, SKU, Stock, dan Location.',
  },
  {
    icon: '👥',
    title: 'Manage Customers',
    template: 'CRM',
    description: 'Kelola pelanggan, kontak, dan aktivitas follow-up.',
    tooltip: 'Mulai aplikasi customer management dengan contoh Name, Email, dan Phone.',
  },
  {
    icon: '🛠',
    title: 'Track Assets',
    template: 'Asset Tracking',
    description: 'Lacak aset, lokasi, kondisi, dan perawatan.',
    tooltip: 'Mulai aplikasi asset tracking dengan contoh Asset, Serial Number, dan Status.',
  },
  {
    icon: '📝',
    title: 'Start Blank',
    template: 'Blank App',
    description: 'Mulai kosong dan tentukan sendiri data bisnisnya.',
    tooltip: 'Mulai dari aplikasi kosong dengan panduan langkah demi langkah.',
  },
];
