import { useMemo, useState } from 'react';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import { humanizeCode } from '../humanizer/HumanizerEngine';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';

const searchableKeys: Array<{ key: keyof MetadataDebugTree; type: string; label: string }> = [
  { key: 'applications', type: 'APPLICATION', label: 'Application' },
  { key: 'entities', type: 'ENTITY', label: 'Entity' },
  { key: 'forms', type: 'FORMS', label: 'Form' },
  { key: 'ui', type: 'PAGES', label: 'Page' },
  { key: 'workflows', type: 'WORKFLOWS', label: 'Workflow' },
  { key: 'integrations', type: 'INTEGRATIONS', label: 'Integration' },
  { key: 'connectors', type: 'CONNECTORS', label: 'Connector' },
  { key: 'securityPolicies', type: 'SECURITY', label: 'Policy' },
];

export function StudioSearch({
  tree,
  onSelect,
}: {
  tree: MetadataDebugTree;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return searchableKeys
      .flatMap((entry) => {
        const values = tree[entry.key];
        return Array.isArray(values)
          ? values.map((code) => ({
              code,
              type: entry.type,
              category: entry.label,
              label: humanizeCode(code),
            }))
          : [];
      })
      .filter((item) => `${item.code} ${item.label} ${item.category}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [query, tree]);

  return (
    <div className="studio-search">
      <input className="studio-input" placeholder="Search metadata..." value={query} onChange={(event) => setQuery(event.target.value)} />
      {results.length > 0 ? (
        <div className="studio-search-results">
          {results.map((result) => (
            <button
              key={`${result.type}:${result.code}`}
              className="studio-tree-item"
              onClick={() => {
                onSelect({ type: result.type, code: result.code });
                setQuery('');
              }}
            >
              <strong>{result.category}</strong> {result.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
