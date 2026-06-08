import { useEffect, useMemo, useState } from 'react';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import type { StudioMode } from '../mode/studio-mode';
import { CommandPalette, type StudioCommand } from './CommandPalette';

export function StudioCommandCenter({
  tree,
  mode,
  onSelect,
}: {
  tree: MetadataDebugTree;
  mode: StudioMode;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  const [open, setOpen] = useState(false);
  const commands = useMemo(() => createCommands(tree, mode, onSelect), [tree, mode, onSelect]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button className="studio-command-button" type="button" aria-label="Open Studio command center" onClick={() => setOpen(true)}>
        Command Center <kbd>⌘K</kbd>
      </button>
      <CommandPalette commands={commands} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function createCommands(tree: MetadataDebugTree, mode: StudioMode, onSelect: (selection: ExplorerSelection) => void): StudioCommand[] {
  const firstForm = tree.forms[0] ?? 'FORMS';
  const firstPage = tree.ui[0] ?? 'PAGES';
  const firstWorkflow = tree.workflows[0] ?? 'WORKFLOWS';
  const firstIntegration = tree.integrations[0] ?? tree.connectors[0] ?? 'INTEGRATIONS';
  const commands: StudioCommand[] = [
    {
      id: 'create-application',
      label: 'Create application',
      description: 'Start the guided application builder.',
      keywords: ['new', 'start blank', 'template'],
      run: () => onSelect({ type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' }),
    },
    {
      id: 'add-information',
      label: 'Add information',
      description: 'Open the builder for information and input screens.',
      keywords: ['field', 'data', 'object'],
      run: () => onSelect({ type: 'FORMS', code: firstForm }),
    },
    {
      id: 'create-screen',
      label: 'Create screen',
      description: 'Open screen and page design tools.',
      keywords: ['page', 'form', 'view'],
      run: () => onSelect({ type: 'PAGES', code: firstPage }),
    },
    {
      id: 'create-process',
      label: 'Create process',
      description: 'Open process and workflow tools.',
      keywords: ['workflow', 'automation'],
      run: () => onSelect({ type: 'WORKFLOWS', code: firstWorkflow }),
    },
    {
      id: 'connect-data',
      label: 'Connect data',
      description: 'Open connectors and integration tools.',
      keywords: ['integration', 'connector', 'webhook'],
      run: () => onSelect({ type: 'INTEGRATIONS', code: firstIntegration }),
    },
    {
      id: 'launch',
      label: 'Launch',
      description: 'Review application health and published version status.',
      keywords: ['publish', 'release', 'health'],
      run: () => onSelect({ type: 'RUNTIME', code: 'RUNTIME' }),
    },
  ];

  if (mode === 'EXPERT') {
    commands.push(
      {
        id: 'open-metadata',
        label: 'Open metadata',
        description: 'Inspect raw metadata tree.',
        keywords: ['debug', 'definition'],
        expertOnly: true,
        run: () => onSelect({ type: 'METADATA_EXPLORER', code: 'METADATA_EXPLORER' }),
      },
      {
        id: 'view-runtime-package',
        label: 'View runtime package',
        description: 'Inspect active runtime package status.',
        keywords: ['compiler', 'published version'],
        expertOnly: true,
        run: () => onSelect({ type: 'RUNTIME', code: 'RUNTIME' }),
      },
      {
        id: 'trace-execution',
        label: 'Trace execution',
        description: 'Open trace viewer tools.',
        keywords: ['audit', 'debug'],
        expertOnly: true,
        run: () => onSelect({ type: 'TRACE_VIEWER', code: 'TRACE_VIEWER' }),
      },
    );
  }

  return commands;
}
