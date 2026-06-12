import type { BuilderDataObject } from '../types';

export function TreePanel({
  dataObjects,
  onBindField,
}: {
  dataObjects: BuilderDataObject[];
  onBindField: (object: string, field: string) => void;
}) {
  return (
    <div className="redos-panel-content">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Binding</span>
        <h3>Data</h3>
        <p className="redos-muted">Click a field to bind it to the selected component. Data stays behind the experience layer.</p>
      </div>
      {dataObjects.map((object) => (
        <section key={object.name} className="redos-tree-object">
          <header>
            <strong>{object.name}</strong>
            <span>{object.fields.length} fields</span>
          </header>
          {object.fields.map((field) => (
            <button key={field} className="redos-tree-field" type="button" onClick={() => onBindField(object.name, field)}>
              <span>{field}</span>
              <small>{object.name}.{field}</small>
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}
