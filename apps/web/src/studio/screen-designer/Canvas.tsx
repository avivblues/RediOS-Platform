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
  onMoveField: (fieldId: string, direction: 'UP' | 'DOWN', targetSectionId?: string) => void;
}) {
  return (
    <section className="studio-screen-canvas">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">CENTER</span>
          <h4>{layout.screen}</h4>
        </div>
        <span className="studio-muted">Reorder information and preview the real screen</span>
      </div>
      {layout.sections.map((section) => (
        <div
          key={section.id}
          className="studio-screen-section"
          onDrop={(event) => {
            event.preventDefault();
            const draggedId = event.dataTransfer.getData('application/redios-screen-field');
            if (draggedId) {
              onMoveField(draggedId, 'DOWN', section.id);
            }
          }}
          onDragOver={(event) => event.preventDefault()}
        >
          <div className="studio-section-header">
            <strong>Section: {section.title}</strong>
            <span className="studio-muted">{section.columns} columns</span>
          </div>
          <div className="studio-screen-field-grid" data-columns={section.columns}>
            {section.fields.map((field) => (
              <div
                key={field.id}
                className={selectedFieldId === field.id ? 'studio-screen-field studio-screen-field-selected' : 'studio-screen-field'}
                role="button"
                tabIndex={0}
                onClick={() => onSelectField(field)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    onSelectField(field);
                  }
                }}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('application/redios-screen-field', field.id)}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData('application/redios-screen-field');
                  if (draggedId && draggedId !== field.id) {
                    onMoveField(draggedId, 'DOWN', section.id);
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
              >
                <label>
                  <span>{field.label}</span>
                  <input placeholder={field.type === 'Number' || field.type === 'Money' ? '0' : field.label} readOnly />
                </label>
                <span className="studio-screen-field-actions">
                  <span onClick={(event) => { event.stopPropagation(); onMoveField(field.id, 'UP'); }}>↑</span>
                  <span onClick={(event) => { event.stopPropagation(); onMoveField(field.id, 'DOWN'); }}>↓</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="studio-screen-save-row">
        <button type="button">Save {layout.entityName}</button>
      </div>
    </section>
  );
}
