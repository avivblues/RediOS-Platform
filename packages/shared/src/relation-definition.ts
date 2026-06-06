export type RelationType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';

export interface RelationDefinition {
  code: string;
  source: {
    entityCode: string;
  };
  target: {
    entityCode: string;
  };
  type: RelationType;
  mapping: {
    sourceField: string;
    targetField: string;
  };
  behavior: {
    required: boolean;
    cascade: boolean;
    ownership: boolean;
    lookup: boolean;
  };
  enabled: boolean;
}
