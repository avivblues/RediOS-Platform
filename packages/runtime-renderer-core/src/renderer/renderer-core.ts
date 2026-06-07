import type { RuntimeRendererContext } from '../context/runtime-context';
import type { PlatformAdapter, PlatformRenderContext } from '../platform/platform-adapter';
import { buildRuntimeTree, type RuntimeNode, type RuntimeTreeInput } from './renderer-tree';

export interface RuntimeRendererCoreInput extends Omit<RuntimeTreeInput, 'platform'> {
  context: RuntimeRendererContext;
}

export function generateRuntimeTree(input: RuntimeRendererCoreInput): RuntimeNode[] {
  return buildRuntimeTree({
    ...input,
    platform: input.context.platform,
  });
}

export function generatePreviewTree(input: RuntimeRendererCoreInput): RuntimeNode[] {
  return generateRuntimeTree(input);
}

export function renderRuntimeTree<TOutput>(
  nodes: RuntimeNode[],
  adapter: PlatformAdapter<TOutput>,
  context: RuntimeRendererContext,
): TOutput[] {
  const renderContext: PlatformRenderContext = {
    rendererContext: context,
  };

  return nodes.map((node) => renderNode(node, adapter, renderContext));
}

function renderNode<TOutput>(
  node: RuntimeNode,
  adapter: PlatformAdapter<TOutput>,
  context: PlatformRenderContext,
): TOutput {
  const children = node.children.map((child) => renderNode(child, adapter, context));
  return adapter.render(node, children, context);
}
