import { StudioTemplateGallery } from './StudioTemplateGallery';

export function TemplateGallery({ onCreateFromTemplate }: { onCreateFromTemplate?: () => void }) {
  return <StudioTemplateGallery onCreateFromTemplate={onCreateFromTemplate} />;
}
