import { useMemo, useState } from 'react';
import type { DesignerClient } from '../../core/api/designer-client';
import type { RuntimeContext } from '../../core/renderer/runtime-types';
import { Input, Select } from '../../components/atomic/atoms/Atoms';
import { FieldBuilder } from '../field-builder/FieldBuilder';
import { StudioGuide } from '../guide/StudioGuide';
import { humanizeCode } from '../humanizer/HumanizerEngine';
import { StudioActivityTimeline, type StudioActivityItem } from '../activity/StudioActivityTimeline';
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
} from './creation-types';
import { codeFromLabel, generateMetadataSet } from './metadata-generator';

const steps = ['Application', 'Data Model', 'Fields', 'Experience', 'Review', 'Publish'];
const appStarterCards = [
  { label: 'Inventory', icon: 'BOX', description: 'Track products, stock, suppliers, and movements.' },
  { label: 'CRM', icon: 'PEOPLE', description: 'Manage customers, contacts, and sales activity.' },
  { label: 'Asset Management', icon: 'TOOLS', description: 'Manage assets, maintenance, and work orders.' },
  { label: 'Helpdesk', icon: 'HEADSET', description: 'Track support tickets and resolution workflows.' },
  { label: 'Blank App', icon: 'SPARK', description: 'Start from an empty metadata model.' },
];

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
  const [draft, setDraft] = useState<CreationDraft>(() => createInitialCreationDraft());
  const [selectedEntityIndex, setSelectedEntityIndex] = useState(0);
  const [activity, setActivity] = useState<StudioActivityItem[]>([]);
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'ready'>('idle');
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
  const canUseStep = (index: number) => index <= highestUnlockedStep(draft);

  function goToStep(index: number) {
    if (!canUseStep(index)) {
      window.alert('Complete previous step first');
      return;
    }

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
    pushActivity(`Starter selected: ${label}`, 'Application metadata draft initialized.');
  }

  function addEntity(entity: CreationEntityInput) {
    setDraft((current) => ({ ...current, entities: [...current.entities, entity] }));
    setSelectedEntityIndex(draft.entities.length);
    pushActivity(`Draft object added: ${entity.name}`, 'ENTITY metadata generated in Studio draft.');
  }

  function addField(field: CreationFieldInput) {
    setDraft((current) => ({
      ...current,
      entities: current.entities.map((entity, index) => (index === selectedEntityIndex ? { ...entity, fields: [...entity.fields, field] } : entity)),
    }));
    pushActivity(`Field added: ${field.label}`, `${field.type} field queued for ${selectedEntity?.name ?? 'object'}.`);
  }

  function generateExperience() {
    setDraft((current) => ({
      ...current,
      forms: generated.forms.map((form) => form.code),
      views: generated.views.map((view) => view.code),
      navigation: generated.navigation ? [generated.navigation.code] : [],
      generated,
    }));
    pushActivity('Experience generated', 'Forms, list views, detail pages, navigation, and API-ready metadata generated.');
  }

  async function publish() {
    setPublishState('publishing');
    pushActivity('Draft created', 'Generated metadata is ready for DesignerEngine-backed publish.');
    // Current backend Designer supports FORM/NAVIGATION draft publishing for existing targets.
    // New APPLICATION/ENTITY/FIELD/VIEW/UI creation remains generated metadata until generic creation targets are enabled.
    void designer;
    setPublishState('ready');
    pushActivity('Runtime Package pending', 'RuntimeCompiler will activate after DesignerEngine publish.');
  }

  function pushActivity(message: string, detail?: string) {
    setActivity((current) => [{ id: `${Date.now()}:${message}`, message, detail }, ...current].slice(0, 8));
  }

  return (
    <div className="studio-create-grid">
      <StudioPanel title="Create Application">
        <StudioStepper steps={steps} activeIndex={step} isStepEnabled={canUseStep} onStepClick={goToStep} />

        {step === 0 ? (
          <ApplicationStep draft={draft} onStarterSelect={chooseStarter} onChange={updateApplication} />
        ) : null}

        {step === 1 ? <DataModelStep onAddEntity={addEntity} entities={draft.entities} /> : null}

        {step === 2 ? (
          <section className="studio-wizard-body">
            <div className="studio-section-header">
              <div>
                <h3>{selectedEntity ? `${selectedEntity.name} Fields` : 'Fields'}</h3>
                <p className="studio-muted">Add the information users need to capture.</p>
              </div>
            </div>
            {draft.entities.length > 1 ? (
              <Select
                value={String(selectedEntityIndex)}
                options={draft.entities.map((entity, index) => `${index}:${entity.name}`)}
                onChange={(value) => setSelectedEntityIndex(Number(value.split(':')[0]))}
              />
            ) : null}
            {selectedEntity ? (
              <FieldBuilder entities={draft.entities} objectName={selectedEntity.name} onAddField={addField} />
            ) : (
              <StudioEmptyState title="Create an object first" description="Fields belong to a data object, such as Product or Supplier." />
            )}
          </section>
        ) : null}

        {step === 3 ? (
          <section className="studio-wizard-body">
            <h3>Generate experience</h3>
            <p className="studio-muted">RediOS will suggest forms, list views, detail pages, navigation, and API-ready metadata from your objects.</p>
            <StudioButton onClick={generateExperience} disabled={!isFieldsComplete(draft)}>
              Generate Experience
            </StudioButton>
          </section>
        ) : null}

        {step === 4 ? <ReviewStep draft={{ ...draft, generated }} /> : null}

        {step === 5 ? (
          <section className="studio-wizard-body">
            {publishState === 'ready' ? (
              <StudioCard>
                <h3>Your application is ready</h3>
                <p className="studio-muted">Generated metadata is prepared for the runtime application once Designer creation targets are enabled.</p>
                <StudioButton onClick={() => window.alert('Generated app will open after metadata publish is enabled.')}>Open App</StudioButton>
              </StudioCard>
            ) : (
              <>
                <h3>Before Publish</h3>
                <BuildCounts draft={{ ...draft, generated }} />
                <StudioButton onClick={() => void publish()} disabled={!isReviewComplete(draft)}>
                  Publish Application
                </StudioButton>
              </>
            )}
          </section>
        ) : null}

        <div className="studio-action-row">
          <StudioButton variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
            Back
          </StudioButton>
          <StudioButton onClick={() => goToStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>
            Next
          </StudioButton>
        </div>
      </StudioPanel>

      <BuildPreviewPanel draft={{ ...draft, generated }} expertMode={expertMode} />
      <StudioGuide topic={guideTopic(step)} />
      <StudioActivityTimeline items={activity} />
    </div>
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
      <h3>What do you want to build?</h3>
      <div className="studio-card-grid">
        {appStarterCards.map((card) => (
          <StudioCard key={card.label} interactive onClick={() => onStarterSelect(card.label)}>
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
}: {
  entities: CreationEntityInput[];
  onAddEntity: (entity: CreationEntityInput) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const examples = ['Product', 'Customer', 'Asset', 'Order'];

  return (
    <section className="studio-wizard-body">
      {entities.length === 0 ? (
        <StudioEmptyState
          title="Create your first data object"
          description="What information do you want to manage?"
          action={<StudioButton variant="secondary" onClick={() => setName('Product')}>Use Product Example</StudioButton>}
        />
      ) : null}
      <div className="studio-card-grid">
        {examples.map((example) => (
          <StudioCard key={example} interactive onClick={() => setName(example)}>
            <strong>{example}</strong>
          </StudioCard>
        ))}
      </div>
      <h3>Object Name</h3>
      <Input value={name} placeholder="Product" onChange={setName} />
      <Input value={description} placeholder="Inventory products" onChange={setDescription} />
      <StudioButton
        onClick={() => {
          onAddEntity({ name, description, fields: [] });
          setName('');
          setDescription('');
        }}
        disabled={!name.trim()}
      >
        Create Object
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

  return (
    <StudioPanel title={expertMode ? 'Build Preview and Metadata' : 'Build Preview'}>
      <div className="studio-build-preview">
        <PreviewLine label="Application" value={draft.application.name || 'Not selected'} ready={Boolean(draft.application.name)} />
        <PreviewGroup title="Objects" values={draft.entities.map((entity) => entity.name)} />
        <PreviewGroup title="Fields" values={draft.entities.flatMap((entity) => entity.fields.map((field) => field.label))} />
        <PreviewGroup title="Generated Automatically" values={['Form', 'List View', 'Detail Page', 'Navigation', 'API']} ready={isFieldsComplete(draft)} />
        <PreviewLine label="Runtime" value={isReviewComplete(draft) ? 'READY' : 'Waiting for completed steps'} ready={isReviewComplete(draft)} />
      </div>
      {expertMode ? <pre>{JSON.stringify(generated, null, 2)}</pre> : null}
    </StudioPanel>
  );
}

function ReviewStep({ draft }: { draft: CreationDraft }) {
  return (
    <section className="studio-wizard-body">
      <h3>Visual Review</h3>
      <BuildCounts draft={draft} />
      <div className="studio-list">
        {draft.generated.entities.map((entity) => (
          <div key={entity.code} className="studio-list-row">
            <strong>OK {humanizeCode(entity.code)}</strong>
            <span>{entity.definition.fieldCodes.length} fields</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BuildCounts({ draft }: { draft: CreationDraft }) {
  const generated = draft.generated.entities.length > 0 ? draft.generated : generateMetadataSet(draft, { tenantId: 'preview', applicationCode: codeFromLabel(draft.application.name || 'APP'), domainCode: 'preview' });

  return (
    <div className="studio-card-grid">
      <ReviewMetric label="Creating Application" value={generated.application ? 1 : 0} />
      <ReviewMetric label="Objects" value={generated.entities.length} />
      <ReviewMetric label="Forms" value={generated.forms.length} />
      <ReviewMetric label="Pages" value={generated.pages.length} />
      <ReviewMetric label="Navigation" value={generated.navigation ? 1 : 0} />
      <ReviewMetric label="Runtime" value="READY" />
    </div>
  );
}

function PreviewGroup({ title, values, ready = values.length > 0 }: { title: string; values: string[]; ready?: boolean }) {
  return (
    <div className="studio-preview-group">
      <strong>{title}</strong>
      {values.length === 0 ? <div className="studio-muted">Nothing added yet</div> : null}
      {values.map((value) => (
        <div key={value}>
          <StudioBadge tone={ready ? 'success' : 'info'}>OK</StudioBadge> {value}
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
        <StudioBadge tone={ready ? 'success' : 'warning'}>{ready ? 'OK' : 'TODO'}</StudioBadge> {value}
      </span>
    </div>
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

function highestUnlockedStep(draft: CreationDraft): number {
  if (!isApplicationComplete(draft)) {
    return 0;
  }

  if (!isDataModelComplete(draft)) {
    return 1;
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

function guideTopic(step: number): 'APPLICATION' | 'DATA_MODEL' | 'FIELDS' | 'EXPERIENCE' | 'PUBLISH' {
  if (step === 1) {
    return 'DATA_MODEL';
  }

  if (step === 2) {
    return 'FIELDS';
  }

  if (step === 3 || step === 4) {
    return 'EXPERIENCE';
  }

  if (step === 5) {
    return 'PUBLISH';
  }

  return 'APPLICATION';
}
