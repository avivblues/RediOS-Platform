import { useMemo, useState } from 'react';

export interface StudioCommand {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  expertOnly?: boolean;
  run: () => void;
}

export function CommandPalette({
  commands,
  open,
  onClose,
}: {
  commands: StudioCommand[];
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return commands;
    }

    return commands.filter((command) =>
      [command.label, command.description, ...command.keywords].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [commands, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="studio-command-overlay" role="presentation" onClick={onClose}>
      <section
        className="studio-command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Studio command center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="studio-section-header">
          <div>
            <span className="studio-kicker">Command Center</span>
            <h3>What do you want to do?</h3>
          </div>
          <button className="studio-icon-button" type="button" aria-label="Close command center" onClick={onClose}>
            x
          </button>
        </div>
        <input
          autoFocus
          className="studio-input"
          placeholder="Search actions..."
          value={query}
          aria-label="Search Studio commands"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onClose();
            }
          }}
        />
        <div className="studio-command-list" role="listbox" aria-label="Available Studio commands">
          {filteredCommands.length === 0 ? <div className="studio-muted">No matching actions.</div> : null}
          {filteredCommands.map((command) => (
            <button
              key={command.id}
              className="studio-command-item"
              type="button"
              onClick={() => {
                command.run();
                setQuery('');
                onClose();
              }}
            >
              <strong>{command.label}</strong>
              <span>{command.description}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
