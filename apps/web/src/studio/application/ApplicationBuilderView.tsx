import type { ApplicationDefinition, EntityDefinition, MetadataDefinition } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import { GuidedHint } from '../help/GuidedHint';
import { HelpTooltip } from '../help/HelpTooltip';
import { LearningPanel } from '../help/LearningPanel';
import { StudioLearningCoach } from '../help/StudioLearningCoach';
import { humanizeCode } from '../humanizer/HumanizerEngine';
import { createApplicationJourney } from '../journey/JourneyEngine';
import { JourneyProgress } from '../journey/JourneyProgress';

export function ApplicationBuilderView({
  application,
  entities,
  tree,
  onSelect,
}: {
  application: MetadataDefinition<ApplicationDefinition>;
  entities: EntityDefinition[];
  tree: MetadataDebugTree;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  const definition = application.definition;
  const appEntities = entities.filter((entity) => definition.entityCodes.includes(entity.code));
  const workflowCode = appEntities.find((entity) => entity.workflowCode)?.workflowCode ?? tree.workflows[0];
  const journey = createApplicationJourney({ application, entities, tree, launched: definition.enabled });

  return (
    <div className="studio-app-builder">
      <div className="studio-breadcrumb">
        <span>Studio</span>
        <span>Applications</span>
        <strong>{definition.name || humanizeCode(definition.code)}</strong>
      </div>
      <section className="studio-hero">
        <div>
          <span className="studio-kicker">Application Journey</span>
          <h2>{definition.name || humanizeCode(definition.code)}</h2>
          <p className="studio-muted">{definition.description ?? 'Pilih data yang disimpan, layar yang dilihat pengguna, proses bisnis, izin akses, lalu launch.'}</p>
        </div>
      </section>

      <JourneyProgress journey={journey} onSelect={onSelect} />

      <LearningPanel title="Cara mengubah aplikasi" summary="Mulai dari data bisnis, lalu sesuaikan layar yang digunakan pengguna. Pratinjau dampak sebelum launch.">
        <GuidedHint title="Jalur yang disarankan">Buka Data Object terlebih dahulu, cek informasi yang disimpan, lalu buka Screen untuk mengatur cara pengguna mengisinya.</GuidedHint>
      </LearningPanel>
      <StudioLearningCoach
        title="Cara mengubah aplikasi ini"
        purpose="Gunakan halaman ini seperti peta. Pilih bagian aplikasi yang ingin diubah, lalu RediOS membuka builder yang sesuai."
        steps={[
          { title: '1. Data Object', body: 'Gunakan ini untuk memahami informasi yang disimpan aplikasi.' },
          { title: '2. Screen', body: 'Gunakan ini untuk mengubah tampilan saat pengguna menambah atau mengedit informasi.' },
          { title: '3. Process', body: 'Gunakan ini ketika pekerjaan butuh approval, perubahan status, atau tahapan kerja.' },
          { title: '4. Permission', body: 'Gunakan ini untuk mengatur siapa yang boleh melihat atau mengubah aplikasi.' },
        ]}
        currentTip={journey.nextAction.description}
      />
      <Panel title="Builder">
        <div className="studio-card-grid">
          <BuilderCard title="Data Object" category="Data" description="Hal yang dikelola bisnis, seperti Product, Asset, atau Customer." help="Mulai dari sini saat ingin menambah atau memahami informasi yang disimpan aplikasi." onClick={() => onSelect({ type: 'ENTITY', code: definition.entityCodes[0] ?? tree.entities[0] ?? 'ENTITY' })} />
          <BuilderCard title="Screen" category="Experience" description="Tempat pengguna memasukkan dan memperbarui informasi." help="Buka bagian ini saat pengguna membutuhkan layar input atau tata letak yang lebih baik." onClick={() => onSelect({ type: 'FORMS', code: tree.forms[0] ?? 'FORMS' })} />
          <BuilderCard title="Page" category="Experience" description="Halaman yang dibuka pengguna di aplikasi." help="Gunakan halaman untuk mengatur daftar, input, dan dashboard aplikasi." onClick={() => onSelect({ type: 'PAGES', code: tree.ui[0] ?? 'PAGES' })} />
          <BuilderCard title="Process" category="Automation" description="Cara pekerjaan bergerak dari satu langkah ke langkah lain." help="Gunakan ini untuk persetujuan, perubahan status, dan alur kerja." onClick={() => onSelect({ type: 'WORKFLOWS', code: workflowCode ?? 'WORKFLOWS' })} />
          <BuilderCard title="Connector" category="Automation" description="Cara aplikasi bertukar data dengan sistem lain." help="Gunakan ini untuk menghubungkan aplikasi dengan sistem lain." onClick={() => onSelect({ type: 'INTEGRATIONS', code: tree.integrations[0] ?? 'INTEGRATIONS' })} />
          <BuilderCard title="Permission" category="Security" description="Siapa yang boleh melihat, mengubah, atau launch aplikasi." help="Gunakan izin akses untuk menjaga data bisnis tetap aman." onClick={() => onSelect({ type: 'SECURITY', code: tree.securityPolicies[0] ?? 'SECURITY' })} />
        </div>
      </Panel>
      <Panel title="Data Object">
        <div className="studio-card-grid">
          {appEntities.map((entity) => (
            <button key={entity.code} className="studio-app-card" onClick={() => onSelect({ type: 'ENTITY', code: entity.code })}>
              <span className="studio-kicker">Data Object</span>
              <h3>{humanizeCode(entity.code)}</h3>
              <p className="studio-muted">{entity.fieldCodes.length} informasi</p>
              <strong>Buka Screen Builder</strong>
            </button>
          ))}
          {appEntities.length === 0 ? (
            <GuidedHint title="Anda belum membuat apa pun.">Mulai dengan membuat Data Object pertama. Contoh: Product, Customer, Asset.</GuidedHint>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function BuilderCard({
  category,
  title,
  description,
  help,
  onClick,
}: {
  category: string;
  title: string;
  description: string;
  help: string;
  onClick: () => void;
}) {
  return (
    <article className="studio-app-card">
      <span className="studio-kicker">{category}</span>
      <h3>
        {title}
        <HelpTooltip label={title}>{help}</HelpTooltip>
      </h3>
      <p>{description}</p>
      <Button onClick={onClick} tooltip={help}>Open</Button>
    </article>
  );
}
