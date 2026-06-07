import type { RuntimeNavigation, RuntimeNavigationItem } from '../../../core/renderer/runtime-types';

export function NavigationRenderer({ navigation }: { navigation: RuntimeNavigation }) {
  return (
    <nav className="runtime-card" data-navigation={navigation.layout} aria-label={navigation.navigation}>
      {navigation.items.map((item) => (
        <NavigationItemRenderer key={item.code} item={item} />
      ))}
    </nav>
  );
}

function NavigationItemRenderer({ item }: { item: RuntimeNavigationItem }) {
  const href = item.page ? `/runtime/${item.page}` : item.url;

  return (
    <div>
      {href ? <a href={href}>{item.label}</a> : <span>{item.label}</span>}
      {item.children.length > 0 ? (
        <div>
          {item.children.map((child) => (
            <NavigationItemRenderer key={child.code} item={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
