import { Panel } from '../../components/atomic/organisms/Organisms';

const helpContent: Record<string, { title: string; body: string; steps: string[] }> = {
  HOME: {
    title: 'Studio Home',
    body: 'Start from applications, templates, or guided builders. The cards summarize metadata already published in RediOS.',
    steps: ['Review application metadata', 'Choose what to build', 'Open a builder', 'Preview and publish safely'],
  },
  FORMS: {
    title: 'Forms',
    body: 'Forms define how users enter and edit data.',
    steps: ['Select entity', 'Arrange fields', 'Preview impact', 'Publish when valid'],
  },
  WORKFLOWS: {
    title: 'Workflow',
    body: 'Workflow metadata controls allowed states and transitions without hardcoded business screens.',
    steps: ['Select workflow', 'Edit states', 'Connect transitions', 'Simulate before publish'],
  },
  INTEGRATIONS: {
    title: 'Integration',
    body: 'Integrations map RediOS events to connector metadata and external systems.',
    steps: ['Select trigger', 'Choose connector', 'Map payload', 'Test and publish'],
  },
  RUNTIME: {
    title: 'Runtime',
    body: 'Runtime packages show compiled metadata used by the execution path.',
    steps: ['Review active package', 'Check compiled counts', 'Validate status', 'Compile after publish'],
  },
};

export function HelpPanel({ topic = 'HOME' }: { topic?: string }) {
  const content = helpContent[topic] ?? helpContent.HOME;

  return (
    <Panel title="Learning Assistant">
      <h4>{content.title}</h4>
      <p className="studio-muted">{content.body}</p>
      <ol className="studio-help-list">
        {content.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </Panel>
  );
}
