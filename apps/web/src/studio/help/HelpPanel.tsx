import { Panel } from '../../components/atomic/organisms/Organisms';

const helpContent: Record<string, { title: string; body: string; steps: string[] }> = {
  HOME: {
    title: 'Studio Home',
    body: 'Start from applications, templates, or guided builders. The cards show what is already available in RediOS.',
    steps: ['Choose an application', 'Pick what you want to change', 'Open a builder', 'Preview and launch safely'],
  },
  APPLICATION: {
    title: 'Application Builder',
    body: 'Application Builder groups everything that shapes one business application.',
    steps: ['Open Data Object to understand stored information', 'Open Input Screens to change what users see', 'Open Process for approvals or lifecycle', 'Review permissions before launch'],
  },
  FORMS: {
    title: 'Input Screens',
    body: 'Input Screens define how users enter and edit business information.',
    steps: ['Choose a Data Object', 'Drag information into the screen', 'Click information to review details', 'Preview impact before launch'],
  },
  WORKFLOWS: {
    title: 'Process',
    body: 'A Process controls how work moves, such as Draft to Approval to Done.',
    steps: ['Select process', 'Edit states', 'Connect transitions', 'Simulate before launch'],
  },
  INTEGRATIONS: {
    title: 'Connector',
    body: 'Connectors let RediOS exchange information with other systems.',
    steps: ['Select trigger', 'Choose connector', 'Map information', 'Test and launch'],
  },
  RUNTIME: {
    title: 'Published Version',
    body: 'Published Version shows what users are currently running.',
    steps: ['Review active version', 'Check application health', 'Validate status', 'Open the generated app'],
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
