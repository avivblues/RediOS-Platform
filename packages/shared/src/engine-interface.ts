import type { RuntimeContext } from './runtime-context';

export interface EngineResult<TOutput = unknown> {
  ok: boolean;
  output?: TOutput;
  errors?: string[];
}

export interface EngineInterface<TInput = unknown, TOutput = unknown> {
  resolve(context: RuntimeContext, input: TInput): Promise<TInput>;
  validate(context: RuntimeContext, input: TInput): Promise<EngineResult<void>>;
  execute(context: RuntimeContext, input: TInput): Promise<EngineResult<TOutput>>;
}
