import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  RuntimeContext,
  UIAtomDefinition,
  UIMoleculeDefinition,
  UIOrganismDefinition,
  UIPageDefinition,
  UITemplateDefinition,
} from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

export interface ResolvedUIAtom {
  code: string;
  category: UIAtomDefinition['category'];
  renderer: UIAtomDefinition['renderer'];
  propsSchema: UIAtomDefinition['propsSchema'];
  bind: string;
}

export interface ResolvedUIMolecule {
  code: string;
  bind: string;
  atoms: ResolvedUIAtom[];
}

export interface ResolvedUIOrganism {
  code: string;
  molecules: ResolvedUIMolecule[];
}

export interface ResolvedUIRegion {
  code: string;
  components: ResolvedUIOrganism[];
}

export interface ResolvedUIPage {
  page: UIPageDefinition;
  template: UITemplateDefinition;
  regions: ResolvedUIRegion[];
}

@Injectable()
export class UIEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async resolvePage(context: RuntimeContext, pageCode: string): Promise<ResolvedUIPage> {
    const page = await this.resolveDefinition<UIPageDefinition>(context, 'PAGE', pageCode);
    const template = await this.resolveDefinition<UITemplateDefinition>(context, 'TEMPLATE', page.template);

    return {
      page,
      template,
      regions: await Promise.all(
        template.regions.map(async (region) => ({
          code: region.code,
          components: await this.resolveRegion(context, page, region.code),
        })),
      ),
    };
  }

  async resolvePagesByEntity(context: RuntimeContext, entityCode: string): Promise<ResolvedUIPage[]> {
    const pages = await this.metadataResolver.resolveUIPages(context, entityCode);
    return Promise.all(pages.map((page) => this.resolvePage(context, page.definition.code)));
  }

  countAtoms(page: ResolvedUIPage): number {
    return page.regions.reduce(
      (regionCount, region) =>
        regionCount +
        region.components.reduce(
          (organismCount, organism) =>
            organismCount + organism.molecules.reduce((moleculeCount, molecule) => moleculeCount + molecule.atoms.length, 0),
          0,
        ),
      0,
    );
  }

  private async resolveRegion(
    context: RuntimeContext,
    page: UIPageDefinition,
    regionCode: string,
  ): Promise<ResolvedUIOrganism[]> {
    const organismCodes = page.regions[regionCode] ?? [];
    return Promise.all(organismCodes.map((organismCode) => this.resolveOrganism(context, organismCode)));
  }

  private async resolveOrganism(context: RuntimeContext, organismCode: string): Promise<ResolvedUIOrganism> {
    const organism = await this.resolveDefinition<UIOrganismDefinition>(context, 'ORGANISM', organismCode);

    return {
      code: organism.code,
      molecules: await Promise.all(
        organism.molecules.map(async (binding) => ({
          ...(await this.resolveMolecule(context, binding.molecule)),
          bind: binding.bind,
        })),
      ),
    };
  }

  private async resolveMolecule(context: RuntimeContext, moleculeCode: string): Promise<Omit<ResolvedUIMolecule, 'bind'>> {
    const molecule = await this.resolveDefinition<UIMoleculeDefinition>(context, 'MOLECULE', moleculeCode);

    return {
      code: molecule.code,
      atoms: await Promise.all(
        molecule.atoms.map(async (binding) => ({
          ...(await this.resolveAtom(context, binding.atom)),
          bind: binding.bind,
        })),
      ),
    };
  }

  private async resolveAtom(context: RuntimeContext, atomCode: string): Promise<Omit<ResolvedUIAtom, 'bind'>> {
    const atom = await this.resolveDefinition<UIAtomDefinition>(context, 'ATOM', atomCode);

    return {
      code: atom.code,
      category: atom.category,
      renderer: atom.renderer,
      propsSchema: atom.propsSchema,
    };
  }

  private async resolveDefinition<TDefinition>(
    context: RuntimeContext,
    kind: TDefinition extends UIPageDefinition
      ? 'PAGE'
      : TDefinition extends UITemplateDefinition
        ? 'TEMPLATE'
        : TDefinition extends UIOrganismDefinition
          ? 'ORGANISM'
          : TDefinition extends UIMoleculeDefinition
            ? 'MOLECULE'
            : 'ATOM',
    code: string,
  ): Promise<TDefinition> {
    const metadata = await this.metadataResolver.resolveUI(context, kind, code);

    if (!metadata) {
      throw new NotFoundException(`Metadata UI:${kind}:${code} was not found.`);
    }

    return metadata.definition as TDefinition;
  }
}
