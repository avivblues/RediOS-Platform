import type { ApplicationDefinition, EntityDefinition, MetadataDefinition } from '@redios/shared';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';

export type ApplicationJourneyStage =
  | 'IDEA'
  | 'DATA_MODEL'
  | 'SCREEN_DESIGN'
  | 'PROCESS'
  | 'SECURITY'
  | 'REVIEW'
  | 'LAUNCHED';

export interface JourneyDefinition {
  applicationName: string;
  stage: ApplicationJourneyStage;
  readiness: number;
  steps: JourneyStepDefinition[];
  nextAction: JourneyNextAction;
}

export interface JourneyStepDefinition {
  id: ApplicationJourneyStage;
  label: string;
  description: string;
  complete: boolean;
  required: boolean;
  selection: ExplorerSelection;
}

export interface JourneyNextAction {
  title: string;
  description: string;
  buttonLabel: string;
  selection: ExplorerSelection;
  tips: string[];
}

export interface JourneySource {
  application?: MetadataDefinition<ApplicationDefinition>;
  entities: EntityDefinition[];
  tree: MetadataDebugTree;
  launched?: boolean;
}
