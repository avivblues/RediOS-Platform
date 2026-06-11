import type { EntityDefinition } from '@redios/shared';
import { VisualFormBuilder } from '../../builder/form/VisualFormBuilder';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeContext, RuntimeForm } from '../../core/renderer/runtime-types';

export function FormBuilderPage({
  form,
  entity,
  designer,
  context,
  applicationName,
  developerMode,
  onPreview,
  onPublished,
  onBack,
  builderMode = 'web',
  eventCodes = [],
}: {
  form?: RuntimeForm;
  entity?: EntityDefinition;
  designer: DesignerClient;
  context: RuntimeContext;
  applicationName: string;
  developerMode: boolean;
  onPreview: (preview: DesignerPreviewResult) => void;
  onPublished: () => void;
  onBack: () => void;
  builderMode?: 'web' | 'android';
  eventCodes?: string[];
}) {
  return (
    <VisualFormBuilder
      form={form}
      entity={entity}
      designer={designer}
      context={context}
      applicationName={applicationName}
      developerMode={developerMode}
      builderMode={builderMode}
      eventCodes={eventCodes}
      onPreview={onPreview}
      onPublished={onPublished}
      onBack={onBack}
    />
  );
}
