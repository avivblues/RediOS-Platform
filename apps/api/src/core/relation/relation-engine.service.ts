import { Injectable } from '@nestjs/common';
import type { RelationType, RuntimeContext } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

export interface RelationPlan {
  code: string;
  type: RelationType;
  targetEntity: string;
  mapping: {
    sourceField: string;
    targetField: string;
  };
  capabilities: {
    lookup: boolean;
    cascade: boolean;
    ownership: boolean;
  };
  lookup?: {
    entity: string;
    displayField: string;
    valueField: string;
  };
}

export interface RelationResolveResult {
  entityCode: string;
  relations: RelationPlan[];
}

@Injectable()
export class RelationEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async resolve(context: RuntimeContext, entityCode: string): Promise<RelationResolveResult> {
    const relations = await this.metadataResolver.resolveRelations(context, entityCode);

    return {
      entityCode,
      relations: await Promise.all(relations.map(async (metadata) => {
        const relation = metadata.definition;
        const plan: RelationPlan = {
          code: relation.code,
          type: relation.type,
          targetEntity: relation.target.entityCode,
          mapping: relation.mapping,
          capabilities: {
            lookup: relation.behavior.lookup,
            cascade: relation.behavior.cascade,
            ownership: relation.behavior.ownership,
          },
        };

        if (relation.behavior.lookup) {
          plan.lookup = await this.resolveLookup(context, relation.target.entityCode, relation.mapping.targetField);
        }

        return plan;
      })),
    };
  }

  private async resolveLookup(context: RuntimeContext, targetEntityCode: string, valueField: string): Promise<RelationPlan['lookup']> {
    const entity = await this.metadataResolver.resolveEntity(context, targetEntityCode);
    const fields = await this.metadataResolver.resolveFields(context, entity.definition.fieldCodes);
    const displayField =
      fields.find((field) => field.definition.code === 'name')?.definition.code ??
      fields.find((field) => field.definition.code.endsWith('Name'))?.definition.code ??
      fields[0]?.definition.code ??
      valueField;

    return {
      entity: targetEntityCode,
      displayField,
      valueField,
    };
  }
}
