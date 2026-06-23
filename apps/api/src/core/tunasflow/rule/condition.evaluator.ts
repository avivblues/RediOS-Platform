import { Injectable } from '@nestjs/common';
import type { RuntimeDocument } from '@redios/shared';

export type ConditionOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'contains';

export interface StructuredCondition {
  field: string;
  operator?: ConditionOperator;
  value?: unknown;
}

@Injectable()
export class ConditionEvaluator {
  evaluate(document: RuntimeDocument, condition: unknown): boolean {
    if (condition === undefined || condition === null || condition === '') {
      return true;
    }

    if (typeof condition === 'string') {
      return this.evaluateExpression(document, condition);
    }

    if (typeof condition === 'object' && !Array.isArray(condition)) {
      return this.evaluateStructured(document, condition as StructuredCondition);
    }

    return true;
  }

  private evaluateStructured(document: RuntimeDocument, condition: StructuredCondition): boolean {
    if (!condition.field) {
      return true;
    }

    const left = document.data?.[condition.field];
    const operator = condition.operator ?? 'eq';
    return this.compare(left, operator, condition.value);
  }

  private evaluateExpression(document: RuntimeDocument, expression: string): boolean {
    const trimmed = expression.trim();
    const match = trimmed.match(/^([a-zA-Z_][\w]*)\s*(>=|<=|>|<|==|!=)\s*(.+)$/);

    if (!match) {
      return true;
    }

    const field = match[1];
    const operatorToken = match[2];
    const rawValue = match[3].trim();
    const left = document.data?.[field];
    const operator = this.tokenToOperator(operatorToken);
    const right = this.parseLiteral(rawValue);

    return this.compare(left, operator, right);
  }

  private tokenToOperator(token: string): ConditionOperator {
    switch (token) {
      case '>':
        return 'gt';
      case '>=':
        return 'gte';
      case '<':
        return 'lt';
      case '<=':
        return 'lte';
      case '==':
        return 'eq';
      case '!=':
        return 'neq';
      default:
        return 'eq';
    }
  }

  private parseLiteral(raw: string): unknown {
    if (/^["'].*["']$/.test(raw)) {
      return raw.slice(1, -1);
    }

    if (/^-?\d+(\.\d+)?$/.test(raw)) {
      return Number(raw);
    }

    if (raw === 'true') {
      return true;
    }

    if (raw === 'false') {
      return false;
    }

    return raw;
  }

  private compare(left: unknown, operator: ConditionOperator, right: unknown): boolean {
    if (operator === 'contains') {
      return String(left ?? '').toLowerCase().includes(String(right ?? '').toLowerCase());
    }

    const numericLeft = this.toNumber(left);
    const numericRight = this.toNumber(right);
    const useNumeric = numericLeft !== null && numericRight !== null;

    switch (operator) {
      case 'gt':
        return useNumeric ? numericLeft! > numericRight! : String(left) > String(right);
      case 'gte':
        return useNumeric ? numericLeft! >= numericRight! : String(left) >= String(right);
      case 'lt':
        return useNumeric ? numericLeft! < numericRight! : String(left) < String(right);
      case 'lte':
        return useNumeric ? numericLeft! <= numericRight! : String(left) <= String(right);
      case 'eq':
        return useNumeric ? numericLeft === numericRight : String(left) === String(right);
      case 'neq':
        return useNumeric ? numericLeft !== numericRight : String(left) !== String(right);
      default:
        return true;
    }
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }
}
