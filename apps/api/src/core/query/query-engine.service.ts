import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { RuntimeContext, RuntimeDocument, ViewColumnDefinition, ViewDefinition } from '@redios/shared';
import { ActionEngine } from '../action/action-engine.service';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { RelationEngine, type RelationPlan } from '../relation/relation-engine.service';
import { SecurityEngine } from '../security/security-engine.service';
import { SecurityPolicyEngine } from '../security-policy/security-policy-engine.service';
import { StorageEngine } from '../storage/storage.engine';
import { FieldSecurityEngine } from './field-security-engine.service';

export interface QueryRequest {
  viewCode?: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}

export interface QueryResult {
  data: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  view: {
    code: string;
    entityCode: string;
    type: ViewDefinition['type'];
    columns: ViewColumnDefinition[];
  };
}

@Injectable()
export class QueryEngine {
  constructor(
    private readonly metadataResolver: MetadataResolver,
    private readonly storageEngine: StorageEngine,
    private readonly relationEngine: RelationEngine,
    private readonly fieldSecurityEngine: FieldSecurityEngine,
    private readonly actionEngine: ActionEngine,
    private readonly securityEngine: SecurityEngine,
    private readonly securityPolicyEngine: SecurityPolicyEngine,
  ) {}

  async execute(context: RuntimeContext, entityCode: string, request: QueryRequest = {}): Promise<QueryResult> {
    this.securityEngine.validateContext(context);
    const action = await this.actionEngine.resolve(context, entityCode, 'READ');
    this.securityEngine.validateActionAccess(context, action);
    await this.securityPolicyEngine.assertActionAllowed(context, 'READ', entityCode);

    const viewMetadata = await this.metadataResolver.resolveView(context, entityCode, request.viewCode);

    if (!viewMetadata) {
      throw new NotFoundException(`Metadata VIEW:${entityCode}:${request.viewCode ?? '(default)'} was not found.`);
    }

    const view = viewMetadata.definition;
    const visibleColumns = (await this.fieldSecurityEngine.filterVisibleColumns(context, entityCode, view.columns)).filter(
      (column) => column.visible,
    );
    const filters = request.filters ?? {};

    this.validateFilters(view, visibleColumns, filters);

    const documents = await this.storageEngine.findMany(context, entityCode, this.toStorageQuery(filters));
    const sortedDocuments = this.sortDocuments(documents, view);
    const page = Math.max(1, request.page ?? 1);
    const limit = Math.min(Math.max(1, request.limit ?? 20), 100);
    const pageDocuments = sortedDocuments.slice((page - 1) * limit, page * limit);
    const relations = await this.relationEngine.resolve(context, entityCode);
    const rows = await Promise.all(
      pageDocuments.map((document) => this.toRow(context, document, visibleColumns, relations.relations)),
    );

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: documents.length,
      },
      view: {
        code: view.code,
        entityCode: view.entityCode,
        type: view.type,
        columns: visibleColumns,
      },
    };
  }

  private validateFilters(
    view: ViewDefinition,
    columns: ViewColumnDefinition[],
    filters: Record<string, unknown>,
  ): void {
    const allowedFields = new Set([
      ...view.filters.map((filter) => filter.field),
      ...columns.filter((column) => column.filterable).map((column) => column.field),
    ]);

    for (const field of Object.keys(filters)) {
      if (!allowedFields.has(field)) {
        throw new BadRequestException(`Filter field is not allowed by view metadata: ${field}`);
      }
    }
  }

  private toStorageQuery(filters: Record<string, unknown>): Record<string, unknown> {
    return Object.entries(filters).reduce<Record<string, unknown>>((query, [field, value]) => {
      query[this.toStorageField(field)] = value;
      return query;
    }, {});
  }

  private toStorageField(field: string): string {
    if (field === 'id') {
      return '_id';
    }

    if (field === 'status') {
      return 'status';
    }

    return `data.${field}`;
  }

  private sortDocuments(documents: RuntimeDocument[], view: ViewDefinition): RuntimeDocument[] {
    if (!view.sorting) {
      return documents;
    }

    const direction = view.sorting.direction === 'ASC' ? 1 : -1;
    return [...documents].sort((left, right) => {
      const leftValue = this.getDocumentField(left, view.sorting!.field);
      const rightValue = this.getDocumentField(right, view.sorting!.field);

      if (leftValue === rightValue) {
        return 0;
      }

      return String(leftValue ?? '').localeCompare(String(rightValue ?? '')) * direction;
    });
  }

  private async toRow(
    context: RuntimeContext,
    document: RuntimeDocument,
    columns: ViewColumnDefinition[],
    relations: RelationPlan[],
  ): Promise<Record<string, unknown>> {
    const row: Record<string, unknown> = {
      id: document.id,
      status: document.status,
    };

    for (const column of columns) {
      const value = this.getDocumentField(document, column.field);
      row[column.field] = column.relation
        ? await this.resolveRelationValue(context, column.relation, value, relations)
        : value;
    }

    return row;
  }

  private async resolveRelationValue(
    context: RuntimeContext,
    relationCode: string,
    value: unknown,
    relations: RelationPlan[],
  ): Promise<unknown> {
    const relation = relations.find((candidate) => candidate.code === relationCode);

    if (!relation || value === undefined || value === null || value === '') {
      return value;
    }

    const targetDocument =
      relation.mapping.targetField === 'id'
        ? await this.storageEngine.findOne(context, relation.targetEntity, String(value))
        : (await this.storageEngine.findMany(context, relation.targetEntity, {
            [`data.${relation.mapping.targetField}`]: value,
          }))[0];

    if (!targetDocument) {
      return {
        id: value,
        display: String(value),
      };
    }

    const displayField = relation.lookup?.displayField;
    const display =
      displayField === 'id'
        ? targetDocument.id
        : displayField
          ? targetDocument.data[displayField]
          : targetDocument.documentNo ?? targetDocument.id;

    return {
      id: targetDocument.id,
      display: display ?? targetDocument.id,
    };
  }

  private getDocumentField(document: RuntimeDocument, field: string): unknown {
    if (field === 'id') {
      return document.id;
    }

    if (field === 'status') {
      return document.status;
    }

    return document.data[field];
  }
}
