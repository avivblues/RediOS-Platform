import type React from 'react';
import { resolveComponentRenderer } from '../registry/component-registry';
import type { RuntimeRenderContext } from './render-context';
import type {
  ResolvedUIAtom,
  ResolvedUIMolecule,
  ResolvedUIOrganism,
  ResolvedUIPage,
  ResolvedUIRegion,
  RuntimeFormField,
} from './runtime-types';

export function RuntimeRenderer({ page, context }: { page: ResolvedUIPage; context: RuntimeRenderContext }) {
  const regions = page.template.regions.map((templateRegion) => ({
    code: templateRegion.code,
    region: page.regions.find((candidate) => candidate.code === templateRegion.code),
  }));

  return (
    <>
      {regions.map(({ code, region }) => (
        <RuntimeRegionRenderer key={code} regionCode={code} region={region} context={context} />
      ))}
    </>
  );
}

function RuntimeRegionRenderer({
  regionCode,
  region,
  context,
}: {
  regionCode: string;
  region?: ResolvedUIRegion;
  context: RuntimeRenderContext;
}) {
  return (
    <section className="runtime-region" data-region={regionCode}>
      {region?.components.map((organism) => (
        <RuntimeOrganismRenderer key={organism.code} organism={organism} context={context} />
      ))}
    </section>
  );
}

function RuntimeOrganismRenderer({ organism, context }: { organism: ResolvedUIOrganism; context: RuntimeRenderContext }) {
  const Renderer = resolveComponentRenderer(organism.code);
  const children = organism.molecules.flatMap((molecule) => renderMoleculeBinding(molecule, context));

  return (
    <Renderer node={organism} context={context}>
      {children}
    </Renderer>
  );
}

function renderMoleculeBinding(molecule: ResolvedUIMolecule, context: RuntimeRenderContext): React.ReactNode[] {
  if (molecule.bind === 'fields') {
    const fields = context.form?.sections.flatMap((section) => section.fields).filter((field) => field.visible) ?? [];
    return fields.map((field) => (
      <RuntimeMoleculeRenderer
        key={`${molecule.code}:${field.fieldCode}`}
        molecule={molecule}
        context={{
          ...context,
          activeField: field,
        }}
      />
    ));
  }

  return [<RuntimeMoleculeRenderer key={molecule.code} molecule={molecule} context={context} />];
}

function RuntimeMoleculeRenderer({ molecule, context }: { molecule: ResolvedUIMolecule; context: RuntimeRenderContext }) {
  const Renderer = resolveComponentRenderer(molecule.code);

  return (
    <Renderer node={molecule} context={context}>
      {molecule.atoms.map((atom) => (
        <RuntimeAtomRenderer key={`${atom.code}:${atom.bind}`} atom={effectiveAtom(atom, context.activeField)} context={context} />
      ))}
    </Renderer>
  );
}

function RuntimeAtomRenderer({ atom, context }: { atom: ResolvedUIAtom; context: RuntimeRenderContext }) {
  const Renderer = resolveComponentRenderer(atom.code);
  return <Renderer node={atom} context={context} />;
}

function effectiveAtom(atom: ResolvedUIAtom, field?: RuntimeFormField): ResolvedUIAtom {
  if (!field || atom.bind !== 'value') {
    return atom;
  }

  return {
    ...atom,
    code: field.component,
  };
}
