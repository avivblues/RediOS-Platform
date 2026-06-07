export type UIKind = 'ATOM' | 'MOLECULE' | 'ORGANISM' | 'TEMPLATE' | 'PAGE';

export type UIAtomCategory = 'INPUT' | 'ACTION' | 'DISPLAY' | 'DATA' | 'VISUAL';

export interface UIAtomDefinition {
  kind: 'ATOM';
  code: string;
  category: UIAtomCategory;
  renderer: {
    web: string;
    mobile: string;
  };
  propsSchema: Record<string, string>;
  enabled: boolean;
}

export interface UIMoleculeAtomBinding {
  atom: string;
  bind: string;
}

export interface UIMoleculeDefinition {
  kind: 'MOLECULE';
  code: string;
  atoms: UIMoleculeAtomBinding[];
  enabled: boolean;
}

export interface UIOrganismMoleculeBinding {
  molecule: string;
  bind: string;
}

export interface UIOrganismDefinition {
  kind: 'ORGANISM';
  code: string;
  molecules: UIOrganismMoleculeBinding[];
  enabled: boolean;
}

export interface UITemplateRegionDefinition {
  code: string;
}

export interface UITemplateDefinition {
  kind: 'TEMPLATE';
  code: string;
  regions: UITemplateRegionDefinition[];
  enabled: boolean;
}

export interface UIPageDefinition {
  kind: 'PAGE';
  code: string;
  entityCode?: string;
  viewCode?: string;
  template: string;
  regions: Record<string, string[]>;
  actions?: string[];
  relations?: string[];
  enabled: boolean;
}

export type UIDefinition =
  | UIAtomDefinition
  | UIMoleculeDefinition
  | UIOrganismDefinition
  | UITemplateDefinition
  | UIPageDefinition;
