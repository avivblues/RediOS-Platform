import { useMemo, useState } from 'react';
import type { MetadataDefinition } from '@redios/shared';
import type { DesignerClient } from '../../core/api/designer-client';
import { ApiClientError } from '../../core/api/api-client';
import type { RuntimeContext } from '../../core/renderer/runtime-types';
import { Input, Select } from '../../components/atomic/atoms/Atoms';
import { FieldBuilder } from '../field-builder/FieldBuilder';
import { HelpTooltip } from '../help/HelpTooltip';
import { ConceptCard } from '../help/ConceptCard';
import { LearningPanel } from '../help/LearningPanel';
import { StudioLearningCoach } from '../help/StudioLearningCoach';
import { GuidedHint } from '../help/GuidedHint';
import { FirstTimeStudioTour } from '../onboarding/FirstTimeStudioTour';
import { humanizeCode } from '../humanizer/HumanizerEngine';
import { ApplicationHealthIndicator, applicationHealthChecks } from '../readiness/ApplicationHealthIndicator';
import { suggestInformationForObject } from '../suggestions/StudioSuggestionEngine';
import { pluralTerm, term, terminologyMode } from '../terminology/terminology.service';
import { StudioActivityTimeline, type StudioActivityItem } from '../activity/StudioActivityTimeline';
import { MetadataEditor } from '../editor/MetadataEditor';
import { ScreenDesigner } from '../screen-designer/ScreenDesigner';
import type { DesignedScreenLayout } from '../screen-designer/screen-designer-types';
import {
  StudioBadge,
  StudioButton,
  StudioCard,
  StudioEmptyState,
  StudioPanel,
  StudioStepper,
} from '../design-system/StudioDesignSystem';
import {
  createInitialCreationDraft,
  type CreationDraft,
  type CreationEntityInput,
  type CreationFieldInput,
  type GeneratedMetadataSet,
} from './creation-types';
import { codeFromLabel, generateMetadataSet } from './metadata-generator';

const simpleSteps = ['Application', 'Data Object', 'Design Screen', 'Workflow', 'Launch'];
const appStarterCards = [
  { label: 'Inventory', icon: 'BOX', description: 'Kelola produk, stok, pemasok, dan pergerakan barang.' },
  { label: 'CRM', icon: 'PEOPLE', description: 'Kelola pelanggan, kontak, dan aktivitas penjualan.' },
  { label: 'Asset Management', icon: 'TOOLS', description: 'Kelola aset, perawatan, dan pekerjaan lapangan.' },
  { label: 'Helpdesk', icon: 'HEADSET', description: 'Kelola permintaan bantuan dan tindak lanjut tim.' },
  { label: 'Blank App', icon: 'SPARK', description: 'Mulai dari aplikasi kosong.' },
];

function createDraftFromStarter(): CreationDraft {
  const draft = createInitialCreationDraft();

  try {
    const starter = window.localStorage.getItem('redios:studio:starter');

    if (starter && starter !== 'Blank App') {
      return {
        ...draft,
        application: {
          ...draft.application,
          name: `${starter} App`,
          description: appStarterCards.find((card) => card.label === starter)?.description ?? `Create ${starter} application`,
          startFrom: 'Template',
        },
      };
    }
  } catch {
    return draft;
  }

  return draft;
}

