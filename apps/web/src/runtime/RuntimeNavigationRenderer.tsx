import type { RuntimeNavigation, RuntimeNavigationItem } from '../core/renderer/runtime-types';

interface RuntimeNavigationRendererProps {
  applicationCode: string;
  navigation: RuntimeNavigation;
  activePageCode?: string;
  onSelectPage: (pageCode: string) => void;
}

export function RuntimeNavigationRenderer({ applicationCode, navigation, activePageCode, onSelectPage }: RuntimeNavigationRendererProps) {
  return (
    <nav className="runtime-card runtime-app-navigation" data-navigation={navigation.layout} aria-label={navigation.navigation}>
      <a className="runtime-app-home" href={`/apps/${applicationCode}`}>
        {navigation.navigation}
      </a>
      {navigation.items.map((item) => (
        <RuntimeNavigationItemRenderer key={item.code} item={item} activePageCode={activePageCode} onSelectPage={onSelectPage} />
      ))}
    </nav>
  );
}

function RuntimeNavigationItemRenderer({
  item,
  activePageCode,
  onSelectPage,
}: {
  item: RuntimeNavigationItem;
  activePageCode?: string;
  onSelectPage: (pageCode: string) => void;
}) {
  const pageCode = item.page ?? (item.target.type === 'PAGE' ? item.target.code : undefined);

  return (
    <div className="runtime-app-nav-item">
      {pageCode ? (
        <button className={pageCode === activePageCode ? 'runtime-app-nav-link runtime-app-nav-link-active' : 'runtime-app-nav-link'} type="button" onClick={() => onSelectPage(pageCode)}>
          {item.label}
        </button>
      ) : item.url ? (
        <a className="runtime-app-nav-link" href={item.url}>
          {item.label}
        </a>
      ) : (
        <span className="runtime-app-nav-label">{item.label}</span>
      )}
      {item.children.length > 0 ? (
        <div className="runtime-app-nav-children">
          {item.children.map((child) => (
            <RuntimeNavigationItemRenderer key={child.code} item={child} activePageCode={activePageCode} onSelectPage={onSelectPage} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
