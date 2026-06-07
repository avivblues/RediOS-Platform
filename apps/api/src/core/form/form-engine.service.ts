import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  FieldDefinition,
  FormDefinition,
  FormFieldDefinition,
  FormSectionDefinition,
  RuntimeContext,
  ViewColumnDefinition,
  ViewDefinition,
} from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { RelationEngine, type RelationPlan } from '../relation/relation-engine.service';
import { SecurityPolicyEngine } from '../security-policy/security-policy-engine.service';
import { ThemeEngine, type RuntimeTheme } from '../theme/theme-engine.service';

export interface ComposedFormField {
  fieldCode: string;
  component: string;
  order: number;
  required: boolean;
  readonly: boolean;
  visible: boolean;
  binding: {
    source: 'FORM';
    fieldCode: string;
    path: string;
  };
  validation?: Record<string, unknown>;
  metadata: FieldDefinition;
  ui: {
    molecule: 'FORM_FIELD';
    atom: string;
    binding: {
      source: 'FORM';
      fieldCode: string;
    };
  };
  themeToken: {
    radius: keyof RuntimeTheme['tokens']['radius'];
    density: RuntimeTheme['layout']['density'];
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
    type: ViewDefinition['type'];
    columns: ViewColumnDefinition[];
  };
}

export interface ComposedFormSection {
  code: string;
  title: string;
  order: number;
  fields: ComposedFormField[];
}

export interface ComposedForm {
  entityCode: string;
  form: string;
  name: string;
  version: number;
  layout: FormDefinition['layout']['type'];
  theme: RuntimeTheme;
  sections: ComposedFormSection[];
}

@Injectable()
export class FormEngine {
  constructor(
    private readonly metadataResolver: MetadataResolver,
    private readonly relationEngine: RelationEngine,
    private readonly themeEngine: ThemeEngine,
    private readonly securityPolicyEngine: SecurityPolicyEngine,
  ) {}

  async compose(context: RuntimeContext, entityCode: string, formCode?: string): Promise<ComposedForm> {
    const formMetadata = await this.metadataResolver.resolveForm(context, entityCode, formCode);

    if (!formMetadata) {
      throw new NotFoundException(`Metadata FORM:${entityCode}:${formCode ?? '(default)'} was not found.`);
    }

    const form = formMetadata.definition;
    const entity = await this.metadataResolver.resolveEntity(context, entityCode);
    const fields = await this.metadataResolver.resolveFields(context, entity.definition.fieldCodes);
    const relations = await this.relationEngine.resolve(context, entityCode);
    const fieldsByCode = new Map(fields.map((field) => [field.definition.code, field.definition]));
    const theme = await this.themeEngine.compose(context);

    return {
      entityCode,
      form: form.code,
      name: form.name,
      version: form.version,
      layout: form.layout.type,
      theme,
      sections: await Promise.all(
        [...form.layout.sections]
          .sort((left, right) => left.order - right.order)
          .map((section) => this.composeSection(context, section, fieldsByCode, relations.relations, theme)),
      ),
    };
  }

  countFields(form: ComposedForm): number {
    return form.sections.reduce((total, section) => total + section.fields.length, 0);
  }

  countLookups(form: ComposedForm): number {
    return form.sections.reduce(
      (total, section) => total + section.fields.filter((field) => Boolean(field.relation && field.view)).length,
      0,
    );
  }

  private async composeSection(
    context: RuntimeContext,
    section: FormSectionDefinition,
    fieldsByCode: Map<string, FieldDefinition>,
    relations: RelationPlan[],
    theme: RuntimeTheme,
  ): Promise<ComposedFormSection> {
    return {
      code: section.code,
      title: section.title,
      order: section.order,
      fields: await Promise.all(
        [...section.fields]
          .sort((left, right) => left.order - right.order)
          .map((field) => this.composeField(context, field, fieldsByCode, relations, theme)),
      ),
    };
  }

  private async composeField(
    context: RuntimeContext,
    field: FormFieldDefinition,
    fieldsByCode: Map<string, FieldDefinition>,
    relations: RelationPlan[],
    theme: RuntimeTheme,
  ): Promise<ComposedFormField> {
    const metadata = fieldsByCode.get(field.fieldCode);

    if (!metadata) {
      throw new NotFoundException(`Field metadata ${field.fieldCode} was not found.`);
    }

    const lookup = field.lookup ? await this.composeLookup(context, field.lookup.relationCode, field.lookup.viewCode, relations) : {};
    const policy = await this.securityPolicyEngine.evaluateFieldAccess(context, metadata.entityCode, field.fieldCode);
    const visible = Boolean(field.visible ?? metadata.visible) && policy.visible && policy.allowed;
    const readonly = Boolean(field.readonly ?? metadata.readonly) || !policy.editable;

    return {
      fieldCode: field.fieldCode,
      component: field.component,
      order: field.order,
      required: field.required ?? metadata.required,
      readonly,
      visible,
      binding: {
        source: field.binding?.source ?? 'FORM',
        fieldCode: field.binding?.fieldCode ?? field.fieldCode,
        path: `document.data.${field.binding?.fieldCode ?? field.fieldCode}`,
      },
      validation: field.validation,
      metadata,
      ui: {
        molecule: 'FORM_FIELD',
        atom: field.component,
        binding: {
          source: 'FORM',
          fieldCode: field.binding?.fieldCode ?? field.fieldCode,
        },
      },
      themeToken: {
        radius: 'medium',
        density: theme.layout.density,
      },
      ...lookup,
    };
  }

  private async composeLookup(
    context: RuntimeContext,
    relationCode: string,
    viewCode: string,
    relations: RelationPlan[],
  ): Promise<Pick<ComposedFormField, 'relation' | 'view'>> {
    const relation = relations.find((candidate) => candidate.code === relationCode);

    if (!relation) {
      throw new NotFoundException(`Relation metadata ${relationCode} was not found.`);
    }

    const view = await this.metadataResolver.resolveView(context, relation.targetEntity, viewCode);

    if (!view) {
      throw new NotFoundException(`Metadata VIEW:${relation.targetEntity}:${viewCode} was not found.`);
    }

    return {
      relation: {
        code: relation.code,
        target: relation.targetEntity,
        valueField: relation.lookup?.valueField ?? relation.mapping.targetField,
        displayField: relation.lookup?.displayField,
      },
      view: {
        code: view.definition.code,
        entityCode: view.definition.entityCode,
        type: view.definition.type,
        columns: view.definition.columns,
      },
    };
  }
}
