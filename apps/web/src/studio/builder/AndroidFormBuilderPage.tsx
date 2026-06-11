import type { EntityDefinition } from '@redios/shared';
import { FormBuilderPage } from './FormBuilderPage';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeContext, RuntimeForm } from '../../core/renderer/runtime-types';

export function AndroidFormBuilderPage(props: {
  form?: RuntimeForm;
  entity?: EntityDefinition;
  designer: DesignerClient;
  context: RuntimeContext;
  applicationName: string;
  developerMode: boolean;
  eventCodes: string[];
  onPreview: (preview: DesignerPreviewResult) => void;
  onPublished: () => void;
  onBack: () => void;
}) {
  return <FormBuilderPage {...props} builderMode="android" />;
}
