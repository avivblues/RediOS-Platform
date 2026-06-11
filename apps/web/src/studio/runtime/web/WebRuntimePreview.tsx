import type { CanvasComponent } from '../../builder/types';

export function WebRuntimePreview({ components }: { components: CanvasComponent[] }) {
  return (
    <div className="redos-runtime-frame redos-runtime-web">
      {components.map((component) => (
        <div key={component.id}>{component.label}</div>
      ))}
    </div>
  );
}
