export type StudioConcept = 'Application' | 'Data Object' | 'Information' | 'Screen' | 'Process' | 'Launch' | 'Launch Version';

const conceptDescriptions: Record<StudioConcept, string> = {
  Application: 'A business app groups data, screens, automation, and navigation into one live experience.',
  'Data Object': 'A Data Object stores information your business manages. Example: Product, Customer, Asset.',
  Information: 'Information is a detail stored inside your object. Example: Product Name, Price, Stock.',
  Screen: 'A screen controls how users view, enter, and update information.',
  Process: 'A process controls how work moves. Example: Draft to Approval to Done.',
  Launch: 'Launch prepares your application so users can start using it.',
  'Launch Version': 'A Launch Version is the live version users open after launch.',
};

export function ConceptCard({ concept }: { concept: StudioConcept }) {
  return (
    <article className="studio-concept-card">
      <strong>{concept}</strong>
      <p>{conceptDescriptions[concept]}</p>
    </article>
  );
}
