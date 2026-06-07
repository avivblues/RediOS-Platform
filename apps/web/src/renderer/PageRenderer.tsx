import type { ResolvedUIAtom, ResolvedUIMolecule, ResolvedUIOrganism, ResolvedUIPage } from '../core/renderer/runtime-types';
import { EmptyState } from '../studio/empty/EmptyState';
import { renderRegisteredComponent } from './ComponentRegistry';

export function PageRenderer({ page }: { page?: ResolvedUIPage }) {
  if (!page) {
    return (
      <EmptyState
        title="No page selected yet"
        description="Choose an existing page or create a new metadata-driven page."
      />
    );
  }

  return (
    <div className="studio-page-preview">
      <div className="studio-card">
        <strong>PAGE</strong> {page.page.code}
      </div>
      <div className="studio-card">
        <strong>TEMPLATE</strong> {page.template.code}
      </div>
      {page.regions.map((region) => (
        <section key={region.code} className="studio-card">
          <h4>{region.code}</h4>
          {region.components.map((organism) => (
            <OrganismNode key={organism.code} organism={organism} />
          ))}
        </section>
      ))}
    </div>
  );
}

function OrganismNode({ organism }: { organism: ResolvedUIOrganism }) {
  return <>{renderRegisteredComponent(organism.code, organism.code, organism.molecules.map((molecule) => <MoleculeNode key={molecule.code} molecule={molecule} />))}</>;
}

function MoleculeNode({ molecule }: { molecule: ResolvedUIMolecule }) {
  return <>{renderRegisteredComponent(molecule.code, molecule.code, molecule.atoms.map((atom) => <AtomNode key={`${atom.code}:${atom.bind}`} atom={atom} />))}</>;
}

function AtomNode({ atom }: { atom: ResolvedUIAtom }) {
  return <>{renderRegisteredComponent(atom.code, atom.code)}</>;
}
