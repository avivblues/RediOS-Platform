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
}) {
  return (
    <VisualFormBuilder
      form={form}
      entity={entity}
      designer={designer}
      context={context}
      applicationName={applicationName}
      developerMode={developerMode}
      onPreview={onPreview}
      onPublished={onPublished}
      onBack={onBack}
    />
  );
}
