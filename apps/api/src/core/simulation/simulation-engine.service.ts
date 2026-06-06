import { Inject, Injectable } from '@nestjs/common';
import type {
  FieldDefinition,
  MetadataDefinition,
  RuntimeContext,
  RuntimeDocument,
  SimulationRequest,
  SimulationResult,
  SimulationStep,
  ValidationResult,
} from '@redios/shared';
import { ActionEngine } from '../action/action-engine.service';
import { BusinessEngine } from '../business/business-engine.service';
import { EventEngine } from '../event/event-engine.service';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { MetadataValidatorEngine } from '../metadata/metadata-validator-engine.service';
import { ProcessEngine } from '../process/process-engine.service';
import { SecurityEngine } from '../security/security-engine.service';
import { WorkflowEngine } from '../workflow/workflow-engine.service';

@Injectable()
export class SimulationEngine {
  constructor(
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
    private readonly metadataResolver: MetadataResolver,
    private readonly metadataValidatorEngine: MetadataValidatorEngine,
    private readonly actionEngine: ActionEngine,
    private readonly securityEngine: SecurityEngine,
    private readonly workflowEngine: WorkflowEngine,
    private readonly processEngine: ProcessEngine,
    private readonly businessEngine: BusinessEngine,
    private readonly eventEngine: EventEngine,
  ) {}

  async simulate(request: SimulationRequest): Promise<SimulationResult> {
    const context = this.toContext(request);
    const steps: SimulationStep[] = [];
    const predicted: SimulationResult['predicted'] = {};
    const validation = await this.validateMetadata(context, request.entityCode);

    steps.push({
      stage: 'VALIDATION',
      status: validation.valid ? 'SUCCESS' : 'FAILED',
      message: validation.valid ? 'Metadata validation passed.' : 'Metadata validation failed.',
      result: validation,
    });

    if (!validation.valid) {
      return {
        success: false,
        validation,
        steps,
        predicted,
      };
    }

    const entity = await this.runStep(steps, 'VALIDATION', 'Entity metadata resolved.', () =>
      this.metadataResolver.resolveEntity(context, request.entityCode),
    );

    if (!entity.ok) {
      return this.failed(validation, steps, predicted);
    }

    const fields = await this.runStep(steps, 'VALIDATION', 'Field metadata resolved.', () =>
      this.metadataResolver.resolveFields(context, entity.value.definition.fieldCodes),
    );

    if (!fields.ok) {
      return this.failed(validation, steps, predicted);
    }

    const requiredFields = this.validateRequiredFields(request, fields.value.map((field) => field.definition));

    if (requiredFields.length > 0) {
      steps.push({
        stage: 'ACTION',
        status: 'FAILED',
        message: `Required fields are missing: ${requiredFields.join(', ')}`,
        error: {
          code: 'FIELD_REQUIRED',
          message: `Required fields are missing: ${requiredFields.join(', ')}`,
        },
      });
      return this.failed(validation, steps, predicted);
    }

    const action = await this.runStep(steps, 'ACTION', 'Action is available.', () =>
      this.actionEngine.resolve(context, request.entityCode, request.actionCode),
    );

    if (!action.ok) {
      return this.failed(validation, steps, predicted);
    }

    const security = await this.runStep(steps, 'SECURITY', 'Action permission is valid.', () => {
      this.securityEngine.validateActionAccess(context, action.value);
      return {
        allowed: true,
      };
    });

    if (!security.ok) {
      return this.failed(validation, steps, predicted);
    }

    const document = await this.createMockDocument(context, request);
    const workflow = await this.runStep(steps, 'WORKFLOW', 'Workflow transition predicted.', () =>
      this.workflowEngine.transition(context, request.entityCode, document.status, request.actionCode),
    );

    if (!workflow.ok) {
      return this.failed(validation, steps, predicted);
    }

    predicted.workflow = {
      from: workflow.value.from,
      to: workflow.value.to,
    };
    document.status = workflow.value.to || document.status;
    document.data = {
      ...document.data,
      ...(request.payload ?? {}),
    };

    const process = await this.runStep(steps, 'PROCESS', 'Process plan predicted.', () =>
      this.processEngine.execute(context, request.entityCode, request.actionCode, workflow.value, document),
    );

    if (!process.ok) {
      return this.failed(validation, steps, predicted);
    }

    predicted.process = {
      executed: process.value.executed,
      processCode: process.value.processCode,
    };

    if (!process.value.executed) {
      steps.push({
        stage: 'PROCESS',
        status: 'SKIPPED',
        message: 'No process metadata matched this action.',
      });
    }

    const businessDocument = this.cloneDocument(document);
    const business = await this.runStep(steps, 'BUSINESS', 'Business rules predicted.', () =>
      this.businessEngine.execute(context, request.entityCode, businessDocument, process.value),
    );

    if (!business.ok) {
      return this.failed(validation, steps, predicted);
    }

    predicted.business = {
      rules: business.value.executedRules,
    };

    const events = await this.runStep(steps, 'EVENT', 'Event handlers predicted.', () =>
      this.eventEngine.publish(context, request.entityCode, businessDocument, {
        actionCode: request.actionCode,
        workflowState: workflow.value.transitioned ? workflow.value.to : undefined,
        processCode: process.value.processCode,
      }),
    );

    if (!events.ok) {
      return this.failed(validation, steps, predicted);
    }

    predicted.events = {
      events: events.value.events.map((event) => event.eventCode),
      handlers: events.value.events.flatMap((event) => event.handlers.map((handler) => handler.type)),
    };

    if (events.value.events.length === 0 || events.value.events.every((event) => event.handlers.length === 0)) {
      steps.push({
        stage: 'EVENT',
        status: 'SKIPPED',
        message: 'No event metadata or enabled event handlers matched this action.',
      });
    }

    return {
      success: steps.every((step) => step.status !== 'FAILED'),
      validation,
      steps,
      predicted,
    };
  }

