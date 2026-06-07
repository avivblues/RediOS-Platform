import type { ReactNode } from 'react';
import type { RuntimeNavigation } from '../core/renderer/runtime-types';

export function StudioSidebar({
  navigation,
  explorer,
}: {
  navigation: RuntimeNavigation;
  explorer: ReactNode;
}) {
  return (
    <aside className="studio-sidebar">
      <section className="studio-tree-group">
        <h3>Navigation</h3>
        {navigation.items.map((item) => (
          <div key={item.code} className="studio-tree-item">
            {item.label}
          </div>
        ))}
      </section>
      {explorer}
    </aside>
  );
}
