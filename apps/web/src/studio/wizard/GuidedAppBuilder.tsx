import { useState } from 'react';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';

const steps = ['Application', 'Data Object', 'Screen', 'Process', 'Launch'];

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
            <p className="studio-muted">The builder prepares an application plan through guided Studio operations.</p>
          </section>
        ) : null}
        {step === 1 ? (
          <section>
            <h3>Create Data Object visually</h3>
            <Input value={entityName} placeholder="Data Object name" onChange={setEntityName} />
            <Input value={fieldName} placeholder="Information name" onChange={setFieldName} />
            <div className="studio-flow-preview">
              <strong>{entityName || 'Data Object'}</strong>
              <span>down</span>
              <span>{fieldName || 'Information'}</span>
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
            <h3>Optional process setup</h3>
            <p className="studio-muted">A business process can be added now or later in Process Builder.</p>
          </section>
        ) : null}
        {step === 4 ? (
          <section>
            <h3>Launch safely</h3>
            <div className="studio-impact studio-impact-info">RediOS checks rules before launch.</div>
            <div className="studio-impact studio-impact-info">RediOS reviews affected application pieces.</div>
            <div className="studio-impact studio-impact-info">RediOS prepares the published version.</div>
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
