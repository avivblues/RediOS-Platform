import type { EntityDefinition, MetadataDefinition } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import { humanizeCode } from '../humanizer/HumanizerEngine';

export function MetadataDesignCenter({
  tree,
  entities,
  onSelect,
}: {
  tree: MetadataDebugTree;
  entities: EntityDefinition[];
  onSelect: (selection: ExplorerSelection) => void;
}) {
  const activeEntity = entities[0];
  const objectCode = activeEntity?.code ?? 'PRODUCT';
  const apiBase = `/api/${objectCode.toLowerCase()}s`;
  const eventCodes = tree.events.length > 0 ? tree.events : [`SAVE_${objectCode}`];

  return (
    <main className="metadata-designer-page">
      <section className="studio-hero">
        <div>
          <span className="studio-kicker">Metadata Designer</span>
          <h2>Concept & Design Center</h2>
          <p className="studio-muted">Define objects, attributes, data sources, APIs, and events. Web and Android builders only consume this metadata for layout.</p>
        </div>
        <Button onClick={() => onSelect({ type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' })}>Create Object</Button>
      </section>

      <section className="metadata-designer-grid">
        <article className="studio-card">
          <span className="studio-kicker">Data Model Design</span>
          <h3>Objects</h3>
          <div className="studio-list">
            {entities.map((entity) => (
              <div key={entity.code} className="studio-list-row">
                <div>
                  <strong>{humanizeCode(entity.code)}</strong>
                  <span className="studio-muted">{entity.type ?? 'Object'}</span>
                </div>
                <Button variant="secondary" onClick={() => onSelect({ type: 'ENTITY', code: entity.code })}>Open</Button>
              </div>
            ))}
            {entities.length === 0 ? <p className="studio-muted">No objects yet. Create Product, Customer, Asset, or Order.</p> : null}
          </div>
        </article>

        <article className="studio-card">
          <span className="studio-kicker">Attributes</span>
          <h3>{humanizeCode(objectCode)}</h3>
          <div className="studio-list">
            {(activeEntity?.fieldCodes ?? ['name', 'stock']).map((fieldCode) => (
              <div key={fieldCode} className="studio-list-row">
                <strong>{fieldCode}</strong>
                <span>{attributeType(fieldCode)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="studio-card">
          <span className="studio-kicker">Data Source Design</span>
          <h3>Static & Dynamic Sources</h3>
          <DataSourceExample title="Status Dropdown" type="STATIC DATA" lines={['Active', 'Inactive', 'Pending']} />
          <DataSourceExample title="City Autocomplete" type="DYNAMIC DATA" lines={['GET /api/cities/search?q={{input}}', 'label: city.name', 'value: city.id']} />
          <DataSourceExample title="Dependency Dropdown" type="LOOKUP RELATION" lines={['Country -> Province -> City']} />
        </article>

        <article className="studio-card">
          <span className="studio-kicker">API Design</span>
          <h3>{humanizeCode(objectCode)} API</h3>
          <div className="studio-list">
            {[
              ['GET', apiBase],
              ['GET', `${apiBase}/:id`],
              ['POST', apiBase],
              ['PUT', `${apiBase}/:id`],
              ['DELETE', `${apiBase}/:id`],
            ].map(([method, endpoint]) => (
              <div key={`${method}:${endpoint}`} className="studio-list-row">
                <strong>{method}</strong>
                <span>{endpoint}</span>
              </div>
            ))}
          </div>
          <p className="studio-muted">API Name, Security, Validation, Middleware, and Hook belong here, not inside layout builders.</p>
        </article>

        <article className="studio-card metadata-designer-wide">
          <span className="studio-kicker">Event Design</span>
          <h3>Business Events</h3>
          <div className="studio-card-grid">
            <EventExample title="On Load" trigger="screen.open" action={`GET ${apiBase}`} />
            <EventExample title="On Change" trigger="country.change" action="Reload province dropdown" />
            <EventExample title="On Click" trigger="saveButton.click" action={`Validate Form -> POST ${apiBase} -> Navigate`} />
          </div>
          <pre>{JSON.stringify({
            event: 'button.click',
            target: 'saveButton',
            actions: [
              { type: 'api', endpoint: apiBase, method: 'POST' },
              { type: 'navigate', page: `${humanizeCode(objectCode)}List` },
            ],
          }, null, 2)}</pre>
          <div className="studio-list">
            {eventCodes.map((eventCode) => (
              <div key={eventCode} className="studio-list-row">
                <strong>{humanizeCode(eventCode)}</strong>
                <span>Reusable by Web Builder and Android Builder</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function DataSourceExample({ title, type, lines }: { title: string; type: string; lines: string[] }) {
  return (
    <div className="studio-list-row">
      <div>
        <strong>{title}</strong>
        <span className="studio-muted">{type}</span>
      </div>
      <span>{lines.join(' | ')}</span>
    </div>
  );
}

function EventExample({ title, trigger, action }: { title: string; trigger: string; action: string }) {
  return (
    <div className="studio-card">
      <span className="studio-kicker">{title}</span>
      <strong>{trigger}</strong>
      <p className="studio-muted">{action}</p>
    </div>
  );
}

function attributeType(fieldCode: string): string {
  if (/status|type|category/i.test(fieldCode)) {
    return 'dropdown';
  }

  if (/city|customer|asset|product/i.test(fieldCode)) {
    return 'lookup';
  }

  if (/stock|price|qty|amount|total/i.test(fieldCode)) {
    return 'number';
  }

  return 'text';
}
