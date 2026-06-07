import { useState } from 'react';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';

const steps = ['Application', 'Data Model', 'Experience', 'Workflow', 'Publish'];

export function GuidedAppBuilder() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('Start Blank');
  const [entityName, setEntityName] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [experience, setExperience] = useState('Both');

  return (
    <Panel title="Guided App Builder">
      <div className="studio-wizard-steps">
        {steps.map((item, index) => (
          <button key={item} className={index === step ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'} onClick={() => setStep(index)}>
            {index + 1}. {item}
          </button>
        ))}
      </div>
      <div className="studio-wizard-body">
        {step === 0 ? (
          <section>
            <h3>What are you building?</h3>
            <Select value={mode} options={['Start Blank', 'Use Template']} onChange={setMode} />
            <p className="studio-muted">The builder creates metadata drafts through Designer operations in later phases.</p>
          </section>
        ) : null}
        {step === 1 ? (
          <section>
            <h3>Create entity visually</h3>
            <Input value={entityName} placeholder="Entity name" onChange={setEntityName} />
            <Input value={fieldName} placeholder="Field name" onChange={setFieldName} />
            <div className="studio-flow-preview">
              <strong>{entityName || 'Entity'}</strong>
              <span>down</span>
              <span>{fieldName || 'Fields'}</span>
            </div>
          </section>
        ) : null}
        {step === 2 ? (
          <section>
            <h3>Choose experience</h3>
            <Select value={experience} options={['Desktop', 'Mobile', 'Both']} onChange={setExperience} />
          </section>
        ) : null}
        {step === 3 ? (
          <section>
            <h3>Optional workflow setup</h3>
            <p className="studio-muted">Workflow metadata can be added now or later in Workflow Builder.</p>
          </section>
        ) : null}
        {step === 4 ? (
          <section>
            <h3>Publish safely</h3>
            <div className="studio-impact studio-impact-info">SimulationEngine will validate runtime behavior.</div>
            <div className="studio-impact studio-impact-info">DependencyEngine will analyze affected metadata.</div>
            <div className="studio-impact studio-impact-info">RuntimeCompiler will build the active runtime package.</div>
          </section>
        ) : null}
      </div>
      <div className="studio-action-row">
        <Button variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
          Back
        </Button>
        <Button onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} disabled={step === steps.length - 1}>
          Next
        </Button>
      </div>
    </Panel>
  );
}