export function CreationWizard({
  designer,
  context,
  expertMode = false,
}: {
  designer: DesignerClient;
  context: RuntimeContext;
  expertMode?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CreationDraft>(() => createDraftFromStarter());
  const [selectedEntityIndex, setSelectedEntityIndex] = useState(0);
  const [activity, setActivity] = useState<StudioActivityItem[]>([]);
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'live'>('idle');
  const [publishError, setPublishError] = useState<{ title: string; reason: string } | undefined>();
  const [lockedMessage, setLockedMessage] = useState<string | undefined>();
  const mode = terminologyMode(expertMode);
  const steps = expertMode
    ? [term('APPLICATION', mode), term('ENTITY', mode), term('FIELD', mode), term('FORM', mode), term('WORKFLOW', mode), 'Publish']
    : simpleSteps;
  const generated = useMemo(
    () =>
      generateMetadataSet(draft, {
        tenantId: context.tenantId,
        domainCode: context.domainCode,
        applicationCode: codeFromLabel(draft.application.name || context.applicationCode),
      }),
    [context, draft],
  );
  const selectedEntity = draft.entities[selectedEntityIndex];
  const canUseStep = (index: number) => index <= highestUnlockedStep(draft, expertMode);
  const informationStepIndex = 2;
  const screenStepIndex = expertMode ? 3 : 2;
  const processStepIndex = expertMode ? 4 : 3;
  const launchStepIndex = expertMode ? 5 : 4;

  function goToStep(index: number) {
    if (!canUseStep(index)) {
      setLockedMessage(lockedStepMessage(index, draft, expertMode));
      return;
    }

    setLockedMessage(undefined);
    setStep(index);
  }

  function updateApplication(next: Partial<CreationDraft['application']>) {
    setDraft((current) => ({ ...current, application: { ...current.application, ...next } }));
  }

  function chooseStarter(label: string) {
    updateApplication({
      name: label === 'Blank App' ? draft.application.name : `${label} App`,
      description: appStarterCards.find((card) => card.label === label)?.description,
      startFrom: label === 'Blank App' ? 'Blank' : 'Template',
    });
    pushActivity(`Starter selected: ${label}`, expertMode ? 'Application metadata draft initialized.' : 'Rancangan aplikasi dimulai.');
  }

  function addEntity(entity: CreationEntityInput) {
    setDraft((current) => ({ ...current, entities: [...current.entities, entity] }));
    setSelectedEntityIndex(draft.entities.length);
    pushActivity(`${term('ENTITY', mode)} added: ${entity.name}`, expertMode ? 'ENTITY metadata generated in Studio draft.' : 'Struktur data bisnis siap diisi informasi.');
  }

  function addField(field: CreationFieldInput) {
    setDraft((current) => ({
      ...current,
      entities: current.entities.map((entity, index) => (index === selectedEntityIndex ? { ...entity, fields: [...entity.fields, field] } : entity)),
    }));
    pushActivity(`${term('FIELD', mode)} added: ${field.label}`, expertMode ? `${field.type} field queued for ${selectedEntity?.name ?? 'object'}.` : `${field.label} akan muncul di layar ${selectedEntity?.name ?? 'data ini'}.`);
  }

  function addSuggestedField(label: string, type: CreationFieldInput['type'] = 'Text') {
    addField({
      label,
      type,
      required: label === 'Product Name',
      unique: false,
    });
  }

  function addSuggestedFieldToEntity(entityIndex: number, field: CreationFieldInput) {
    setDraft((current) => ({
      ...current,
      entities: current.entities.map((entity, index) => (index === entityIndex ? { ...entity, fields: [...entity.fields, field] } : entity)),
    }));
    setSelectedEntityIndex(entityIndex);
    pushActivity(`${term('FIELD', mode)} added: ${field.label}`, `${field.label} akan muncul di ${draft.entities[entityIndex]?.name ?? 'data ini'}.`);
  }

  function generateExperience(layout?: DesignedScreenLayout, silent = false) {
    setDraft((current) => {
      const nextEntities = layout
        ? current.entities.map((entity) => {
            if (entity.name !== layout.entityName) {
              return entity;
            }

            const screenFields = layout.sections.flatMap((section) => section.fields);
            return {
              ...entity,
              fields: entity.fields.map((field) => {
                const screenField = screenFields.find((candidate) => (candidate.sourceLabel ?? candidate.label) === field.label);

                return screenField
                  ? {
                      ...field,
                      required: screenField.required ?? field.required,
                      searchable: screenField.searchable ?? field.searchable,
                      showInList: screenField.showInList ?? field.showInList,
                    }
                  : field;
              }),
            };
          })
        : current.entities;
      const nextDraft = {
        ...current,
        entities: nextEntities,
        screenLayouts: layout
          ? {
              ...current.screenLayouts,
              [layout.entityName]: {
                screen: layout.screen,
                entityName: layout.entityName,
                sections: layout.sections.map((section) => ({
                  title: section.title,
                  columns: section.columns,
                  fields: section.fields.map((field) => ({
                    label: field.label,
                    sourceLabel: field.sourceLabel,
                    required: field.required,
                    readonly: field.readonly,
                    visible: field.visible,
                    width: field.width,
                    showInList: field.showInList,
                    searchable: field.searchable,
                  })),
                })),
              },
            }
          : current.screenLayouts,
        forms: generated.forms.map((form) => form.code),
        views: generated.views.map((view) => view.code),
        navigation: generated.navigation ? [generated.navigation.code] : [],
        generated,
      };

      const nextGenerated = generateMetadataSet(nextDraft, {
        tenantId: context.tenantId,
        domainCode: context.domainCode,
        applicationCode: codeFromLabel(nextDraft.application.name || context.applicationCode),
      });

      return {
        ...nextDraft,
        forms: nextGenerated.forms.map((form) => form.code),
        views: nextGenerated.views.map((view) => view.code),
        navigation: nextGenerated.navigation ? [nextGenerated.navigation.code] : [],
        generated: nextGenerated,
      };
    });
    if (!silent) {
      pushActivity(expertMode ? 'Experience generated' : 'Layar dibuat', expertMode ? 'Forms, list views, detail pages, navigation, and API-ready metadata generated.' : 'Screen, daftar, dan menu sudah siap.');
    }
  }

  function addInformationInDesigner(field: CreationFieldInput, layout: DesignedScreenLayout) {
    setDraft((current) => {
      const nextDraft = {
        ...current,
        entities: current.entities.map((entity, index) => {
          if (index !== selectedEntityIndex || entity.fields.some((candidate) => candidate.label === field.label)) {
            return entity;
          }

          return {
            ...entity,
            fields: [...entity.fields, field],
          };
        }),
        screenLayouts: {
          ...current.screenLayouts,
          [layout.entityName]: {
            screen: layout.screen,
            entityName: layout.entityName,
            sections: layout.sections.map((section) => ({
              title: section.title,
              columns: section.columns,
              fields: section.fields.map((screenField) => ({
                label: screenField.label,
                sourceLabel: screenField.sourceLabel,
                required: screenField.required,
                readonly: screenField.readonly,
                visible: screenField.visible,
                width: screenField.width,
                showInList: screenField.showInList,
                searchable: screenField.searchable,
              })),
            })),
          },
        },
      };
      const nextGenerated = generateMetadataSet(nextDraft, {
        tenantId: context.tenantId,
        domainCode: context.domainCode,
        applicationCode: codeFromLabel(nextDraft.application.name || context.applicationCode),
      });

      return {
        ...nextDraft,
        forms: nextGenerated.forms.map((form) => form.code),
        views: nextGenerated.views.map((view) => view.code),
        navigation: nextGenerated.navigation ? [nextGenerated.navigation.code] : [],
        generated: nextGenerated,
      };
    });
    pushActivity(`${term('FIELD', mode)} added: ${field.label}`, `${field.label} langsung muncul di screen ${layout.entityName}.`);
  }

  async function publish() {
    setPublishState('publishing');
    setPublishError(undefined);
    pushActivity(expertMode ? 'Designer publish started' : 'Launch dimulai', expertMode ? 'Generated metadata submitted to Designer Publish API.' : 'RediOS sedang menyiapkan aplikasi untuk pengguna.');

    try {
      const result = await designer.publishGenerated(metadataForPublish(generated));
      const runtimePackage = result.runtimePackages.find((candidate) => candidate.applicationCode === generated.application?.code);
      setPublishState('live');
      pushActivity(expertMode ? `${term('RUNTIME_PACKAGE', mode)} activated` : 'Application launched', `${runtimePackage?.applicationCode ?? generated.application?.code} is ${runtimePackage?.status ?? 'ACTIVE'}.`);
    } catch (error) {
      setPublishState('idle');
      setPublishError(humanizeLaunchError(error));
      pushActivity(expertMode ? 'Publish failed' : 'Launch needs attention', expertMode ? 'Designer validation blocked runtime activation.' : 'A rule or connection needs review before this application can launch.');
    }
  }

  function pushActivity(message: string, detail?: string) {
    setActivity((current) => [{ id: `${Date.now()}:${message}`, message, detail }, ...current].slice(0, 8));
  }

  return (
    <MetadataEditor
      definition={{
        mode: 'CREATE',
        title: 'Buat Aplikasi',
        subtitle: 'RediOS memandu dari ide, data, layar, proses, sampai aplikasi siap digunakan.',
        status: <StudioBadge tone={isReviewComplete(draft) ? 'success' : 'info'}>{calculateReadiness(draft, publishState === 'live', expertMode).percentage}% ready</StudioBadge>,
      }}
    >
    <div className="studio-create-grid">
      <StudioPanel title="Create Application">
        <FirstTimeStudioTour />
        <StudioLearningCoach
          title="How to create an application"
          purpose="RediOS asks you to describe your business app first, then it creates the screens and live application from that description."
          steps={[
            { title: '1. Name the app', body: 'Choose what you want to build, such as Inventory or CRM.' },
            { title: '2. Add Data Objects', body: 'Create the things your business manages, such as Product, Customer, Asset, or Order.' },
            { title: '3. Design Screen', body: 'Add information directly on the screen, arrange it, and preview it.' },
            { title: '4. Workflow', body: 'Keep process simple for launch, then improve it later.' },
            { title: '5. Launch', body: 'RediOS checks readiness, prepares the version, and opens the app.' },
          ]}
          currentTip={nextRecommendedAction(step, draft, expertMode)}
        />
        <StepExplanation step={step} draft={draft} expertMode={expertMode} />
        <StudioStepper steps={steps} activeIndex={step} isStepEnabled={canUseStep} onStepClick={goToStep} onLockedStep={() => setLockedMessage(lockedStepMessage(step + 1, draft, expertMode))} />
        {lockedMessage ? <div className="studio-inline-warning">{lockedMessage}</div> : null}

        {step === 0 ? (
          <ApplicationStep draft={draft} onStarterSelect={chooseStarter} onChange={updateApplication} />
        ) : null}

        {step === 1 ? <DataModelStep onAddEntity={addEntity} entities={draft.entities} expertMode={expertMode} /> : null}

        {expertMode && step === informationStepIndex ? (
          <section className="studio-wizard-body">
            <div className="studio-section-header">
              <div>
                <h3>
                  {selectedEntity ? `What information does ${selectedEntity.name} contain?` : term('FIELD', mode)}
                  <HelpTooltip label={term('FIELD', mode)}>Information is a detail stored inside your object. Example: Product Name, Price, Stock.</HelpTooltip>
                </h3>
                <p className="studio-muted">Add the details users need to capture and see.</p>
              </div>
            </div>
            {draft.entities.length > 1 ? (
              <Select
                value={`${selectedEntityIndex}:${selectedEntity?.name ?? ''}`}
                options={draft.entities.map((entity, index) => `${index}:${entity.name}`)}
                onChange={(value) => setSelectedEntityIndex(Number(value.split(':')[0]))}
              />
            ) : null}
            <InformationCompletionChecklist draft={draft} onAddSuggestion={addSuggestedFieldToEntity} />
            {selectedEntity ? (
              <>
                {selectedEntity.fields.length === 0 ? (
                  <StudioEmptyState
                    title="You haven't created anything yet."
                    description={`Information describes what is stored in ${selectedEntity.name}. Examples: Product Name, Price, Quantity.`}
                    action={<StudioButton onClick={() => addSuggestedField('Product Name')} tooltip={`Tambah contoh informasi pertama untuk ${selectedEntity.name}, supaya bisa lanjut ke desain layar.`}>Add Information</StudioButton>}
                  />
                ) : null}
                <FieldBuilder entities={draft.entities} objectName={selectedEntity.name} onAddField={addField} expertMode={expertMode} />
              </>
            ) : (
              <StudioEmptyState title="Create a data object first" description="You need at least one Data Object before adding information." />
            )}
          </section>
        ) : null}

        {step === screenStepIndex ? (
          <section className="studio-wizard-body">
            <h3>
              {expertMode ? 'FORM metadata' : 'Screen Design'}
              <HelpTooltip label="Screen">A screen is what users see when entering or viewing data.</HelpTooltip>
            </h3>
            <p className="studio-muted">How should users enter and view this data?</p>
            {selectedEntity ? (
              <ScreenDesigner
                key={selectedEntity.name}
                entity={selectedEntity}
                expertMode={expertMode}
                onApply={(layout) => generateExperience(layout)}
                onLayoutChange={(layout) => generateExperience(layout, true)}
                onAddInformation={addInformationInDesigner}
              />
            ) : null}
            {!selectedEntity ? (
              <StudioButton
                onClick={() => generateExperience()}
                disabled={!isFieldsComplete(draft)}
                tooltip={isFieldsComplete(draft) ? 'Buat layar input, layar daftar, dan menu dari informasi yang sudah kamu isi.' : 'Lengkapi minimal satu informasi untuk setiap data dulu.'}
              >
                Design Screens
              </StudioButton>
            ) : null}
          </section>
        ) : null}

        {step === processStepIndex ? <ReviewStep draft={{ ...draft, generated }} expertMode={expertMode} /> : null}

        {step === launchStepIndex ? (
          <section className="studio-wizard-body">
            {publishState === 'live' ? (
              <StudioCard>
                <h3>Application Ready 🚀</h3>
                <p className="studio-muted">
                  {expertMode ? 'Publish saved definitions, compiled the package, and prepared the generated application route.' : 'Aplikasi sudah siap digunakan.'}
                </p>
                <ReadinessMeter draft={{ ...draft, generated }} runtimeCompiled expertMode={expertMode} />
                <div className="studio-action-row">
                  <StudioButton
                    onClick={() => { window.location.href = `/apps/${generated.application?.code ?? codeFromLabel(draft.application.name)}`; }}
                    tooltip="Buka aplikasi yang sudah aktif dan siap digunakan."
                  >
                    Open Application
                  </StudioButton>
                  <StudioButton variant="secondary" onClick={() => setStep(processStepIndex)} tooltip="Kembali ke halaman pemeriksaan jika masih ingin memperbaiki aplikasi.">
                    Continue Editing
                  </StudioButton>
                </div>
              </StudioCard>
            ) : (
              <>
                <h3>
                  {expertMode ? 'Before Publish' : 'Launch Application 🚀'}
                  <HelpTooltip label={expertMode ? 'Publish' : 'Launch'}>Launch prepares your application so users can start using it.</HelpTooltip>
                </h3>
                {publishState === 'publishing' ? <LaunchProgress /> : null}
                <ApplicationHealthIndicator
                  checks={applicationHealthChecks({
                    dataCount: draft.entities.length,
                    screenCount: draft.forms.length + draft.views.length,
                    securityReady: true,
                    processCount: 0,
                  })}
                />
                <ReadinessMeter draft={{ ...draft, generated }} runtimeCompiled={false} expertMode={expertMode} />
                <BuildCounts draft={{ ...draft, generated }} expertMode={expertMode} />
                {publishError ? (
                  <div className="studio-inline-danger">
                    <strong>{publishError.title}</strong>
                    <p>{publishError.reason}</p>
                    <StudioButton variant="secondary" onClick={() => generateExperience()} tooltip="RediOS akan membuat screen dan menu yang hilang secara otomatis.">
                      Fix automatically
                    </StudioButton>
                  </div>
                ) : null}
                <StudioButton
                  onClick={() => void publish()}
                  disabled={!isReviewComplete(draft)}
                  tooltip={isReviewComplete(draft) ? 'Periksa kesiapan, terbitkan versi, lalu aktifkan aplikasi.' : 'Lengkapi aplikasi, data, informasi, dan layar dulu sebelum diluncurkan.'}
                >
                  {publishState === 'publishing' ? (expertMode ? 'Publishing...' : 'Preparing application...') : expertMode ? 'Publish Application' : 'Launch Application 🚀'}
                </StudioButton>
              </>
            )}
          </section>
        ) : null}

        <div className="studio-action-row">
          <StudioButton variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} tooltip="Kembali ke langkah sebelumnya.">
            Back
          </StudioButton>
          <StudioButton
            onClick={() => goToStep(Math.min(steps.length - 1, step + 1))}
            disabled={step === steps.length - 1}
            tooltip={canUseStep(Math.min(steps.length - 1, step + 1)) ? 'Lanjut ke langkah berikutnya.' : lockedStepMessage(step + 1, draft, expertMode)}
          >
            Next
          </StudioButton>
        </div>
      </StudioPanel>

      <BuildPreviewPanel draft={{ ...draft, generated }} expertMode={expertMode} />
      <RecommendedNextStep draft={draft} selectedEntity={selectedEntity} onSuggestField={addSuggestedField} />
      <LearningPanel title={learningTitle(step, expertMode)} summary={learningSummary(step, draft, expertMode)}>
        <GuidedHint title="Next recommended action">{nextRecommendedAction(step, draft, expertMode)}</GuidedHint>
      </LearningPanel>
      <StudioActivityTimeline items={activity} />
    </div>
    </MetadataEditor>
  );
}

