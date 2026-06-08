import type { DesignedScreenField, DesignedScreenLayout } from './screen-designer-types';

export function Canvas({
  layout,
  selectedFieldId,
  onAddInformation,
  onSelectField,
  onMoveField,
}: {
  layout: DesignedScreenLayout;
  selectedFieldId?: string;
  onAddInformation: () => void;
  onSelectField: (field: DesignedScreenField) => void;
  onMoveField: (fieldId: string, direction: 'UP' | 'DOWN', targetSectionId?: string) => void;
}) {
  const hasFields = layout.sections.some((section) => section.fields.length > 0);

  return (
    <section className="studio-screen-canvas">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">Screen</span>
          <h2>{layout.screen}</h2>
        </div>
        <span className="studio-muted">Reorder information and preview the real screen</span>
      </div>
      {!hasFields ? (
        <div className="studio-screen-empty-guide">
          <h3>Your screen is empty</h3>
          <p>Start by adding information users need.</p>
          <div className="studio-muted">
            Example for {layout.entityName}: Name, Price, Stock
          </div>
          <button type="button" className="studio-button studio-button-primary" onClick={onAddInformation}>
            + Add Information
          </button>
        </div>
      ) : null}
      {hasFields ? layout.sections.map((section) => (
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
          <strong>{section.title}</strong>
          <div className="studio-screen-field-grid" data-columns={section.columns}>
            {section.fields.map((field) => (
              <div
                key={field.id}
                className={selectedFieldId === field.id ? 'studio-screen-field studio-screen-field-selected' : 'studio-screen-field'}
                data-width={field.width}
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
      )) : null}
      <div className="studio-screen-save-row">
        <button type="button">Save {layout.entityName}</button>
      </div>
    </section>
  );
}
