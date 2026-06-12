import type { DragEvent, PointerEvent as ReactPointerEvent } from 'react';
import type {
  BuilderComponentDefinition,
  CanvasComponent,
  ComponentMoveDirection,
  ComponentResizeDirection,
  StudioDevice,
  StudioTarget,
} from '../types';

const REDIOS_COMPONENT_MIME = 'application/x-redios-component';
const GRID_COLUMNS = 12;
const GRID_ROW_HEIGHT = 92;
const MIN_COMPONENT_HEIGHT = 48;

export function Canvas({
  components,
  device,
  isPreviewing,
  selectedId,
  target,
  onAddComponent,
  onDeleteComponent,
  onMoveComponentToIndex,
  onRelocateComponent,
  onResizeComponent,
  onSelect,
  onUpdateComponentLayout,
}: {
  components: CanvasComponent[];
  device: StudioDevice;
  isPreviewing: boolean;
  selectedId?: string;
  target: StudioTarget;
  onAddComponent: (component: BuilderComponentDefinition, insertIndex?: number) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponentToIndex: (id: string, index: number) => void;
  onRelocateComponent: (id: string, direction: ComponentMoveDirection) => void;
  onResizeComponent: (id: string, direction: ComponentResizeDirection) => void;
  onSelect: (id: string) => void;
  onUpdateComponentLayout: (id: string, next: Partial<Pick<CanvasComponent, 'height' | 'width' | 'x'>>) => void;
}) {
  function handleCanvasDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const definition = componentDefinitionFromDrop(event);

    if (!definition) {
      return;
    }

    onAddComponent(definition);
  }

  function handleComponentDrop(event: DragEvent<HTMLDivElement>, targetId: string, targetIndex: number) {
    event.preventDefault();
    event.stopPropagation();

    const definition = componentDefinitionFromDrop(event);

    if (definition) {
      onAddComponent(definition, targetIndex);
    }
  }

  function startCursorMove(event: ReactPointerEvent<HTMLButtonElement>, component: CanvasComponent, index: number) {
    const screen = event.currentTarget.closest('.redos-screen');

    if (!(screen instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(component.id);

    const bounds = screen.getBoundingClientRect();
    const columnWidth = bounds.width / GRID_COLUMNS;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startX = component.x;

    function handlePointerMove(pointerEvent: PointerEvent) {
      pointerEvent.preventDefault();
      const columnDelta = Math.round((pointerEvent.clientX - startClientX) / columnWidth);
      const rowDelta = Math.round((pointerEvent.clientY - startClientY) / GRID_ROW_HEIGHT);

      onUpdateComponentLayout(component.id, { x: startX + columnDelta });
      onMoveComponentToIndex(component.id, index + rowDelta);
    }

    function stopPointerMove() {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopPointerMove);
      window.removeEventListener('pointercancel', stopPointerMove);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopPointerMove);
    window.addEventListener('pointercancel', stopPointerMove);
  }

  function startCursorResize(event: ReactPointerEvent<HTMLButtonElement>, component: CanvasComponent) {
    const screen = event.currentTarget.closest('.redos-screen');

    if (!(screen instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(component.id);

    const bounds = screen.getBoundingClientRect();
    const columnWidth = bounds.width / GRID_COLUMNS;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startWidth = component.width;
    const startHeight = component.height;

    function handlePointerMove(pointerEvent: PointerEvent) {
      pointerEvent.preventDefault();
      const widthDelta = Math.round((pointerEvent.clientX - startClientX) / columnWidth);
      const heightDelta = Math.round((pointerEvent.clientY - startClientY) / 12) * 12;

      onUpdateComponentLayout(component.id, {
        height: Math.max(MIN_COMPONENT_HEIGHT, startHeight + heightDelta),
        width: startWidth + widthDelta,
      });
    }

    function stopPointerResize() {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopPointerResize);
      window.removeEventListener('pointercancel', stopPointerResize);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopPointerResize);
    window.addEventListener('pointercancel', stopPointerResize);
  }

  return (
    <section className="redos-canvas">
      <div className="redos-canvas-toolbar">
        <div>
          <span className="redos-kicker">{isPreviewing ? 'Runtime Preview' : 'Experience Canvas'}</span>
          <h2>Product Screen</h2>
        </div>
        <div className="redos-canvas-badges">
          <span>{target === 'android' ? 'Android' : 'Web'}</span>
          <span>{device}</span>
        </div>
      </div>

      <div
        className={`redos-screen redos-screen-${device.toLowerCase()}`}
        data-preview={isPreviewing ? 'runtime' : 'builder'}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={handleCanvasDrop}
      >
        {components.length === 0 ? (
          <div className="redos-empty-canvas">
            <strong>Drop a component here</strong>
            <span>Drag Input, Dropdown, Button, Table, or a mobile capability from the left panel.</span>
          </div>
        ) : null}
        {components.map((component, index) => (
          <div
            key={component.id}
            aria-label={`Select ${component.label}`}
            role="button"
            tabIndex={0}
            className={selectedId === component.id ? 'redos-canvas-component redos-canvas-component-selected' : 'redos-canvas-component'}
            style={{
              gridColumn: `${component.x + 1} / span ${component.width}`,
              minHeight: component.height,
            }}
            onClick={() => onSelect(component.id)}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(event) => handleComponentDrop(event, component.id, index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(component.id);
              }

              if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                onDeleteComponent(component.id);
              }

              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                onRelocateComponent(component.id, event.shiftKey ? 'up' : 'left');
              }

              if (event.key === 'ArrowRight') {
                event.preventDefault();
                onRelocateComponent(component.id, event.shiftKey ? 'down' : 'right');
              }

              if (event.key === '+' || event.key === '=') {
                event.preventDefault();
                onResizeComponent(component.id, event.shiftKey ? 'taller' : 'wider');
              }

              if (event.key === '-' || event.key === '_') {
                event.preventDefault();
                onResizeComponent(component.id, event.shiftKey ? 'shorter' : 'narrower');
              }
            }}
          >
            {selectedId === component.id ? (
              <CursorCanvasControls
                component={component}
                onDeleteComponent={onDeleteComponent}
                onStartMove={(event) => startCursorMove(event, component, index)}
                onStartResize={(event) => startCursorResize(event, component)}
              />
            ) : null}
            <button
              aria-label={`Delete ${component.label}`}
              className="redos-canvas-delete"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteComponent(component.id);
              }}
            >
              Delete
            </button>
            <CanvasPreview component={component} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CursorCanvasControls({
  component,
  onDeleteComponent,
  onStartMove,
  onStartResize,
}: {
  component: CanvasComponent;
  onDeleteComponent: (id: string) => void;
  onStartMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onStartResize: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="redos-cursor-controls" onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
      <button
        aria-label={`Move ${component.label}`}
        className="redos-cursor-move-handle"
        type="button"
        onPointerDown={onStartMove}
        title="Drag to relocate"
      >
        Move
      </button>
      <button className="redos-canvas-control-danger" type="button" onClick={() => onDeleteComponent(component.id)}>Delete</button>
      <button
        aria-label={`Resize ${component.label}`}
        className="redos-cursor-resize-handle"
        type="button"
        onPointerDown={onStartResize}
        title="Drag to resize"
      >
        Resize
      </button>
    </div>
  );
}

