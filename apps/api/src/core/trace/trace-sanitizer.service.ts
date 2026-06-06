import { Injectable } from '@nestjs/common';

export type TraceSanitizerStrategy = 'MASK';

export interface TraceSanitizerRule {
  field: string;
  strategy: TraceSanitizerStrategy;
}

@Injectable()
export class TraceSanitizer {
  private readonly maskedValue = '***MASKED***';
  private readonly maskedFields = new Set([
    'password',
    'secret',
    'token',
    'accesstoken',
    'refreshtoken',
    'apikey',
    'authorization',
    'credential',
  ]);

  clean(value: unknown, rules: TraceSanitizerRule[] = []): unknown {
    return this.cleanValue(value, this.createMaskedFields(rules));
  }

  private cleanValue(value: unknown, maskedFields: Set<string>): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((entry) => this.cleanValue(entry, maskedFields));
    }

    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((result, [key, entry]) => {
        result[key] = maskedFields.has(this.normalizeField(key)) ? this.maskedValue : this.cleanValue(entry, maskedFields);
        return result;
      }, {});
    }

    return value;
  }

  private createMaskedFields(rules: TraceSanitizerRule[]): Set<string> {
    const maskedFields = new Set(this.maskedFields);

    for (const rule of rules) {
      if (rule.strategy === 'MASK') {
        maskedFields.add(this.normalizeField(rule.field));
      }
    }

    return maskedFields;
  }

  private normalizeField(field: string): string {
    return field.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }
}
