import type { DesignedScreenField, DesignedScreenLayout } from './screen-designer-types';

export function Canvas({
  layout,
  selectedFieldId,
  onSelectField,
  onMoveField,
}: {
  layout: DesignedScreenLayout;
  selectedFieldId?: string;
  onSelectField: (field: DesignedScreenField) => void;
  onMoveField: (fieldId: string, direction: 'UP' | 'DOWN') => void;
}) {
  return (
    <section className="studio-screen-canvas">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">CENTER</span>
          <h4>{layout.screen}</h4>
        </div>
        <span className="studio-muted">Drag / reorder fields</span>
      </div>
      {layout.sections.map((section) => (
        <div key={section.id} className="studio-screen-section">
          <div className="studio-section-header">
            <strong>Section: {section.title}</strong>
            <span className="studio-muted">{section.columns} columns</span>
          </div>
          <div className="studio-screen-field-grid" data-columns={section.columns}>
            {section.fields.map((field) => (
              <button
                key={field.id}
                className={selectedFieldId === field.id ? 'studio-screen-field studio-screen-field-selected' : 'studio-screen-field'}
                type="button"
                onClick={() => onSelectField(field)}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('application/redios-screen-field', field.id)}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData('application/redios-screen-field');
                  if (draggedId && draggedId !== field.id) {
                    onMoveField(draggedId, 'DOWN');
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
              >
                <span>{field.label}</span>
                <small>{field.type}</small>
                <span className="studio-screen-field-actions">
                  <span onClick={(event) => { event.stopPropagation(); onMoveField(field.id, 'UP'); }}>↑</span>
                  <span onClick={(event) => { event.stopPropagation(); onMoveField(field.id, 'DOWN'); }}>↓</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
