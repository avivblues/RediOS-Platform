import type { MetadataDebugTree } from '../core/api/metadata-client';
import type { RuntimeNavigation } from '../core/renderer/runtime-types';
import type { ExplorerSelection } from './explorer/ApplicationExplorer';
import { createStudioNavigation, firstCodeForItem } from './navigation/studio-navigation';
import { StudioSearch } from './search/StudioSearch';

export function StudioSidebar({
  navigation,
  tree,
  selection,
  onSelect,
}: {
  navigation: RuntimeNavigation;
  tree: MetadataDebugTree;
  selection?: ExplorerSelection;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  const studioItems = createStudioNavigation(tree);
  const groups = ['HOME', 'BUILD', 'EXPERIENCE', 'SECURITY', 'INTEGRATION', 'OPERATIONS'] as const;

  return (
    <aside className="studio-sidebar">
      <StudioSearch tree={tree} onSelect={onSelect} />
      <section className="studio-tree-group">
        <h3>Runtime Navigation</h3>
        {navigation.items.map((item) => (
          <div key={item.code} className="studio-tree-item">
            {item.label}
          </div>
        ))}
      </section>
      {groups.map((group) => {
        const groupItems = studioItems.filter((item) => item.group === group);

        if (groupItems.length === 0) {
          return null;
        }

        return (
          <section key={group} className="studio-tree-group">
            <h3>{group}</h3>
            {groupItems.map((item) => (
              <button
                key={item.code}
                className={selection?.type === item.selectionType ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'}
                onClick={() => onSelect({ type: item.selectionType, code: firstCodeForItem(item, tree) })}
              >
                {item.label}
              </button>
            ))}
          </section>
        );
      })}
    </aside>
  );
}