function ApplicationStep({
  draft,
  onStarterSelect,
  onChange,
}: {
  draft: CreationDraft;
  onStarterSelect: (label: string) => void;
  onChange: (next: Partial<CreationDraft['application']>) => void;
}) {
  return (
    <section className="studio-wizard-body">
      <h3>
        What do you want to build?
        <HelpTooltip label="Application">An application groups data objects, screens, automation, and navigation into one place.</HelpTooltip>
      </h3>
      <div className="studio-card-grid">
        {appStarterCards.map((card) => (
          <StudioCard key={card.label} interactive onClick={() => onStarterSelect(card.label)} tooltip={`Pilih awal ${card.label} untuk mengisi contoh nama dan deskripsi aplikasi.`}>
            <span className="studio-kicker">{card.icon}</span>
            <h4>{card.label}</h4>
            <p>{card.description}</p>
          </StudioCard>
        ))}
      </div>
      <h3>Application Name</h3>
      <Input value={draft.application.name} placeholder="Warehouse Management" onChange={(name) => onChange({ name })} />
      <Input value={draft.application.description ?? ''} placeholder="Manage inventory" onChange={(description) => onChange({ description })} />
    </section>
  );
}

function DataModelStep({
  entities,
  onAddEntity,
  expertMode,
}: {
  entities: CreationEntityInput[];
  onAddEntity: (entity: CreationEntityInput) => void;
  expertMode: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const examples = ['Product', 'Customer', 'Asset', 'Order'];
  const mode = terminologyMode(expertMode);

  return (
    <section className="studio-wizard-body">
      {entities.length === 0 ? (
        <StudioEmptyState
          title={`Create your first ${term('ENTITY', mode)}`}
          description="What information do you want to manage?"
          action={<StudioButton variant="secondary" onClick={() => setName('Product')} tooltip="Isi nama data dengan contoh Product.">Use Product Example</StudioButton>}
        />
      ) : null}
      <div className="studio-card-grid">
        {examples.map((example) => (
          <StudioCard key={example} interactive onClick={() => setName(example)} tooltip={`Gunakan ${example} sebagai contoh data yang dikelola aplikasi.`}>
            <strong>{example}</strong>
          </StudioCard>
        ))}
      </div>
      <h3>
        {term('ENTITY', mode)} Name
        <HelpTooltip label="Data Object">A data object stores business information such as products, assets, orders, or customers.</HelpTooltip>
      </h3>
      <Input value={name} placeholder="Product" onChange={setName} />
      <Input value={description} placeholder="Inventory products" onChange={setDescription} />
      <StudioButton
        onClick={() => {
          onAddEntity({ name, description, fields: [] });
          setName('');
          setDescription('');
        }}
        disabled={!name.trim()}
        tooltip={name.trim() ? 'Buat data ini agar bisa menambahkan informasi.' : 'Isi nama data dulu, misalnya Product.'}
      >
        Create {term('ENTITY', mode)}
      </StudioButton>
      <div className="studio-list">
        {entities.map((entity) => (
          <div key={entity.name} className="studio-list-row">
            <strong>{entity.name}</strong>
            <span>{entity.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BuildPreviewPanel({ draft, expertMode }: { draft: CreationDraft; expertMode: boolean }) {
  const generated = draft.generated.entities.length > 0 ? draft.generated : generateMetadataSet(draft, { tenantId: 'preview', applicationCode: codeFromLabel(draft.application.name || 'APP'), domainCode: 'preview' });
  const uiPages = generated.pages.filter((page) => typeof page.definition === 'object' && 'kind' in page.definition && page.definition.kind === 'PAGE');
  const mode = terminologyMode(expertMode);
  const [showMetadata, setShowMetadata] = useState(false);

  return (
    <StudioPanel title={expertMode ? 'Build Preview and Developer View' : 'Application Preview'}>
      <div className="studio-build-preview">
        <h3>{expertMode ? 'Your application contains:' : 'Your application will look like this'}</h3>
        <PreviewGroup title={`📦 ${pluralTerm('ENTITY', mode)}`} values={draft.entities.map((entity) => entity.name)} />
        <PreviewGroup title={expertMode ? `📝 ${pluralTerm('FORM', mode)}` : 'Screens'} values={generated.forms.map((form) => humanizeCode(form.code))} ready={isFieldsComplete(draft)} />
        <PreviewGroup title={`📋 ${pluralTerm('VIEW', mode)}`} values={generated.views.map((view) => humanizeCode(view.code))} ready={isFieldsComplete(draft)} />
        <PreviewGroup title="⚙ Automation" values={['Not configured']} ready={false} />
        <PreviewLine label={`🚀 ${term('RUNTIME_PACKAGE', mode)}`} value={isReviewComplete(draft) ? 'Ready' : 'Waiting for completed steps'} ready={isReviewComplete(draft)} />
        <PreviewGroup title="Screen" values={uiPages.map((page) => humanizeCode(page.code))} ready={isFieldsComplete(draft)} />
      </div>
      {!expertMode ? <BusinessPreview draft={draft} /> : null}
      {expertMode ? (
        <label className="studio-check-row">
          <input type="checkbox" checked={showMetadata} onChange={(event) => setShowMetadata(event.target.checked)} />
          Show Metadata
        </label>
      ) : null}
      {expertMode && showMetadata ? (
        <div className="studio-developer-view">
          <strong>Developer View</strong>
          <div className="studio-card-grid">
            <ReviewMetric label="Entity" value={generated.entities.length} />
            <ReviewMetric label="Field" value={generated.fields.length} />
            <ReviewMetric label="Form" value={generated.forms.length} />
            <ReviewMetric label="Page" value={uiPages.length} />
          </div>
          <pre>{JSON.stringify(generated, null, 2)}</pre>
        </div>
      ) : null}
    </StudioPanel>
  );
}

function ReviewStep({ draft, expertMode }: { draft: CreationDraft; expertMode: boolean }) {
  const mode = terminologyMode(expertMode);

  return (
    <section className="studio-wizard-body">
      <h3>{expertMode ? 'Visual Review' : 'Workflow'}</h3>
      <p className="studio-muted">
        {expertMode ? 'Review generated definitions before publishing.' : 'How does your business process work? You can launch now and add process rules later.'}
      </p>
      <HelpTooltip label={term('WORKFLOW', mode)}>A process controls how work moves. Example: Draft to Approval to Done.</HelpTooltip>
      <ReadinessMeter draft={draft} runtimeCompiled={false} expertMode={expertMode} />
      <BuildCounts draft={draft} expertMode={expertMode} />
      <div className="studio-list">
        {draft.generated.entities.map((entity) => (
          <div key={entity.code} className="studio-list-row">
            <strong>{humanizeCode(entity.code)}</strong>
            <span>{entity.definition.fieldCodes.length} {expertMode ? 'fields' : 'information items'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LaunchProgress() {
  return (
    <div className="studio-launch-progress" aria-label="Launch progress">
      {['Preparing application...', 'Checking data', 'Creating screens', 'Activating version'].map((item) => (
        <div key={item} className="studio-list-row">
          <span>✓</span>
          <strong>{item}</strong>
        </div>
      ))}
    </div>
  );
}

function humanizeLaunchError(error: unknown): { title: string; reason: string } {
  const fallback = {
    title: 'Cannot launch application',
    reason: 'Runtime validation failed. Please review screen design and required information.',
  };

  if (!(error instanceof ApiClientError)) {
    return fallback;
  }

  const issues = validationIssues(error.detail);
  const firstIssue = issues[0];

  if (!firstIssue) {
    return fallback;
  }

  if (firstIssue.code?.includes('FORM') || firstIssue.code?.includes('UI') || firstIssue.code?.includes('NAVIGATION')) {
    return {
      title: 'Cannot launch application',
      reason: 'Screen missing or not ready. Use Fix automatically to generate screen and navigation again.',
    };
  }

  return {
    title: 'Cannot launch application',
    reason: firstIssue.message || fallback.reason,
  };
}

function validationIssues(detail: unknown): Array<{ code?: string; message?: string }> {
  if (!detail || typeof detail !== 'object') {
    return [];
  }

  const response = detail as { issues?: unknown; response?: { issues?: unknown } };
  const issues = response.issues ?? response.response?.issues;

  return Array.isArray(issues) ? issues as Array<{ code?: string; message?: string }> : [];
}

function BuildCounts({ draft, expertMode }: { draft: CreationDraft; expertMode: boolean }) {
  const generated = draft.generated.entities.length > 0 ? draft.generated : generateMetadataSet(draft, { tenantId: 'preview', applicationCode: codeFromLabel(draft.application.name || 'APP'), domainCode: 'preview' });
  const mode = terminologyMode(expertMode);

  return (
    <div className="studio-card-grid">
      <ReviewMetric label="Creating Application" value={generated.application ? 1 : 0} />
      <ReviewMetric label={pluralTerm('ENTITY', mode)} value={generated.entities.length} />
      <ReviewMetric label={expertMode ? pluralTerm('FORM', mode) : 'Screens'} value={generated.forms.length} />
      <ReviewMetric label="Screens" value={generated.pages.filter((page) => typeof page.definition === 'object' && 'kind' in page.definition && page.definition.kind === 'PAGE').length} />
      <ReviewMetric label="Menu" value={generated.navigation ? 1 : 0} />
      <ReviewMetric label={term('RUNTIME_PACKAGE', mode)} value="Ready" />
    </div>
  );
}

function PreviewGroup({ title, values, ready = values.length > 0 }: { title: string; values: string[]; ready?: boolean }) {
  return (
    <div className="studio-preview-group">
      <strong>{title}</strong>
      {values.length === 0 ? <div className="studio-muted">You haven't created anything yet.</div> : null}
      {values.map((value) => (
        <div key={value}>
          <StudioBadge tone={ready ? 'success' : 'info'}>{ready ? 'Ready' : 'Planned'}</StudioBadge> {value}
        </div>
      ))}
    </div>
  );
}

function PreviewLine({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <div className="studio-list-row">
      <strong>{label}</strong>
      <span>
        <StudioBadge tone={ready ? 'success' : 'warning'}>{ready ? 'Ready' : 'Pending'}</StudioBadge> {value}
      </span>
    </div>
  );
}

function BusinessPreview({ draft }: { draft: CreationDraft }) {
  const entity = draft.entities[0];
  const visibleFields = entity?.fields.slice(0, 4) ?? [];
  const primaryName = entity?.name ?? 'Product';
  const fieldLabels = visibleFields.length > 0 ? visibleFields.map((field) => field.label) : ['Name', 'Stock', 'Price'];

  return (
    <div className="studio-business-preview">
      <section className="studio-card" id="preview-app">
        <span className="studio-kicker">Your Application</span>
        <h3>{draft.application.name || 'Inventory App'}</h3>
        <div className="studio-card-grid">
          <PreviewGroup title="Screens" values={[`${primaryName} List`, `${primaryName} Screen`]} />
          <PreviewGroup title="Menu" values={[primaryName]} />
          <PreviewGroup title="Data" values={[`${primaryName} Information`]} />
        </div>
        <StudioButton variant="secondary" onClick={() => document.getElementById('preview-app')?.scrollIntoView({ behavior: 'smooth' })} tooltip="Buka preview aplikasi di halaman ini.">
          Open Preview App
        </StudioButton>
      </section>
      <div className="studio-preview-device studio-preview-desktop">
        <div className="studio-preview-menu">Menu: {draft.application.name || 'Inventory'}</div>
        <div className="studio-preview-toolbar">
          <strong>Screen: {primaryName} List</strong>
          <button type="button">+ Add {primaryName}</button>
        </div>
        <div className="studio-preview-table">
          {fieldLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
      <div className="studio-preview-device studio-preview-mobile">
        <strong>Mobile Preview</strong>
        {fieldLabels.map((label) => (
          <label key={label}>
            {label}
            <input placeholder={label} readOnly />
          </label>
        ))}
      </div>
    </div>
  );
}

function InformationCompletionChecklist({
  draft,
  onAddSuggestion,
}: {
  draft: CreationDraft;
  onAddSuggestion: (entityIndex: number, field: CreationFieldInput) => void;
}) {
  const missingEntities = draft.entities
    .map((entity, index) => ({ entity, index }))
    .filter(({ entity }) => entity.fields.length === 0);

  if (draft.entities.length === 0) {
    return null;
  }

  if (missingEntities.length === 0) {
    return (
      <div className="studio-impact studio-impact-info">
        All Data Objects have information. You can continue to Design Screen.
      </div>
    );
  }

  return (
    <div className="studio-inline-warning">
      <strong>Next is locked because these Data Objects still need information:</strong>
      <div className="studio-checklist">
        {missingEntities.map(({ entity, index }) => {
          const suggestion = suggestInformationForObject(entity.name)[0];

          return (
            <div key={entity.name} className="studio-list-row">
              <span>{entity.name}</span>
              <StudioButton variant="secondary" onClick={() => onAddSuggestion(index, suggestion)} tooltip={`Tambahkan ${suggestion.label} sebagai contoh informasi untuk ${entity.name}.`}>
                Add {suggestion.label}
              </StudioButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReadinessMeter({ draft, runtimeCompiled, expertMode }: { draft: CreationDraft; runtimeCompiled: boolean; expertMode: boolean }) {
  const readiness = calculateReadiness(draft, runtimeCompiled, expertMode);

  return (
    <div className="studio-readiness">
      <div className="studio-list-row">
        <strong>{expertMode ? 'Application readiness' : 'Application Ready'}</strong>
        <span>{readiness.percentage}%</span>
      </div>
      <div className="studio-readiness-bar">
        <span style={{ width: `${readiness.percentage}%` }} />
      </div>
      <div className="studio-card-grid">
        {readiness.checks.map((check) => (
          <StudioBadge key={check.label} tone={check.ready ? 'success' : 'warning'}>
            {check.ready ? 'Ready' : 'Pending'} {check.label}
          </StudioBadge>
        ))}
      </div>
    </div>
  );
}

function RecommendedNextStep({
  draft,
  selectedEntity,
  onSuggestField,
}: {
  draft: CreationDraft;
  selectedEntity?: CreationEntityInput;
  onSuggestField: (label: string, type?: CreationFieldInput['type']) => void;
}) {
  const suggestions: Array<{ label: string; type: CreationFieldInput['type'] }> = [
    ...(selectedEntity ? suggestInformationForObject(selectedEntity.name) : suggestInformationForObject('Product')),
  ];

  return (
    <StudioPanel title="Recommended Next Step">
      {!draft.application.name ? (
        <ConceptCard concept="Application" />
      ) : !selectedEntity ? (
        <ConceptCard concept="Data Object" />
      ) : selectedEntity.fields.length === 0 ? (
        <>
          <p className="studio-muted">Great, your app has {selectedEntity.name}.</p>
          <p>Next: Add information.</p>
          <p className="studio-muted">Why: Users need details to enter {selectedEntity.name.toLowerCase()} information.</p>
          <div className="studio-chip-list">
            {suggestions.map((suggestion) => (
              <button key={suggestion.label} className="studio-chip" type="button" onClick={() => onSuggestField(suggestion.label, suggestion.type)}>
                {suggestion.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <ConceptCard concept="Launch" />
      )}
    </StudioPanel>
  );
}

function ReviewMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <StudioCard>
      <span className="studio-muted">{label}</span>
      <strong>{value}</strong>
    </StudioCard>
  );
}

function calculateReadiness(draft: CreationDraft, runtimeCompiled: boolean, expertMode: boolean) {
  const generated = draft.generated.entities.length > 0
    ? draft.generated
    : generateMetadataSet(draft, { tenantId: 'preview', applicationCode: codeFromLabel(draft.application.name || 'APP'), domainCode: 'preview' });
  const mode = terminologyMode(expertMode);
  const checks = [
    { label: 'Application exists', ready: Boolean(generated.application) },
    { label: `${term('ENTITY', mode)} created`, ready: generated.entities.length > 0 },
    { label: expertMode ? 'At least one field' : 'Information added', ready: generated.fields.length > 0 },
    { label: expertMode ? `${term('FORM', mode)} generated` : 'Screen created', ready: generated.forms.length > 0 },
    { label: expertMode ? 'Navigation generated' : 'Menu created', ready: Boolean(generated.navigation) },
    { label: expertMode ? 'Runtime package compiled' : 'Launch ready', ready: runtimeCompiled },
  ];
  const percentage = Math.round((checks.filter((check) => check.ready).length / checks.length) * 100);

  return {
    percentage,
    checks,
  };
}

function metadataForPublish(generated: GeneratedMetadataSet): MetadataDefinition[] {
  return [
    ...(generated.application ? [generated.application] : []),
    ...generated.entities,
    ...generated.fields,
    ...generated.relations,
    ...generated.forms,
    ...generated.views,
    ...generated.pages,
    ...generated.themes,
    ...(generated.navigation ? [generated.navigation] : []),
  ];
}

function highestUnlockedStep(draft: CreationDraft, expertMode: boolean): number {
  if (!isApplicationComplete(draft)) {
    return 0;
  }

  if (!isDataModelComplete(draft)) {
    return 1;
  }

  if (!expertMode) {
    if (!isFieldsComplete(draft) || !isExperienceComplete(draft)) {
      return 2;
    }

    if (!isReviewComplete(draft)) {
      return 3;
    }

    return 4;
  }

  if (!isFieldsComplete(draft)) {
    return 2;
  }

  if (!isExperienceComplete(draft)) {
    return 3;
  }

  if (!isReviewComplete(draft)) {
    return 4;
  }

  return 5;
}

function isApplicationComplete(draft: CreationDraft): boolean {
  return Boolean(draft.application.name.trim());
}

function isDataModelComplete(draft: CreationDraft): boolean {
  return draft.entities.length > 0;
}

function isFieldsComplete(draft: CreationDraft): boolean {
  return draft.entities.length > 0 && draft.entities.every((entity) => entity.fields.length > 0);
}

function isExperienceComplete(draft: CreationDraft): boolean {
  return draft.forms.length > 0 && draft.views.length > 0 && draft.navigation.length > 0;
}

function isReviewComplete(draft: CreationDraft): boolean {
  return isApplicationComplete(draft) && isDataModelComplete(draft) && isFieldsComplete(draft) && isExperienceComplete(draft);
}

function StepExplanation({ step, draft, expertMode }: { step: number; draft: CreationDraft; expertMode: boolean }) {
  return (
    <GuidedHint title={learningTitle(step, expertMode)}>
      {learningSummary(step, draft, expertMode)}
    </GuidedHint>
  );
}

function lockedStepMessage(index: number, draft: CreationDraft, expertMode: boolean): string {
  if (!isApplicationComplete(draft)) {
    return expertMode ? 'Complete the Application step first.' : 'Create your application before continuing.';
  }

  if (index >= 2 && !isDataModelComplete(draft)) {
    return expertMode ? 'Create an entity before adding fields.' : 'You need at least one Data Object before adding information.';
  }

  if (!expertMode) {
    if (index >= 3 && !isExperienceComplete(draft)) {
      return 'Add information in Screen Design before continuing.';
    }

    return 'Finish the previous step first.';
  }

  if (index >= 3 && !isFieldsComplete(draft)) {
    return expertMode ? 'Each Entity needs at least one Field before Form generation. Use the checklist below.' : 'Each Data Object needs at least one piece of information before designing screens. Use the checklist below.';
  }

  if (index >= 4 && !isExperienceComplete(draft)) {
    return expertMode ? 'Generate form, view, and navigation metadata first.' : 'Design screens before launch.';
  }

  return expertMode ? 'Complete previous step first.' : 'Finish the previous step first.';
}

function learningTitle(step: number, expertMode: boolean): string {
  if (expertMode) {
    const mode = terminologyMode(true);
    return [term('APPLICATION', mode), term('ENTITY', mode), term('FIELD', mode), term('FORM', mode), term('WORKFLOW', mode), 'Publish'][step] ?? term('APPLICATION', mode);
  }

  return ['Create Application', 'Create Data Object', 'Design Screen', 'Workflow', 'Launch Application'][step] ?? 'Create Application';
}

function learningSummary(step: number, draft: CreationDraft, expertMode: boolean): string {
  const selectedEntity = draft.entities[0]?.name ?? 'your Data Object';

  if (expertMode) {
    return [
      'Define the application metadata record.',
      'Create the entity metadata users will work with.',
      'Add field metadata to describe stored values.',
      'Generate form, view, page, and navigation definitions.',
      'Review workflow readiness and validation impact.',
      'Publish metadata and compile the runtime package.',
    ][step] ?? 'Define the application metadata record.';
  }

  return [
    'Give your business application a clear name.',
    'What information do you want to manage? Examples: Product, Customer, Asset, Order.',
    `Add information directly on the ${selectedEntity} screen. It appears immediately on the canvas and preview.`,
    'How does your business process work?',
    'Launch prepares your application so users can start using it.',
  ][step] ?? 'Give your business application a clear name.';
}

function nextRecommendedAction(step: number, draft: CreationDraft, expertMode: boolean): string {
  if (expertMode) {
    return [
      'Create the APPLICATION definition.',
      'Create at least one ENTITY definition.',
      'Add FIELD definitions to each entity.',
      'Generate FORM, VIEW, UI, and NAVIGATION definitions.',
      'Review validation and dependency results.',
      'Publish and open /apps/:applicationCode.',
    ][step] ?? 'Create the APPLICATION definition.';
  }

  if (step === 1 && !isDataModelComplete(draft)) {
    return 'Create Product, Customer, Asset, or Order as your first Data Object.';
  }

  if (step === 2 && !isFieldsComplete(draft)) {
    return 'Click + Add Information, then add Name, Price, and Stock directly on the screen.';
  }

  return [
    'Choose a starter and name the application.',
    'Create the first Data Object.',
    'Add information directly on the screen and arrange it for users.',
    'Keep process simple for launch, then improve it later.',
    'Launch and open the generated application.',
  ][step] ?? 'Choose a starter and name the application.';
}
