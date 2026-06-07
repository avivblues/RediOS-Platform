import type { RuntimeRendererContext } from '../context/runtime-context';

export type RuntimeExperienceLayoutMode = 'DESKTOP_WORKSPACE' | 'MOBILE_STACK' | 'TABLET_SPLIT';

export type RuntimeExperienceInteractionMode = 'MOUSE_KEYBOARD' | 'TOUCH' | 'HYBRID';

export interface RuntimeExperience {
  selected: string;
  entityCode: string;
  platform: RuntimeRendererContext['platform'];
  page: string;
  template?: string;
  navigation?: string;
  theme?: string;
  layout: RuntimeExperienceLayoutMode;
  interaction: RuntimeExperienceInteractionMode;
}

export interface ExperienceResolverAdapter {
  resolveExperience(input: {
    entityCode: string;
    context: RuntimeRendererContext;
    device?: string;
  }): Promise<RuntimeExperience> | RuntimeExperience;
}

export async function resolveExperienceForRuntime(input: {
  entityCode: string;
  context: RuntimeRendererContext;
  resolver: ExperienceResolverAdapter;
  device?: string;
}): Promise<RuntimeExperience> {
  return input.resolver.resolveExperience({
    entityCode: input.entityCode,
    context: input.context,
    device: input.device,
  });
}
