import type { MetadataDebugTree } from '../../core/api/metadata-client';
import { Sidebar } from '../../components/atomic/organisms/Organisms';

export interface ExplorerSelection {
  type: string;
  code: string;
}

const groups: Array<{ key: keyof MetadataDebugTree; label: string }> = [
  { key: 'applications', label: 'Application' },
  { key: 'entities', label: 'Entity' },
  { key: 'forms', label: 'Forms' },
  { key: 'views', label: 'Views' },
  { key: 'workflows', label: 'Workflows' },
  { key: 'ui', label: 'Pages' },
  { key: 'securityPolicies', label: 'Security' },
  { key: 'navigation', label: 'Navigation' },
  { key: 'themes', label: 'Themes' },
];

export function ApplicationExplorer({
  tree,
  selection,
  onSelect,
}: {
  tree?: MetadataDebugTree;
  selection?: ExplorerSelection;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  return (
    <Sidebar>
      <h3>Metadata Explorer</h3>
      {!tree ? <div className="studio-empty">Loading metadata tree...</div> : null}
      {tree
        ? groups.map((group) => {
            const items = tree[group.key];
            return Array.isArray(items) && items.length > 0 ? (
              <div key={group.key} className="studio-tree-group">
                <strong>{group.label}</strong>
                {items.map((code) => (
                  <button
                    key={`${group.key}:${code}`}
                    className={selection?.code === code ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'}
                    onClick={() => onSelect({ type: group.label.toUpperCase(), code })}
                  >
                    {code}
                  </button>
                ))}
              </div>
            ) : null;
          })
        : null}
    </Sidebar>
  );
}
