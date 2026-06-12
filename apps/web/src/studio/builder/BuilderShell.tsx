import { useMemo, useState } from 'react';
import { Canvas } from './Canvas/Canvas';
import { ComponentPanel } from './ComponentPanel/ComponentPanel';
import { DevicePreview } from './DevicePreview/DevicePreview';
import { PropertyPanel } from './PropertyPanel/PropertyPanel';
import { TreePanel } from './TreePanel/TreePanel';
import { loadDataObjects } from '../metadata/metadata-store';
import { AdminGuidePanel } from '../guide/AdminGuide';
import type {
  BuilderComponentDefinition,
  BuilderDataObject,
  CanvasComponent,
  ComponentMoveDirection,
  ComponentResizeDirection,
  StudioDevice,
  StudioTarget,
} from './types';

interface BuilderDraftState {
  components: CanvasComponent[];
  device: StudioDevice;
  selectedId: string;
  savedAt: string;
}

const GRID_COLUMNS = 12;
const MIN_COMPONENT_WIDTH = 2;
const MIN_COMPONENT_HEIGHT = 48;
const MAX_COMPONENT_HEIGHT = 420;

const initialComponents: CanvasComponent[] = [
  {
    id: 'product_name',
    type: 'TextInput',
    label: 'Product Name',
    placeholder: 'Enter product name',
    width: 12,
    height: 86,
    x: 0,
    y: 0,
    binding: { object: 'Product', field: 'name' },
  },
  {
    id: 'stock',
    type: 'NumberInput',
    label: 'Stock',
    placeholder: 'Enter stock',
    width: 12,
    height: 86,
    x: 0,
    y: 1,
    binding: { object: 'Product', field: 'stock' },
  },
  {
    id: 'save_product',
    type: 'Button',
    label: 'Save Product',
    width: 12,
    height: 72,
    x: 0,
    y: 2,
    events: { onClick: 'Save Product Action' },
  },
];

