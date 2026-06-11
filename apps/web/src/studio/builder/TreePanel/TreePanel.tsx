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
      <h3>Data</h3>
      <p className="redos-muted">Drag experience first, then bind components to data.</p>
      {dataObjects.map((object) => (
        <section key={object.name} className="redos-tree-object">
          <strong>{object.name}</strong>
          {object.fields.map((field) => (
            <button key={field} className="redos-tree-field" type="button" onClick={() => onBindField(object.name, field)}>
              {field}
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}
