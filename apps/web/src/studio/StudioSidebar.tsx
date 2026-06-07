import type { MetadataDebugTree } from '../core/api/metadata-client';
import type { ExplorerSelection } from './explorer/ApplicationExplorer';
import type { StudioMode } from './mode/studio-mode';
import { createStudioNavigation, firstCodeForItem, STUDIO_NAVIGATION } from './navigation/studio-navigation';
import { StudioSearch } from './search/StudioSearch';

export function StudioSidebar({
  tree,
  selection,
  mode,
  onSelect,
}: {
  tree: MetadataDebugTree;
  selection?: ExplorerSelection;
  mode: StudioMode;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  const studioItems = createStudioNavigation(tree, mode);
  const groups = ['BUILD', 'AUTOMATE', 'CONTROL', 'SYSTEM'] as const;

  return (
    <aside className="studio-sidebar">
      <div className="studio-sidebar-brand">
        <span className="studio-kicker">{STUDIO_NAVIGATION}</span>
        <strong>Studio</strong>
      </div>
      <StudioSearch tree={tree} onSelect={onSelect} />
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
