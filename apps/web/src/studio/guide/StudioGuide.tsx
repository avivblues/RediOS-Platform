import { useState } from 'react';
import { StudioButton, StudioPanel } from '../design-system/StudioDesignSystem';

const guideContent: Record<string, { title: string; body: string; tips: string[] }> = {
  APPLICATION: {
    title: 'What is an application?',
    body: 'An application groups the data, screens, automation, and access rules your users work with.',
    tips: ['Pick a clear business name.', 'Start from a template if the app is similar to an existing business process.'],
  },
  DATA_MODEL: {
    title: 'What is a data object?',
    body: 'Objects store your business data, like Product, Supplier, Asset, or Order.',
    tips: ['Use nouns that business users understand.', 'Create one object per thing you manage.'],
  },
  FIELDS: {
    title: 'What are fields?',
    body: 'Fields describe the information stored on each object.',
    tips: ['Use Text for names and codes.', 'Use Lookup when a field should point to another object.'],
  },
  EXPERIENCE: {
    title: 'What is generated experience?',
    body: 'RediOS can suggest forms, list views, pages, and navigation from your object model.',
    tips: ['Review generated items before publish.', 'You can customize forms after generation.'],
  },
  PUBLISH: {
    title: 'What happens at publish?',
    body: 'Publishing validates metadata, checks dependency impact, and prepares runtime compilation.',
    tips: ['Review warnings before publishing.', 'Open the app after publish to test the runtime experience.'],
  },
};

export function StudioGuide({ topic }: { topic: keyof typeof guideContent }) {
  const [open, setOpen] = useState(false);
  const content = guideContent[topic];

  return (
    <div className="studio-guide">
      <StudioButton variant="secondary" onClick={() => setOpen((current) => !current)}>
        Learn More
      </StudioButton>
      {open ? (
        <StudioPanel title={content.title}>
          <p className="studio-muted">{content.body}</p>
          <ul>
            {content.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </StudioPanel>
      ) : null}
    </div>
  );
}
