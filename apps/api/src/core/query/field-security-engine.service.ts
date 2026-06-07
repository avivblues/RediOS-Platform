import { Injectable } from '@nestjs/common';
import type { RuntimeContext, ViewColumnDefinition } from '@redios/shared';

@Injectable()
export class FieldSecurityEngine {
  filterVisibleColumns(_context: RuntimeContext, columns: ViewColumnDefinition[]): ViewColumnDefinition[] {
    return columns;
  }
}
