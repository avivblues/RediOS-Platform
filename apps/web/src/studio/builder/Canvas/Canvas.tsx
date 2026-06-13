import type { CSSProperties, DragEvent, PointerEvent as ReactPointerEvent } from 'react';
import { atomComponents } from '../../atomic/atoms/catalog';
import { moleculeComponents } from '../../atomic/molecules/catalog';
import { organismComponents } from '../../atomic/organisms/catalog';
import { findCustomOrganism } from '../../metadata/metadata-store';
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
const componentCatalog = [...atomComponents, ...moleculeComponents, ...organismComponents];

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
  onAddComponent: (component: BuilderComponentDefinition, insertIndex?: number, parentId?: string) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponentToIndex: (id: string, index: number) => void;
  onRelocateComponent: (id: string, direction: ComponentMoveDirection) => void;
  onResizeComponent: (id: string, direction: ComponentResizeDirection) => void;
  onSelect: (id: string) => void;
  onUpdateComponentLayout: (id: string, next: Partial<Pick<CanvasComponent, 'height' | 'width' | 'x'>>) => void;
}) {
  function handleCanvasDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (isPreviewing) {
      return;
    }

    const definition = componentDefinitionFromDrop(event);

    if (!definition) {
      return;
    }

    onAddComponent(definition);
  }

  function handleComponentDrop(event: DragEvent<HTMLDivElement>, target: CanvasComponent, targetIndex: number) {
    event.preventDefault();
    event.stopPropagation();

    if (isPreviewing) {
      return;
    }

    const definition = componentDefinitionFromDrop(event);

    if (definition) {
      onAddComponent(definition, targetIndex, target.type === 'Form' ? target.id : undefined);
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
          event.dataTransfer.dropEffect = isPreviewing ? 'none' : 'copy';
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
            aria-label={isPreviewing ? component.label : `Select ${component.label}`}
            role={isPreviewing ? undefined : 'button'}
            tabIndex={isPreviewing ? -1 : 0}
            className={!isPreviewing && selectedId === component.id ? 'redos-canvas-component redos-canvas-component-selected' : 'redos-canvas-component'}
            style={{
              ...componentThemeStyle(component),
              gridColumn: `${component.x + 1} / span ${component.width}`,
              minHeight: componentUsesThemeVisualSizing(component.type) ? undefined : component.height,
            }}
            onClick={() => {
              if (!isPreviewing) {
                onSelect(component.id);
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = isPreviewing ? 'none' : 'copy';
            }}
            onDrop={(event) => handleComponentDrop(event, component, index)}
            onKeyDown={(event) => {
              if (isPreviewing) {
                return;
              }

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
            {!isPreviewing && selectedId === component.id ? (
              <CursorCanvasControls
                component={component}
                onDeleteComponent={onDeleteComponent}
                onStartMove={(event) => startCursorMove(event, component, index)}
                onStartResize={(event) => startCursorResize(event, component)}
              />
            ) : null}
            {!isPreviewing ? (
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
            ) : null}
            <CanvasPreview
              component={component}
              isPreviewing={isPreviewing}
              onDeleteComponent={onDeleteComponent}
              onSelect={onSelect}
              onMoveComponentToIndex={onMoveComponentToIndex}
              onRelocateComponent={onRelocateComponent}
              onUpdateComponentLayout={onUpdateComponentLayout}
              selectedId={selectedId}
            />
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

function CanvasPreview({
  component,
  isPreviewing,
  onDeleteComponent,
  onMoveComponentToIndex,
  onRelocateComponent,
  onSelect,
  onUpdateComponentLayout,
  selectedId,
}: {
  component: CanvasComponent;
  isPreviewing: boolean;
  onDeleteComponent: (id: string) => void;
  onMoveComponentToIndex: (id: string, index: number) => void;
  onRelocateComponent: (id: string, direction: ComponentMoveDirection) => void;
  onSelect: (id: string) => void;
  onUpdateComponentLayout: (id: string, next: Partial<Pick<CanvasComponent, 'height' | 'width' | 'x'>>) => void;
  selectedId?: string;
}) {
  const customOrganism = findCustomOrganism(component.type);

  if (customOrganism) {
    return <CustomOrganismCanvasPreview isPreviewing={isPreviewing} organism={customOrganism} />;
  }

  if (component.type === 'Form') {
    return (
      <FormCanvasPreview
        component={component}
        isPreviewing={isPreviewing}
        onDeleteComponent={onDeleteComponent}
        onMoveComponentToIndex={onMoveComponentToIndex}
        onRelocateComponent={onRelocateComponent}
        onSelect={onSelect}
        onUpdateComponentLayout={onUpdateComponentLayout}
        selectedId={selectedId}
      />
    );
  }

  if (component.type === 'Button') {
    const actionHint = componentActionHint(component, isPreviewing);

    return (
      <span className="redos-button-preview">
        {componentLabelOrFallback(component, 'Button')}
        {actionHint ? <small>{actionHint}</small> : null}
      </span>
    );
  }

  if (component.type === 'Table') {
    return (
      <span className="redos-table-preview">
        <strong>{componentLabelOrFallback(component, 'Table')}</strong>
        <small>Name | Stock | Price</small>
      </span>
    );
  }

  if (component.type === 'DataTable') {
    return <DataTablePreview title={componentLabelOrFallback(component, 'DataTable')} />;
  }

  if (component.type === 'InputTable') {
    return <InputTablePreview title={componentLabelOrFallback(component, 'Input table')} />;
  }

  if (component.type === 'Modal') {
    return <ModalPreview title={componentLabelOrFallback(component, 'Modal')} />;
  }

  if (component.type === 'ConfirmModal') {
    return <ConfirmModalPreview title={componentLabelOrFallback(component, 'Confirm modal')} />;
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
      <label className="redos-image-preview redos-file-picker-preview">
        <input className="redos-file-picker-input" type="file" accept="image/*" />
        <span>Image</span>
        <strong>{componentLabelOrFallback(component, 'Image')}</strong>
        <small>Click to choose image</small>
      </label>
    );
  }

  if (component.type === 'UploadField') {
    return (
      <label className="redos-capability-preview redos-file-picker-preview">
        <input className="redos-file-picker-input" type="file" />
        <strong>{componentLabelOrFallback(component, 'Upload')}</strong>
        <small>Click to upload file</small>
      </label>
    );
  }

  if (isBasicFieldComponent(component.type)) {
    return <BasicComponentPreview component={component} isPreviewing={isPreviewing} />;
  }

  if (['Camera', 'GPS', 'Barcode', 'OfflineStorage', 'PushNotification'].includes(component.type)) {
    return (
      <span className="redos-capability-preview">
        <strong>{component.label}</strong>
        <small>{component.type === 'OfflineStorage' ? 'Offline-ready mobile capability' : 'Runtime capability'}</small>
      </span>
    );
  }

  if (component.type.startsWith('Custom') || ['Dashboard', 'WorkflowPanel', 'Timeline'].includes(component.type)) {
    return (
      <span className="redos-organism-preview">
        <strong>{component.label}</strong>
        <small>Composed experience block</small>
      </span>
    );
  }

  return (
    <label>
      {componentLabelOrFallback(component)}
      <input readOnly={!isPreviewing} placeholder={component.placeholder ?? ''} />
    </label>
  );
}

function DataTablePreview({ title }: { title: string }) {
  return (
    <div className="redos-data-table-preview">
      <div className="redos-table-preview-header">
        <strong>{title}</strong>
        <input readOnly placeholder="Search table..." type="search" />
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {['Asset Request', 'Stock Review', 'Vendor Sync'].map((row, index) => (
            <tr key={row}>
              <td>{row}</td>
              <td>{index === 1 ? 'Pending' : 'Active'}</td>
              <td>Admin</td>
              <td><button type="button">Open</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InputTablePreview({ title }: { title: string }) {
  return (
    <div className="redos-input-table-preview">
      <strong>{title}</strong>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr key={row}>
              <td><input aria-label={`Item ${row + 1}`} defaultValue={row === 0 ? 'Product A' : ''} /></td>
              <td><input aria-label={`Qty ${row + 1}`} defaultValue={row === 0 ? '1' : ''} inputMode="numeric" /></td>
              <td><input aria-label={`Price ${row + 1}`} defaultValue={row === 0 ? '1000' : ''} inputMode="numeric" /></td>
              <td><input aria-label={`Total ${row + 1}`} readOnly defaultValue={row === 0 ? '1000' : ''} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModalPreview({ title }: { title: string }) {
  return (
    <div className="redos-modal-preview">
      <div className="redos-modal-preview-card">
        <span className="redos-kicker">Modal</span>
        <strong>{title}</strong>
        <p>Gunakan untuk flow detail, create, edit, atau informasi penting tanpa pindah screen.</p>
        <label>
          Notes
          <textarea placeholder="Write details..." />
        </label>
        <div className="redos-modal-actions">
          <button type="button">Cancel</button>
          <button type="button">Save</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModalPreview({ title }: { title: string }) {
  return (
    <div className="redos-modal-preview redos-confirm-modal-preview">
      <div className="redos-modal-preview-card">
        <span className="redos-kicker">Confirm</span>
        <strong>{title}</strong>
        <p>Pastikan user menyetujui action penting seperti delete, approve, atau submit.</p>
        <div className="redos-modal-actions">
          <button type="button">Cancel</button>
          <button type="button">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function FormCanvasPreview({
  component,
  isPreviewing,
  onDeleteComponent,
  onMoveComponentToIndex,
  onRelocateComponent,
  onSelect,
  onUpdateComponentLayout,
  selectedId,
}: {
  component: CanvasComponent;
  isPreviewing: boolean;
  onDeleteComponent: (id: string) => void;
  onMoveComponentToIndex: (id: string, index: number) => void;
  onRelocateComponent: (id: string, direction: ComponentMoveDirection) => void;
  onSelect: (id: string) => void;
  onUpdateComponentLayout: (id: string, next: Partial<Pick<CanvasComponent, 'height' | 'width' | 'x'>>) => void;
  selectedId?: string;
}) {
  const children = component.children ?? [];

  function startFormChildMove(event: ReactPointerEvent<HTMLButtonElement>, child: CanvasComponent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(child.id);

    const startClientY = event.clientY;
    let lastTargetIndex = index;

    function handlePointerMove(pointerEvent: PointerEvent) {
      pointerEvent.preventDefault();
      const rowDelta = Math.round((pointerEvent.clientY - startClientY) / 92);
      const nextTargetIndex = index + rowDelta;

      if (nextTargetIndex !== lastTargetIndex) {
        lastTargetIndex = nextTargetIndex;
        onMoveComponentToIndex(child.id, nextTargetIndex);
      }
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

  function startFormChildResize(event: ReactPointerEvent<HTMLButtonElement>, child: CanvasComponent) {
    const body = event.currentTarget.closest('.redos-form-container-body');

    if (!(body instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(child.id);

    const bounds = body.getBoundingClientRect();
    const columnWidth = bounds.width / GRID_COLUMNS;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startWidth = child.width;
    const startHeight = child.height;

    function handlePointerMove(pointerEvent: PointerEvent) {
      pointerEvent.preventDefault();
      const widthDelta = Math.round((pointerEvent.clientX - startClientX) / columnWidth);
      const heightDelta = Math.round((pointerEvent.clientY - startClientY) / 12) * 12;

      onUpdateComponentLayout(child.id, {
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
    <div className="redos-form-container-preview">
      <div className="redos-form-container-header">
        <strong>{component.label}</strong>
        {!isPreviewing ? <small>Tambah Input, Search, Dropdown, atau Button saat Form ini dipilih.</small> : null}
      </div>
      <div className="redos-form-container-body">
        {children.length > 0 ? children.map((child) => (
          <div
            key={child.id}
            className={!isPreviewing && selectedId === child.id ? 'redos-form-child redos-form-child-selected' : 'redos-form-child'}
            role={isPreviewing ? undefined : 'button'}
            style={{
              ...componentThemeStyle(child),
              gridColumn: `${child.x + 1} / span ${child.width}`,
              minHeight: componentUsesThemeVisualSizing(child.type) ? undefined : child.height,
            }}
            tabIndex={isPreviewing ? -1 : 0}
            onClick={(event) => {
              event.stopPropagation();

              if (!isPreviewing) {
                onSelect(child.id);
              }
            }}
            onKeyDown={(event) => {
              if (isPreviewing) {
                return;
              }

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                onSelect(child.id);
              }

              if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                event.stopPropagation();
                onDeleteComponent(child.id);
              }

              if (event.key === 'ArrowUp' || (event.shiftKey && event.key === 'ArrowLeft')) {
                event.preventDefault();
                event.stopPropagation();
                onRelocateComponent(child.id, 'up');
              }

              if (event.key === 'ArrowDown' || (event.shiftKey && event.key === 'ArrowRight')) {
                event.preventDefault();
                event.stopPropagation();
                onRelocateComponent(child.id, 'down');
              }
            }}
          >
            {!isPreviewing ? (
              <div className="redos-form-child-controls" onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
                <button
                  aria-label={`Move ${child.label}`}
                  className="redos-form-child-move"
                  type="button"
                  onPointerDown={(event) => startFormChildMove(event, child, child.y)}
                  title="Drag to reorder inside Form"
                >
                  Move
                </button>
                <button
                  aria-label={`Delete ${child.label}`}
                  className="redos-form-child-delete"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteComponent(child.id);
                  }}
                >
                  Delete
                </button>
                <button
                  aria-label={`Resize ${child.label}`}
                  className="redos-form-child-resize"
                  type="button"
                  onPointerDown={(event) => startFormChildResize(event, child)}
                  title="Drag to resize inside Form"
                >
                  Resize
                </button>
              </div>
            ) : null}
            <BasicComponentPreview component={child} isPreviewing={isPreviewing} />
          </div>
        )) : (
          <div className="redos-form-empty-state">
            <strong>Form masih kosong</strong>
            <span>Pilih Form ini, lalu klik Text Input, Search, Dropdown, atau Button dari toolbox.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BasicComponentPreview({ component, isPreviewing }: { component: CanvasComponent; isPreviewing: boolean }) {
  if (component.type === 'FormHeading') {
    return <h1 className="redos-form-heading-preview">{component.label}</h1>;
  }

  if (component.type === 'SectionHeading') {
    return <h2 className="redos-section-heading-preview">{component.label}</h2>;
  }

  if (component.type === 'Subheading') {
    return <h3 className="redos-subheading-preview">{component.label}</h3>;
  }

  if (component.type === 'Paragraph') {
    return <p className="redos-paragraph-preview">{component.placeholder ?? 'Add supporting text, explanation, or help copy here.'}</p>;
  }

  if (component.type === 'Link') {
    return <a className="redos-link-preview" href="https://example.com" target="_blank" rel="noreferrer">{component.label}</a>;
  }

  if (component.type === 'Divider') {
    return <hr className="redos-divider-preview" />;
  }

  if (component.type === 'Spacer') {
    return <div className="redos-spacer-preview" aria-label="Spacer" />;
  }

  if (component.type === 'Captcha') {
    return (
      <label className="redos-captcha-preview">
        <input readOnly type="checkbox" />
        I am not a robot
      </label>
    );
  }

  if (component.type === 'Submit') {
    return <span className="redos-button-preview">{componentLabelOrFallback(component, 'Submit')}</span>;
  }

  if (component.type === 'Group') {
    return (
      <div className="redos-group-preview">
        <strong>{componentLabelOrFallback(component, 'Group')}</strong>
        <small>Container for related elements</small>
      </div>
    );
  }

  if (component.type === 'Grid') {
    return (
      <div className="redos-grid-preview">
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (component.type === 'Pages') {
    return (
      <div className="redos-pages-preview">
        <span>Step 1</span>
        <span>Step 2</span>
        <span>Step 3</span>
      </div>
    );
  }

  if (component.type === 'Button') {
    const actionHint = componentActionHint(component, isPreviewing);

    return (
      <span className="redos-button-preview">
        {componentLabelOrFallback(component, 'Button')}
        {actionHint ? <small>{actionHint}</small> : null}
      </span>
    );
  }

  if (component.type === 'Image') {
    return (
      <label className="redos-form-image-preview redos-file-picker-preview">
        <input className="redos-file-picker-input" type="file" accept="image/*" />
        <span>Image</span>
        <strong>{componentLabelOrFallback(component, 'Image')}</strong>
        <small>Click to choose image</small>
      </label>
    );
  }

  if (['UploadField', 'ImageUpload', 'MultiFileUpload', 'MultiImageUpload'].includes(component.type)) {
    return (
      <label className="redos-form-upload-preview redos-file-picker-preview">
        <input
          accept={component.type === 'ImageUpload' || component.type === 'MultiImageUpload' ? 'image/*' : undefined}
          className="redos-file-picker-input"
          multiple={component.type === 'MultiFileUpload' || component.type === 'MultiImageUpload'}
          type="file"
        />
        <strong>{componentLabelOrFallback(component, 'Upload')}</strong>
        <small>{component.type.startsWith('Multi') ? 'Click to upload multiple files' : 'Click to upload file'}</small>
      </label>
    );
  }

  if (component.type === 'DataTable') {
    return <DataTablePreview title={componentLabelOrFallback(component, 'DataTable')} />;
  }

  if (component.type === 'InputTable') {
    return <InputTablePreview title={componentLabelOrFallback(component, 'Input table')} />;
  }

  if (component.type === 'Modal') {
    return <ModalPreview title={componentLabelOrFallback(component, 'Modal')} />;
  }

  if (component.type === 'ConfirmModal') {
    return <ConfirmModalPreview title={componentLabelOrFallback(component, 'Confirm modal')} />;
  }

  if (component.type === 'Search') {
    return (
      <label>
        {componentLabelOrFallback(component, 'Search')}
        <input readOnly={!isPreviewing} placeholder={component.placeholder ?? 'Search experience'} type="search" />
      </label>
    );
  }

  if (isTextLikeInputComponent(component.type)) {
    const inputConfig = inputPreviewConfig(component.type);

    return (
      <label>
        {componentLabelOrFallback(component)}
        <input
          inputMode={inputConfig.inputMode}
          readOnly={!isPreviewing}
          placeholder={component.placeholder ?? inputConfig.placeholder ?? componentLabelOrFallback(component)}
          type={inputConfig.type}
        />
      </label>
    );
  }

  if (component.type === 'TextEditor') {
    return (
      <label>
        {componentLabelOrFallback(component, 'Text editor')}
        <textarea readOnly={!isPreviewing} placeholder={component.placeholder ?? 'Rich text content...'} />
      </label>
    );
  }

  if (component.type === 'SingleChoice' || component.type === 'MultipleChoice') {
    const inputType = component.type === 'SingleChoice' ? 'radio' : 'checkbox';

    return (
      <fieldset className="redos-choice-preview">
        <legend>{componentLabelOrFallback(component)}</legend>
        {['Option A', 'Option B', 'Option C'].map((option) => (
          <label key={option}>
            <input readOnly={!isPreviewing} name={component.id} type={inputType} />
            {option}
          </label>
        ))}
      </fieldset>
    );
  }

  if (component.type === 'DecisionBox') {
    return (
      <label className="redos-decision-preview">
        <input readOnly={!isPreviewing} type="checkbox" />
        {componentLabelOrFallback(component)}
        <small>When something needs to be accepted</small>
      </label>
    );
  }

  if (component.type === 'Tags') {
    return (
      <div className="redos-tags-preview">
        <strong>{componentLabelOrFallback(component, 'Tags')}</strong>
        <span>Finance</span>
        <span>Urgent</span>
        <span>Internal</span>
      </div>
    );
  }

  if (component.type === 'ToggleSwitch') {
    return (
      <label className="redos-toggle-preview">
        <span>{componentLabelOrFallback(component)}</span>
        <input readOnly={!isPreviewing} type="checkbox" />
      </label>
    );
  }

  if (['DateInput', 'TimeInput', 'DateTimeInput', 'MultipleDates', 'DateRange'].includes(component.type)) {
    const inputType = component.type === 'TimeInput' ? 'time' : component.type === 'DateTimeInput' ? 'datetime-local' : 'date';

    return (
      <label>
        {componentLabelOrFallback(component)}
        <input readOnly={!isPreviewing} type={inputType} />
      </label>
    );
  }

  if (component.type === 'Slider' || component.type === 'RangeSlider') {
    return (
      <label>
        {componentLabelOrFallback(component)}
        <input readOnly={!isPreviewing} type="range" min="0" max="100" defaultValue={component.type === 'RangeSlider' ? 70 : 50} />
      </label>
    );
  }

  if (component.type === 'SingleChoiceMatrix' || component.type === 'MultipleChoiceMatrix' || component.type === 'MatrixTable') {
    return <MatrixPreview title={component.label} multi={component.type !== 'SingleChoiceMatrix'} editable={component.type === 'MatrixTable'} />;
  }

  if (component.type === 'Signature') {
    return (
      <div className="redos-signature-preview">
        <strong>{componentLabelOrFallback(component, 'Signature')}</strong>
        <span>Draw, type, or upload signature</span>
      </div>
    );
  }

  if (component.type === 'Dropdown' || component.type === 'Lookup') {
    return (
      <label>
        {componentLabelOrFallback(component, 'Select')}
        <select disabled={!isPreviewing}><option>{component.placeholder ?? 'Select value'}</option></select>
      </label>
    );
  }

  if (component.type === 'TextArea') {
    return (
      <label>
        {componentLabelOrFallback(component)}
        <textarea readOnly={!isPreviewing} placeholder={component.placeholder ?? ''} />
      </label>
    );
  }

  return (
    <label>
      {componentLabelOrFallback(component)}
      <input readOnly={!isPreviewing} placeholder={component.placeholder ?? ''} />
    </label>
  );
}

function componentLabelOrFallback(component: CanvasComponent, fallback = component.type) {
  return component.label.trim() || fallback;
}

function componentActionHint(component: CanvasComponent, isPreviewing: boolean) {
  if (isPreviewing || !component.events) {
    return undefined;
  }

  const labels: Array<[keyof NonNullable<CanvasComponent['events']>, string]> = [
    ['onClick', 'Click'],
    ['onChange', 'Change'],
    ['onSubmit', 'Submit'],
    ['onFocus', 'Focus'],
    ['onBlur', 'Blur'],
    ['onLoad', 'Load'],
  ];
  const activeEvents = labels
    .map(([key, label]) => {
      const action = component.events?.[key];
      return action ? `${label}: ${action}` : undefined;
    })
    .filter(Boolean);

  return activeEvents.join(' · ') || undefined;
}

function componentThemeStyle(component: CanvasComponent): CSSProperties {
  return (component.themeOverrides ?? {}) as CSSProperties;
}

function componentUsesThemeVisualSizing(type: string) {
  return [
    'TextInput',
    'NumberInput',
    'Search',
    'EmailInput',
    'PhoneInput',
    'PasswordInput',
    'UrlInput',
    'LocationInput',
    'TextArea',
    'TextEditor',
    'Dropdown',
    'Lookup',
    'Checkbox',
    'SingleChoice',
    'MultipleChoice',
    'DecisionBox',
    'Tags',
    'ToggleSwitch',
    'DateInput',
    'TimeInput',
    'DateTimeInput',
    'MultipleDates',
    'DateRange',
    'Slider',
    'RangeSlider',
    'Button',
    'Submit',
    'Image',
    'UploadField',
    'ImageUpload',
    'MultiFileUpload',
    'MultiImageUpload',
    'Signature',
    'Divider',
    'Spacer',
    'Paragraph',
    'Link',
  ].includes(type);
}

function MatrixPreview({ editable, multi, title }: { editable: boolean; multi: boolean; title: string }) {
  const inputType = multi ? 'checkbox' : 'radio';

  return (
    <div className="redos-matrix-preview">
      <strong>{title}</strong>
      <table>
        <thead>
          <tr>
            <th />
            <th>Low</th>
            <th>Medium</th>
            <th>High</th>
          </tr>
        </thead>
        <tbody>
          {['Quality', 'Speed', 'Cost'].map((row) => (
            <tr key={row}>
              <td>{row}</td>
              {[0, 1, 2].map((option) => (
                <td key={option}>
                  {editable ? <input aria-label={`${row} value`} /> : <input readOnly name={row} type={inputType} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type InputPreviewConfig = {
  inputMode?: 'decimal' | 'email' | 'numeric' | 'search' | 'tel' | 'text' | 'url';
  placeholder?: string;
  type: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';
};

function isBasicFieldComponent(type: string) {
  return [
    'TextInput',
    'NumberInput',
    'Search',
    'Dropdown',
    'Lookup',
    'TextArea',
    'FormHeading',
    'SectionHeading',
    'Subheading',
    'Paragraph',
    'Link',
    'Divider',
    'Spacer',
    'Captcha',
    'Submit',
    'Group',
    'Grid',
    'Pages',
    'EmailInput',
    'PhoneInput',
    'PasswordInput',
    'UrlInput',
    'LocationInput',
    'TextEditor',
    'SingleChoice',
    'MultipleChoice',
    'DecisionBox',
    'Tags',
    'ToggleSwitch',
    'DateInput',
    'TimeInput',
    'DateTimeInput',
    'MultipleDates',
    'DateRange',
    'Slider',
    'RangeSlider',
    'SingleChoiceMatrix',
    'MultipleChoiceMatrix',
    'MatrixTable',
    'Signature',
    'ImageUpload',
    'MultiFileUpload',
    'MultiImageUpload',
  ].includes(type);
}

function isTextLikeInputComponent(type: string) {
  return ['TextInput', 'NumberInput', 'EmailInput', 'PhoneInput', 'PasswordInput', 'UrlInput', 'LocationInput'].includes(type);
}

function inputPreviewConfig(type: string): InputPreviewConfig {
  if (type === 'NumberInput') {
    return { inputMode: 'decimal', placeholder: '0', type: 'number' };
  }

  if (type === 'EmailInput') {
    return { inputMode: 'email', placeholder: 'name@example.com', type: 'email' };
  }

  if (type === 'PhoneInput') {
    return { inputMode: 'tel', placeholder: '+62 812 3456 7890', type: 'tel' };
  }

  if (type === 'PasswordInput') {
    return { placeholder: 'Password', type: 'password' };
  }

  if (type === 'UrlInput') {
    return { inputMode: 'url', placeholder: 'https://example.com', type: 'url' };
  }

  if (type === 'LocationInput') {
    return { inputMode: 'search', placeholder: 'Search location', type: 'search' };
  }

  return { inputMode: 'text', type: 'text' };
}

function CustomOrganismCanvasPreview({ isPreviewing, organism }: { isPreviewing: boolean; organism: NonNullable<ReturnType<typeof findCustomOrganism>> }) {
  return (
    <div className="redos-custom-organism-canvas-preview">
      <div className="redos-custom-organism-header">
        <span className="redos-kicker">Custom Organism</span>
        <strong>{organism.label}</strong>
        {organism.description ? <small>{organism.description}</small> : null}
      </div>
      <div className="redos-custom-organism-stack">
        {organism.components.length > 0 ? organism.components.map((componentType, index) => (
          <CustomOrganismPart key={`${organism.type}-${componentType}-${index}`} isPreviewing={isPreviewing} type={componentType} />
        )) : (
          <span className="redos-custom-organism-empty">No components selected yet.</span>
        )}
      </div>
    </div>
  );
}

function CustomOrganismPart({ isPreviewing, type }: { isPreviewing: boolean; type: string }) {
  const label = componentLabel(type);

  if (type === 'Search') {
    return (
      <label className="redos-custom-organism-field">
        <span>{label}</span>
        <input readOnly={!isPreviewing} type="search" placeholder="Search..." />
      </label>
    );
  }

  if (isTextLikeInputComponent(type)) {
    const inputConfig = inputPreviewConfig(type);

    return (
      <label className="redos-custom-organism-field">
        <span>{label}</span>
        <input readOnly={!isPreviewing} inputMode={inputConfig.inputMode} type={inputConfig.type} placeholder={inputConfig.placeholder || label} />
      </label>
    );
  }

  if (type === 'TextArea') {
    return (
      <label className="redos-custom-organism-field">
        <span>{label}</span>
        <textarea readOnly={!isPreviewing} placeholder={label} />
      </label>
    );
  }

  if (type === 'Dropdown' || type === 'Lookup') {
    return (
      <label className="redos-custom-organism-field">
        <span>{label}</span>
        <select disabled={!isPreviewing}><option>Select value</option></select>
      </label>
    );
  }

  if (type === 'Button') {
    return <span className="redos-custom-organism-button">{label}</span>;
  }

  if (type === 'Table' || type === 'Dashboard' || type === 'WorkflowPanel' || type === 'Timeline' || type === 'Form') {
    return (
      <span className="redos-custom-organism-block">
        <strong>{label}</strong>
        <small>{type}</small>
      </span>
    );
  }

  return (
    <span className="redos-custom-organism-block">
      <strong>{label}</strong>
      <small>{type}</small>
    </span>
  );
}

function componentLabel(type: string) {
  return componentCatalog.find((component) => component.type === type)?.label ?? type;
}
