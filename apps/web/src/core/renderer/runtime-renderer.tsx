import { generateRuntimeTree, type RuntimeNode } from '@redios/runtime-renderer-core';
import type React from 'react';
import { resolveComponentRenderer } from '../registry/component-registry';
import type { RuntimeRenderContext } from './render-context';
import type { ResolvedUIPage } from './runtime-types';

export function RuntimeRenderer({ page, context }: { page: ResolvedUIPage; context: RuntimeRenderContext }) {
  const nodes = generateRuntimeTree({
    page,
    form: context.form,
    context: context.rendererContext,
  });

  return <>{nodes.map((node) => renderRuntimeNode(node, context))}</>;
}

function renderRuntimeNode(node: RuntimeNode, context: RuntimeRenderContext): React.ReactNode {
  if (!node.permissions.visible) {
    return null;
  }

  if (node.kind === 'PAGE' || node.kind === 'TEMPLATE' || node.kind === 'REGION') {
    return (
      <section key={node.id} className={node.kind === 'REGION' ? 'runtime-region' : undefined} data-component={node.component}>
        {node.children.map((child) => renderRuntimeNode(child, context))}
      </section>
    );
  }

  const Renderer = resolveComponentRenderer(node.component);
  const fieldCode = typeof node.props.fieldCode === 'string' ? node.props.fieldCode : undefined;
  const activeField = fieldCode ? context.form?.sections.flatMap((section) => section.fields).find((field) => field.fieldCode === fieldCode) : undefined;
  const scopedContext = {
    ...context,
    activeField,
  };

  return (
    <Renderer key={node.id} node={node} context={scopedContext}>
      {node.children.map((child) => renderRuntimeNode(child, scopedContext))}
    </Renderer>
  );
}
