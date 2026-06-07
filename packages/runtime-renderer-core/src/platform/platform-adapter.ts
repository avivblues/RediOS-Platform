import type { RuntimeRendererContext } from '../context/runtime-context';
import type { RuntimeNode } from '../renderer/renderer-tree';

export interface PlatformRenderContext {
  rendererContext: RuntimeRendererContext;
}

export interface PlatformAdapter<TOutput = unknown> {
  render(node: RuntimeNode, children: TOutput[], context: PlatformRenderContext): TOutput;
}

export type ComponentAdapter<TOutput = unknown> = (
  node: RuntimeNode,
  children: TOutput[],
  context: PlatformRenderContext,
) => TOutput;

export class RegistryPlatformAdapter<TOutput = unknown> implements PlatformAdapter<TOutput> {
  constructor(
    private readonly registry: Record<string, ComponentAdapter<TOutput>>,
    private readonly fallback: ComponentAdapter<TOutput>,
  ) {}

  render(node: RuntimeNode, children: TOutput[], context: PlatformRenderContext): TOutput {
    return (this.registry[node.component] ?? this.fallback)(node, children, context);
  }
}
