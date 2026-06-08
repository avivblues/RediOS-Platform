import { useMemo, useState } from 'react';
import type { MetadataDefinition } from '@redios/shared';
import type { DesignerClient } from '../../core/api/designer-client';
import type { RuntimeContext } from '../../core/renderer/runtime-types';
import { Input, Select } from '../../components/atomic/atoms/Atoms';
import { FieldBuilder } from '../field-builder/FieldBuilder';
import { StudioGuide } from '../guide/StudioGuide';
import { HelpTooltip } from '../help/HelpTooltip';
import { ConceptCard } from '../help/ConceptCard';
import { humanizeCode, metadataTerm } from '../humanizer/HumanizerEngine';
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
  type GeneratedMetadataSet,
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
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'live'>('idle');
  const [publishError, setPublishError] = useState<string | undefined>();
  const [lockedMessage, setLockedMessage] = useState<string | undefined>();
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
      setLockedMessage('Complete previous step first');
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

  function addSuggestedField(label: string, type: CreationFieldInput['type'] = 'Text') {
    addField({
      label,
      type,
      required: label === 'Product Name',
      unique: false,
    });
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
    setPublishError(undefined);
    pushActivity('Designer publish started', 'Generated metadata submitted to Designer Publish API.');

    try {
      const result = await designer.publishGenerated(metadataForPublish(generated));
      const runtimePackage = result.runtimePackages.find((candidate) => candidate.applicationCode === generated.application?.code);
      setPublishState('live');
      pushActivity('Runtime Package activated', `${runtimePackage?.applicationCode ?? generated.application?.code} is ${runtimePackage?.status ?? 'ACTIVE'}.`);
    } catch (error) {
      setPublishState('idle');
      setPublishError(error instanceof Error ? error.message : String(error));
      pushActivity('Publish failed', 'Designer validation blocked runtime activation.');
    }
  }

  function pushActivity(message: string, detail?: string) {
    setActivity((current) => [{ id: `${Date.now()}:${message}`, message, detail }, ...current].slice(0, 8));
  }

  return (
    <div className="studio-create-grid">
      <StudioPanel title="Create Application">
        <StudioStepper steps={steps} activeIndex={step} isStepEnabled={canUseStep} onStepClick={goToStep} onLockedStep={() => setLockedMessage('Complete previous step first')} />
        {lockedMessage ? <div className="studio-inline-warning">{lockedMessage}</div> : null}

        {step === 0 ? (
          <ApplicationStep draft={draft} onStarterSelect={chooseStarter} onChange={updateApplication} />
        ) : null}

        {step === 1 ? <DataModelStep onAddEntity={addEntity} entities={draft.entities} /> : null}

        {step === 2 ? (
          <section className="studio-wizard-body">
            <div className="studio-section-header">
              <div>
                <h3>
                  {selectedEntity ? `${selectedEntity.name} ${metadataTerm('FIELD', expertMode)}s` : metadataTerm('FIELD', expertMode)}
                  <HelpTooltip label="Field">Fields describe information stored in a data object.</HelpTooltip>
                </h3>
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
              <>
                {selectedEntity.fields.length === 0 ? (
                  <StudioEmptyState
                    title="No information fields yet"
                    description={`Fields describe information stored in ${selectedEntity.name}. Examples: Product Name, Price, Quantity.`}
                    action={<StudioButton onClick={() => addSuggestedField('Product Name')}>Add First Field</StudioButton>}
                  />
                ) : null}
                <FieldBuilder entities={draft.entities} objectName={selectedEntity.name} onAddField={addField} />
              </>
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
            {publishState === 'live' ? (
              <StudioCard>
                <h3>Your application is live</h3>
                <p className="studio-muted">Metadata was saved, RuntimeCompiler compiled the package, and the generated application route is ready.</p>
                <ReadinessMeter draft={{ ...draft, generated }} runtimeCompiled />
                <div className="studio-action-row">
                  <StudioButton onClick={() => { window.location.href = `/apps/${generated.application?.code ?? codeFromLabel(draft.application.name)}`; }}>
                    Open Application
                  </StudioButton>
                  <StudioButton variant="secondary" onClick={() => setStep(4)}>
                    Continue Editing
                  </StudioButton>
                </div>
              </StudioCard>
            ) : (
              <>
                <h3>Before Publish</h3>
                <ReadinessMeter draft={{ ...draft, generated }} runtimeCompiled={false} />
                <BuildCounts draft={{ ...draft, generated }} />
                {publishError ? <div className="studio-inline-danger">{publishError}</div> : null}
                <StudioButton onClick={() => void publish()} disabled={!isReviewComplete(draft)}>
                  {publishState === 'publishing' ? 'Publishing...' : 'Publish Application'}
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
      <RecommendedNextStep draft={draft} selectedEntity={selectedEntity} onSuggestField={addSuggestedField} />
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
      <h3>
        What do you want to build?
        <HelpTooltip label="Application">An application groups data objects, screens, automation, and runtime navigation.</HelpTooltip>
      </h3>
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
      <h3>
        Object Name
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
  const uiPages = generated.pages.filter((page) => typeof page.definition === 'object' && 'kind' in page.definition && page.definition.kind === 'PAGE');

  return (
    <StudioPanel title={expertMode ? 'Build Preview and Metadata' : 'Build Preview'}>
      <div className="studio-build-preview">
        <h3>Your application contains:</h3>
        <PreviewGroup title={`📦 ${metadataTerm('ENTITY', expertMode)}s`} values={draft.entities.map((entity) => entity.name)} />
        <PreviewGroup title={`📝 ${metadataTerm('FORM', expertMode)}s`} values={generated.forms.map((form) => humanizeCode(form.code))} ready={isFieldsComplete(draft)} />
        <PreviewGroup title={`📋 ${metadataTerm('VIEW', expertMode)}s`} values={generated.views.map((view) => humanizeCode(view.code))} ready={isFieldsComplete(draft)} />
        <PreviewGroup title="⚙ Automation" values={['Not configured']} ready={false} />
        <PreviewLine label="🚀 Runtime" value={isReviewComplete(draft) ? 'Ready' : 'Waiting for completed steps'} ready={isReviewComplete(draft)} />
        <PreviewGroup title="Screens" values={uiPages.map((page) => humanizeCode(page.code))} ready={isFieldsComplete(draft)} />
      </div>
      {expertMode ? <pre>{JSON.stringify(generated, null, 2)}</pre> : null}
    </StudioPanel>
  );
}

function ReviewStep({ draft }: { draft: CreationDraft }) {
  return (
    <section className="studio-wizard-body">
      <h3>Visual Review</h3>
      <ReadinessMeter draft={draft} runtimeCompiled={false} />
      <BuildCounts draft={draft} />
      <div className="studio-list">
        {draft.generated.entities.map((entity) => (
          <div key={entity.code} className="studio-list-row">
            <strong>{humanizeCode(entity.code)}</strong>
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
      <ReviewMetric label="Pages" value={generated.pages.filter((page) => typeof page.definition === 'object' && 'kind' in page.definition && page.definition.kind === 'PAGE').length} />
      <ReviewMetric label="Navigation" value={generated.navigation ? 1 : 0} />
      <ReviewMetric label="Runtime" value="READY" />
    </div>
  );
}

function PreviewGroup({ title, values, ready = values.length > 0 }: { title: string; values: string[]; ready?: boolean }) {
  return (
    <div className="studio-preview-group">
      <strong>{title}</strong>
      {values.length === 0 ? <div className="studio-muted">No information fields yet</div> : null}
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

function ReadinessMeter({ draft, runtimeCompiled }: { draft: CreationDraft; runtimeCompiled: boolean }) {
  const readiness = calculateReadiness(draft, runtimeCompiled);

  return (
    <div className="studio-readiness">
      <div className="studio-list-row">
        <strong>Application readiness</strong>
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
    { label: 'Product Name', type: 'Text' },
    { label: 'Price', type: 'Money' },
    { label: 'Stock', type: 'Number' },
    { label: 'Category', type: 'Text' },
  ];

  return (
    <StudioPanel title="Recommended Next Step">
      {!draft.application.name ? (
        <ConceptCard concept="Application" />
      ) : !selectedEntity ? (
        <ConceptCard concept="Data Object" />
      ) : selectedEntity.fields.length === 0 ? (
        <>
          <p className="studio-muted">Current: Created {selectedEntity.name} object.</p>
          <p>Next: Add information fields.</p>
          <p className="studio-muted">Why: Users need fields to enter {selectedEntity.name.toLowerCase()} information.</p>
          <div className="studio-chip-list">
            {suggestions.map((suggestion) => (
              <button key={suggestion.label} className="studio-chip" type="button" onClick={() => onSuggestField(suggestion.label, suggestion.type)}>
                {suggestion.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <ConceptCard concept="Publish" />
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

function calculateReadiness(draft: CreationDraft, runtimeCompiled: boolean) {
  const generated = draft.generated.entities.length > 0
    ? draft.generated
    : generateMetadataSet(draft, { tenantId: 'preview', applicationCode: codeFromLabel(draft.application.name || 'APP'), domainCode: 'preview' });
  const checks = [
    { label: 'Application exists', ready: Boolean(generated.application) },
    { label: 'Data object exists', ready: generated.entities.length > 0 },
    { label: 'At least one field', ready: generated.fields.length > 0 },
    { label: 'Input screen generated', ready: generated.forms.length > 0 },
    { label: 'Navigation generated', ready: Boolean(generated.navigation) },
    { label: 'Runtime package compiled', ready: runtimeCompiled },
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