function componentDefinitionFromDrop(event: DragEvent) {
  const rawDefinition = event.dataTransfer.getData(REDIOS_COMPONENT_MIME);

  if (!rawDefinition) {
    return undefined;
  }

  try {
    const definition = JSON.parse(rawDefinition) as BuilderComponentDefinition;

    if (!definition.type || !definition.label || !definition.layer) {
      return undefined;
    }

    return definition;
  } catch {
    return undefined;
  }
}

function CanvasPreview({ component }: { component: CanvasComponent }) {
  if (component.type === 'Button') {
    return (
      <span className="redos-button-preview">
        {component.label}
        {component.events?.onClick ? <small>{component.events.onClick}</small> : null}
      </span>
    );
  }

  if (component.type === 'Table') {
    return (
      <span className="redos-table-preview">
        <strong>{component.label}</strong>
        <small>Name | Stock | Price</small>
      </span>
    );
  }

  if (component.type === 'Checkbox') {
    return (
      <label className="redos-checkbox-preview">
        <input readOnly type="checkbox" />
        {component.label}
      </label>
    );
  }

  if (component.type === 'Image') {
    return (
      <span className="redos-image-preview">
        <span>Image</span>
        <strong>{component.label}</strong>
      </span>
    );
  }

  if (component.type === 'Search') {
    return (
      <label>
        {component.label}
        <input readOnly placeholder={component.placeholder || 'Search experience'} type="search" />
      </label>
    );
  }

  if (component.type === 'Dropdown' || component.type === 'Lookup') {
    return (
      <label>
        {component.label}
        <select disabled><option>{component.placeholder || 'Select value'}</option></select>
      </label>
    );
  }

  if (component.type === 'TextArea') {
    return (
      <label>
        {component.label}
        <textarea readOnly placeholder={component.placeholder || component.label} />
      </label>
    );
  }

  if (['Camera', 'GPS', 'Barcode', 'OfflineStorage', 'PushNotification', 'UploadField'].includes(component.type)) {
    return (
      <span className="redos-capability-preview">
        <strong>{component.label}</strong>
        <small>{component.type === 'OfflineStorage' ? 'Offline-ready mobile capability' : 'Runtime capability'}</small>
      </span>
    );
  }

  if (component.type.startsWith('Custom') || ['Form', 'Dashboard', 'WorkflowPanel', 'Timeline'].includes(component.type)) {
    return (
      <span className="redos-organism-preview">
        <strong>{component.label}</strong>
        <small>Composed experience block</small>
      </span>
    );
  }

  return (
    <label>
      {component.label}
      <input readOnly placeholder={component.placeholder || component.label} />
      {component.binding ? <small>{component.binding.object}.{component.binding.field}</small> : null}
    </label>
  );
}