  private async validateMetadata(context: RuntimeContext, entityCode: string): Promise<ValidationResult> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      enabledOnly: true,
    });
    return this.metadataValidatorEngine.validate(this.relevantMetadata(metadata, entityCode));
  }

  private relevantMetadata(metadata: MetadataDefinition[], entityCode: string): MetadataDefinition[] {
    return metadata.filter((metadataDefinition) => {
      if (metadataDefinition.type === 'ENTITY') {
        return metadataDefinition.code === entityCode;
      }

      if (
        metadataDefinition.type === 'FIELD' ||
        metadataDefinition.type === 'ACTION' ||
        metadataDefinition.type === 'WORKFLOW' ||
        metadataDefinition.type === 'PROCESS' ||
        metadataDefinition.type === 'BUSINESS' ||
        metadataDefinition.type === 'EVENT'
      ) {
        return this.definitionEntityCode(metadataDefinition.definition) === entityCode;
      }

      return false;
    });
  }

  private definitionEntityCode(definition: unknown): string | undefined {
    if (definition && typeof definition === 'object' && 'entityCode' in definition) {
      return (definition as { entityCode?: string }).entityCode;
    }

    return undefined;
  }

  private async runStep<T>(
    steps: SimulationStep[],
    stage: SimulationStep['stage'],
    successMessage: string,
    action: () => Promise<T> | T,
  ): Promise<{ ok: true; value: T } | { ok: false }> {
    try {
      const value = await action();
      steps.push({
        stage,
        status: 'SUCCESS',
        message: successMessage,
        result: value,
      });
      return {
        ok: true,
        value,
      };
    } catch (error) {
      steps.push({
        stage,
        status: 'FAILED',
        message: error instanceof Error ? error.message : String(error),
        error: {
          code: this.errorCode(stage, error),
          message: error instanceof Error ? error.message : String(error),
        },
      });
      return {
        ok: false,
      };
    }
  }

  private toContext(request: SimulationRequest): RuntimeContext {
    return {
      userId: request.userId ?? 'simulation',
      tenantId: request.tenantId,
      domainCode: request.domainCode,
      applicationCode: request.applicationCode,
      permissions: request.permissions ?? [],
      capabilities: [],
    };
  }

  private async createMockDocument(context: RuntimeContext, request: SimulationRequest): Promise<RuntimeDocument> {
    const initialStatus = request.currentState ?? (await this.workflowEngine.resolveInitialStatus(context, request.entityCode));
    const mockData = this.extractMockData(request.mockDocument);

    return {
      id: 'SIMULATED_DOCUMENT',
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      entityCode: request.entityCode,
      status: initialStatus,
      data: {
        ...mockData,
        ...(request.payload ?? {}),
      },
      metadataVersion: 1,
      createdBy: context.userId,
    };
  }

  private extractMockData(mockDocument: Record<string, unknown> | undefined): Record<string, unknown> {
    if (!mockDocument) {
      return {};
    }

    const data = mockDocument.data;
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : mockDocument;
  }

  private cloneDocument(document: RuntimeDocument): RuntimeDocument {
    return {
      ...document,
      data: {
        ...document.data,
      },
    };
  }

  private validateRequiredFields(request: SimulationRequest, fields: FieldDefinition[]): string[] {
    if (request.actionCode !== 'CREATE') {
      return [];
    }

    const payload = request.payload ?? {};
    return fields
      .filter((field) => field.required)
      .map((field) => field.code)
      .filter((fieldCode) => payload[fieldCode] === undefined || payload[fieldCode] === null || payload[fieldCode] === '');
  }

  private errorCode(stage: SimulationStep['stage'], error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);

    if (stage === 'SECURITY') {
      return 'PERMISSION_MISSING';
    }

    if (stage === 'WORKFLOW' && message.includes('Invalid workflow transition')) {
      return 'TRANSITION_NOT_FOUND';
    }

    if (message.includes('Required field is missing')) {
      return 'FIELD_REQUIRED';
    }

    return `${stage}_FAILED`;
  }

  private failed(
    validation: ValidationResult,
    steps: SimulationStep[],
    predicted: SimulationResult['predicted'],
  ): SimulationResult {
    return {
      success: false,
      validation,
      steps,
      predicted,
    };
  }
}
