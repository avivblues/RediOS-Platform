import type { RuntimeRendererPlatform } from '../context/runtime-context';
import { resolveVisibility, type RuntimeNodePermissions, type VisibilitySource } from '../visibility/visibility-engine';

export type RuntimeNodeKind = 'PAGE' | 'TEMPLATE' | 'REGION' | 'ORGANISM' | 'MOLECULE' | 'ATOM';

export interface RuntimeBinding {
  source: 'FORM';
  fieldCode: string;
  path: string;
}

export interface RuntimeNodeLayout {
  columns?: number;
}

export interface RuntimeNode {
  id: string;
  kind: RuntimeNodeKind;
  component: string;
  props: Record<string, unknown>;
  binding?: RuntimeBinding;
  permissions: RuntimeNodePermissions;
  layout: RuntimeNodeLayout;
  children: RuntimeNode[];
}

export interface ResolvedUIAtom {
  code: string;
  bind: string;
  propsSchema?: Record<string, string>;
}

export interface RuntimeUIPageDefinition {
  kind?: string;
  code: string;
  entityCode?: string;
  viewCode?: string;
  actions?: string[];
  template?: string;
  regions?: Record<string, string[]>;
  enabled?: boolean;
}

export interface RuntimeUITemplateDefinition {
  kind?: string;
  code: string;
  regions: Array<{
    code: string;
  }>;
  enabled?: boolean;
}

export interface ResolvedUIMolecule {
  code: string;
  bind: string;
  atoms: ResolvedUIAtom[];
}

export interface ResolvedUIOrganism {
  code: string;
  molecules: ResolvedUIMolecule[];
}

export interface ResolvedUIRegion {
  code: string;
  components: ResolvedUIOrganism[];
}

export interface ResolvedUIPage {
  page: RuntimeUIPageDefinition;
  template: RuntimeUITemplateDefinition;
  regions: ResolvedUIRegion[];
}

export interface RuntimeFormField {
  fieldCode: string;
  component: string;
  order: number;
  readonly: boolean;
  visible: boolean;
  binding?: {
    source: 'FORM';
    fieldCode: string;
    path: string;
  };
  relation?: {
    code: string;
    target: string;
    valueField: string;
    displayField?: string;
  };
  view?: {
    code: string;
    entityCode: string;
    type: string;
    columns: Array<Record<string, unknown>>;
  };
}

export interface RuntimeFormSection {
  code: string;
  fields: RuntimeFormField[];
}

export interface RuntimeFormDefinition {
  entityCode: string;
  sections: RuntimeFormSection[];
}

export interface RuntimeTreeInput {
  page: ResolvedUIPage;
  form?: RuntimeFormDefinition;
  platform: RuntimeRendererPlatform;
  security?: Record<string, RuntimeNodePermissions | undefined>;
}

export function buildRuntimeTree(input: RuntimeTreeInput): RuntimeNode[] {
  const pageNode = createNode({
    id: `PAGE:${input.page.page.code}`,
    kind: 'PAGE',
    component: input.page.page.code,
    props: {
      entityCode: input.page.page.entityCode,
      viewCode: input.page.page.viewCode,
      actions: input.page.page.actions ?? [],
    },
    platform: input.platform,
    children: [
      createNode({
        id: `TEMPLATE:${input.page.template.code}`,
        kind: 'TEMPLATE',
        component: input.page.template.code,
        props: {},
        platform: input.platform,
        children: input.page.template.regions.map((region) =>
          buildRegionNode(input, region.code, input.page.regions.find((candidate) => candidate.code === region.code)),
        ),
      }),
    ],
  });

  return [pageNode];
}

export function resolveLayout(node: Pick<RuntimeNode, 'props'>, platform: RuntimeRendererPlatform): RuntimeNodeLayout {
  const layout = node.props.layout;

  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) {
    return {};
  }

  const platformKey = platform === 'WEB' ? 'desktop' : platform.toLowerCase();
  const platformLayout = (layout as Record<string, unknown>)[platformKey];

  return platformLayout && typeof platformLayout === 'object' && !Array.isArray(platformLayout)
    ? (platformLayout as RuntimeNodeLayout)
    : {};
}

function buildRegionNode(input: RuntimeTreeInput, regionCode: string, region?: ResolvedUIRegion): RuntimeNode {
  return createNode({
    id: `REGION:${regionCode}`,
    kind: 'REGION',
    component: regionCode,
    props: {},
    platform: input.platform,
    children: (region?.components ?? []).map((organism) => buildOrganismNode(input, organism)),
  });
}

function buildOrganismNode(input: RuntimeTreeInput, organism: ResolvedUIOrganism): RuntimeNode {
  return createNode({
    id: `ORGANISM:${organism.code}`,
    kind: 'ORGANISM',
    component: organism.code,
    props: {},
    platform: input.platform,
    children: organism.molecules.flatMap((molecule) => buildMoleculeNodes(input, molecule)),
  });
}

function buildMoleculeNodes(input: RuntimeTreeInput, molecule: ResolvedUIMolecule): RuntimeNode[] {
  if (molecule.bind === 'fields') {
    return formFields(input).map((field) => buildMoleculeNode(input, molecule, field));
  }

  return [buildMoleculeNode(input, molecule)];
}

function buildMoleculeNode(input: RuntimeTreeInput, molecule: ResolvedUIMolecule, field?: RuntimeFormField): RuntimeNode {
  return createNode({
    id: field ? `MOLECULE:${molecule.code}:${field.fieldCode}` : `MOLECULE:${molecule.code}`,
    kind: 'MOLECULE',
    component: molecule.code,
    props: field ? { fieldCode: field.fieldCode, relation: field.relation, view: field.view } : {},
    visibility: field,
    platform: input.platform,
    children: molecule.atoms.map((atom) => buildAtomNode(input, atom, field)),
  });
}

function buildAtomNode(input: RuntimeTreeInput, atom: ResolvedUIAtom, field?: RuntimeFormField): RuntimeNode {
  const effectiveComponent = field && atom.bind === 'value' ? field.component : atom.code;
  const fieldCode = field?.binding?.fieldCode ?? field?.fieldCode;

  return createNode({
    id: field ? `ATOM:${effectiveComponent}:${field.fieldCode}:${atom.bind}` : `ATOM:${effectiveComponent}:${atom.bind}`,
    kind: 'ATOM',
    component: effectiveComponent,
    props: field ? { fieldCode: field.fieldCode, relation: field.relation, view: field.view } : { propsSchema: atom.propsSchema ?? {} },
    binding: fieldCode
      ? {
          source: 'FORM',
          fieldCode,
          path: `document.data.${fieldCode}`,
        }
      : undefined,
    visibility: field,
    platform: input.platform,
  });
}

function createNode(input: {
  id: string;
  kind: RuntimeNodeKind;
  component: string;
  props: Record<string, unknown>;
  platform: RuntimeRendererPlatform;
  binding?: RuntimeBinding;
  visibility?: VisibilitySource;
  children?: RuntimeNode[];
}): RuntimeNode {
  const base = {
    id: input.id,
    kind: input.kind,
    component: input.component,
    props: input.props,
    binding: input.binding,
    permissions: resolveVisibility(input.visibility),
    layout: resolveLayout({ props: input.props }, input.platform),
    children: input.children ?? [],
  };

  return base;
}

function formFields(input: RuntimeTreeInput): RuntimeFormField[] {
  return input.form?.sections.flatMap((section) => section.fields).filter((field) => field.visible) ?? [];
}
