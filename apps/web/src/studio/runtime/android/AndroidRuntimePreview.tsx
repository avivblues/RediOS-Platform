import type { CanvasComponent } from '../../builder/types';

export function AndroidRuntimePreview({ components }: { components: CanvasComponent[] }) {
  return (
    <div className="redos-runtime-frame redos-runtime-android">
      {components.map((component) => (
        <div key={component.id}>{component.label}</div>
      ))}
    </div>
  );
}
