export type StudioConcept = 'Application' | 'Data Object' | 'Field' | 'Screen' | 'Workflow' | 'Publish' | 'Runtime';

const conceptDescriptions: Record<StudioConcept, string> = {
  Application: 'A business app groups data, screens, automation, and navigation into one runtime experience.',
  'Data Object': 'A data object stores business information such as products, assets, orders, or customers.',
  Field: 'A field describes one piece of information stored on a data object.',
  Screen: 'A screen controls how users view, enter, and update information.',
  Workflow: 'A workflow defines the business process that moves records through states.',
  Publish: 'Publishing validates metadata, saves it, compiles the runtime package, and activates the app.',
  Runtime: 'The runtime is the live application generated from active metadata.',
};

export function ConceptCard({ concept }: { concept: StudioConcept }) {
  return (
    <article className="studio-concept-card">
      <strong>{concept}</strong>
      <p>{conceptDescriptions[concept]}</p>
    </article>
  );
}
