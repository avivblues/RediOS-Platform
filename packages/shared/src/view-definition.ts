export type ViewType = 'TABLE' | 'LOOKUP' | 'REPORT_SOURCE';

export type ViewFilterOperator = 'EQ' | 'NE' | 'IN' | 'CONTAINS';

export interface ViewColumnDefinition {
  field: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  relation?: string;
}

export interface ViewFilterDefinition {
  field: string;
  operator: ViewFilterOperator;
  defaultValue?: unknown;
}

export interface ViewSortingDefinition {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface ViewDefinition {
  code: string;
  entityCode: string;
  type: ViewType;
  columns: ViewColumnDefinition[];
  filters: ViewFilterDefinition[];
  sorting?: ViewSortingDefinition;
  enabled: boolean;
}