export function BuilderShell({ target }: { target: StudioTarget }) {
  const dataObjects = useMemo<BuilderDataObject[]>(() => loadDataObjects().map((object) => ({
    name: object.name,
    fields: object.attributes.map((attribute) => attribute.name),
  })), []);
  const savedDraft = loadBuilderDraft(target);
  const [device, setDevice] = useState<StudioDevice>(savedDraft?.device ?? (target === 'android' ? 'Mobile' : 'Desktop'));
  const [tab, setTab] = useState<'Components' | 'Data'>('Components');
  const [components, setComponents] = useState(savedDraft?.components ?? initialComponents);
  const [selectedId, setSelectedId] = useState(savedDraft?.selectedId ?? 'product_name');
  const [statusMessage, setStatusMessage] = useState(savedDraft ? `Draft restored from ${formatSavedAt(savedDraft.savedAt)}` : 'Draft ready');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const selected = components.find((component) => component.id === selectedId);
  const metadataSummary = useMemo(() => {
    const boundFields = components.filter((component) => component.binding).length;
    const boundActions = components.filter((component) => component.events?.onClick || component.events?.onChange).length;

    return {
      components: components.length,
      fields: boundFields,
      actions: boundActions,
    };
  }, [components]);

  function addComponent(definition: BuilderComponentDefinition, insertIndex = components.length) {
    const next: CanvasComponent = {
      id: `${definition.type}_${Date.now()}`,
      type: definition.type,
      label: definition.label,
      width: definition.type === 'Button' ? 12 : 6,
      height: definition.type === 'Table' ? 180 : 86,
      x: 0,
      y: components.length,
    };
    setComponents((current) => {
      const nextComponents = [...current];
      const boundedIndex = Math.max(0, Math.min(insertIndex, current.length));
      nextComponents.splice(boundedIndex, 0, next);

      return withCanvasOrder(nextComponents);
    });
    setSelectedId(next.id);
    setStatusMessage(`${definition.label} added to canvas`);
  }

  function relocateComponent(componentId: string, direction: ComponentMoveDirection) {
    const component = components.find((current) => current.id === componentId);

    if (!component) {
      return;
    }

    if (direction === 'up' || direction === 'down') {
      const currentIndex = components.findIndex((current) => current.id === componentId);
      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= components.length) {
        return;
      }

      setComponents((current) => {
        const nextComponents = [...current];
        const [moved] = nextComponents.splice(currentIndex, 1);
        nextComponents.splice(nextIndex, 0, moved);

        return withCanvasOrder(nextComponents);
      });
      setSelectedId(componentId);
      setStatusMessage(`${component.label} moved ${direction}`);
      return;
    }

    setComponents((current) => current.map((item) => {
      if (item.id !== componentId) {
        return item;
      }

      const nextX = direction === 'left' ? item.x - 1 : item.x + 1;

      return normalizeCanvasComponent({ ...item, x: nextX }, item.y);
    }));
    setSelectedId(componentId);
    setStatusMessage(`${component.label} moved ${direction}`);
  }

  function moveComponentToIndex(componentId: string, targetIndex: number) {
    const component = components.find((current) => current.id === componentId);

    if (!component) {
      return;
    }

    setComponents((current) => {
      const fromIndex = current.findIndex((item) => item.id === componentId);

      if (fromIndex < 0) {
        return current;
      }

      const boundedIndex = clamp(targetIndex, 0, current.length - 1);

      if (fromIndex === boundedIndex) {
        return current;
      }

      const nextComponents = [...current];
      const [moved] = nextComponents.splice(fromIndex, 1);
      nextComponents.splice(boundedIndex, 0, moved);

      return withCanvasOrder(nextComponents);
    });
    setSelectedId(componentId);
    setStatusMessage(`${component.label} relocated`);
  }

  function updateComponentLayout(componentId: string, next: Partial<Pick<CanvasComponent, 'height' | 'width' | 'x'>>) {
    const component = components.find((current) => current.id === componentId);

    if (!component) {
      return;
    }

    setComponents((current) => current.map((item) => item.id === componentId ? normalizeCanvasComponent({ ...item, ...next }, item.y) : item));
    setSelectedId(componentId);
    setStatusMessage(`${component.label} layout updated`);
  }

  function resizeComponent(componentId: string, direction: ComponentResizeDirection) {
    const component = components.find((current) => current.id === componentId);

    if (!component) {
      return;
    }

    setComponents((current) => current.map((item) => {
      if (item.id !== componentId) {
        return item;
      }

      const nextWidth = direction === 'narrower' ? item.width - 1 : direction === 'wider' ? item.width + 1 : item.width;
      const nextHeight = direction === 'shorter' ? item.height - 16 : direction === 'taller' ? item.height + 16 : item.height;

      return normalizeCanvasComponent({ ...item, width: nextWidth, height: nextHeight }, item.y);
    }));
    setSelectedId(componentId);
    setStatusMessage(`${component.label} resized`);
  }

  function bindField(object: string, field: string) {
    if (!selected) {
      const next: CanvasComponent = {
        id: `${object}_${field}_${Date.now()}`,
        type: field === 'stock' || field === 'price' ? 'NumberInput' : 'TextInput',
        label: `${object} ${field}`,
        width: 6,
        height: 86,
        x: 0,
        y: components.length,
        binding: { object, field },
      };
      setComponents((current) => withCanvasOrder([...current, next]));
      setSelectedId(next.id);
      setStatusMessage(`${object}.${field} added as a bound component`);
      return;
    }

    setComponents((current) => current.map((component) => component.id === selected.id ? { ...component, binding: { object, field } } : component));
    setStatusMessage(`${selected.label} bound to ${object}.${field}`);
  }

  function updateSelected(next: Partial<CanvasComponent>) {
    if (!selected) {
      return;
    }

    setComponents((current) => current.map((component) => component.id === selected.id ? normalizeCanvasComponent({ ...component, ...next }, component.y) : component));
    setStatusMessage(`${selected.label} updated`);
  }

  function deleteComponent(componentId: string) {
    const component = components.find((current) => current.id === componentId);

    if (!component) {
      return;
    }

    const selectedIndex = components.findIndex((current) => current.id === component.id);
    const nextComponents = components.filter((current) => current.id !== component.id);
    const nextSelected = nextComponents[Math.min(selectedIndex, nextComponents.length - 1)];

    setComponents(withCanvasOrder(nextComponents));
    setSelectedId(nextSelected?.id ?? '');
    setStatusMessage(`${component.label} removed from canvas`);
  }

  function deleteSelected() {
    if (!selected) {
      return;
    }

    deleteComponent(selected.id);
  }

  function saveDraft() {
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(builderDraftKey(target), JSON.stringify({ components, device, selectedId, savedAt }));
    setStatusMessage(`Experience draft saved at ${formatSavedAt(savedAt)}`);
  }

  function previewExperience() {
    setIsPreviewing((current) => !current);
    setStatusMessage(isPreviewing ? 'Builder canvas mode active' : 'Runtime preview mode active');
  }

  function launchExperience() {
    setStatusMessage('Launch check queued. Connect runtime publish before production launch.');
  }

  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">RediOS Builder</span>
          <h1>{target === 'android' ? 'Android Experience Builder' : 'Visual Application Builder'}</h1>
          <p>Bangun screen dulu. Data dan Action dipasang setelah experience terasa benar.</p>
        </div>
        <div className="redos-target-switch" aria-label="Builder target">
          <button className={target === 'web' ? 'redos-chip redos-chip-active' : 'redos-chip'} data-redos-tooltip="Desain pengalaman untuk aplikasi browser/web." type="button" onClick={() => { window.location.href = '/studio/builder/web'; }}>
            Web
          </button>
          <button className={target === 'android' ? 'redos-chip redos-chip-active' : 'redos-chip'} data-redos-tooltip="Desain pengalaman mobile Android, termasuk camera, GPS, barcode, dan offline." type="button" onClick={() => { window.location.href = '/studio/builder/android'; }}>
            Android
          </button>
        </div>
        <div className="redos-actions">
          <button data-redos-tooltip="Mulai aplikasi baru dari template experience, bukan dari database." type="button" onClick={() => { window.location.href = '/studio/create'; }}>Create App</button>
          <button data-redos-tooltip="Simpan draft layout visual di browser. Backend metadata sync menyusul di tahap production." type="button" onClick={saveDraft}>Save</button>
          <button data-redos-tooltip="Lihat tampilan runtime tanpa panel editor." type="button" onClick={previewExperience}>{isPreviewing ? 'Edit' : 'Preview'}</button>
          <button className="redos-launch-action" data-redos-tooltip="Cek kesiapan launch. Nantinya tersambung ke publish runtime metadata." type="button" onClick={launchExperience}>Launch</button>
          <button data-redos-tooltip="Advanced Mode untuk Data, Action, Connector, dan Custom Organism." type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata</button>
        </div>
      </header>

      <AdminGuidePanel
        title="Alur kerja admin di builder"
        description="Tidak perlu menyentuh JSON, endpoint, atau kode. Fokus pada pengalaman user di layar."
        steps={[
          'Drag component dari toolbox ke canvas.',
          'Pilih component, lalu atur label, ukuran, dan posisi.',
          'Bind ke Data jika component butuh menyimpan atau menampilkan nilai.',
          'Pilih Action untuk tombol atau event penting, lalu preview.',
        ]}
      />

      <section className="redos-builder-status" aria-live="polite">
        <div>
          <strong>{statusMessage}</strong>
          <span>{target === 'android' ? 'Mobile runtime target' : 'Web runtime target'} · {device} preview</span>
        </div>
        <DevicePreview device={device} onDeviceChange={setDevice} />
        <div className="redos-metadata-pills" aria-label="Generated metadata summary">
          <span>{metadataSummary.components} Components</span>
          <span>{metadataSummary.fields} Data bindings</span>
          <span>{metadataSummary.actions} Actions</span>
        </div>
      </section>

      <section className="redos-builder-workspace">
        <aside className="redos-left-panel">
          <div className="redos-tabs">
            {(['Components', 'Data'] as const).map((nextTab) => (
              <button key={nextTab} className={tab === nextTab ? 'redos-tab-active' : ''} type="button" onClick={() => setTab(nextTab)}>
                {nextTab}
              </button>
            ))}
          </div>
          {tab === 'Components' ? (
            <ComponentPanel target={target} onAdd={addComponent} />
          ) : (
            <TreePanel dataObjects={dataObjects} onBindField={bindField} />
          )}
        </aside>

        <Canvas
          components={components}
          device={device}
          isPreviewing={isPreviewing}
          selectedId={selectedId}
          target={target}
          onAddComponent={addComponent}
          onDeleteComponent={deleteComponent}
          onMoveComponentToIndex={moveComponentToIndex}
          onRelocateComponent={relocateComponent}
          onResizeComponent={resizeComponent}
          onSelect={setSelectedId}
          onUpdateComponentLayout={updateComponentLayout}
        />

        <PropertyPanel dataObjects={dataObjects} selected={selected} onChange={updateSelected} onDelete={deleteSelected} />
      </section>
    </main>
  );
}

function withCanvasOrder(components: CanvasComponent[]) {
  return components.map((component, index) => normalizeCanvasComponent(component, index));
}

function normalizeCanvasComponent(component: CanvasComponent, index: number) {
  const width = clamp(Number(component.width) || 6, MIN_COMPONENT_WIDTH, GRID_COLUMNS);
  const height = clamp(Number(component.height) || 86, MIN_COMPONENT_HEIGHT, MAX_COMPONENT_HEIGHT);
  const x = clamp(Number(component.x) || 0, 0, GRID_COLUMNS - width);

  return {
    ...component,
    width,
    height,
    x,
    y: index,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function builderDraftKey(target: StudioTarget) {
  return `redios:studio:${target}:draft`;
}

function loadBuilderDraft(target: StudioTarget): BuilderDraftState | undefined {
  try {
    const rawDraft = window.localStorage.getItem(builderDraftKey(target));

    if (!rawDraft) {
      return undefined;
    }

    const draft = JSON.parse(rawDraft) as BuilderDraftState;

    if (!Array.isArray(draft.components) || !draft.selectedId || !draft.device) {
      return undefined;
    }

    return {
      ...draft,
      components: withCanvasOrder(draft.components),
    };
  } catch {
    return undefined;
  }
}

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
