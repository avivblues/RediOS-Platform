import { useMemo, useState } from 'react';
import { HelpTip } from '../guide/AdminGuide';
import {
  loadDataObjects,
  loadQueries,
  loadStudioApplications,
  resolveActiveApplicationCode,
  saveQueries,
  setActiveApplicationCode,
  toMetadataCode,
  type StudioApplicationDraft,
  type StudioDataObject,
  type StudioQueryColumnDraft,
  type StudioQueryDraft,
} from '../metadata/metadata-store';
import { MetadataConfirmDeleteModal } from '../metadata/shared/MetadataConfirmDeleteModal';

const queryModes: StudioQueryDraft['mode'][] = ['list', 'lookup', 'dashboard', 'report'];
const sortTypes: NonNullable<StudioQueryColumnDraft['sortType']>[] = ['none', 'ascending', 'descending'];
const aggregateTypes: NonNullable<StudioQueryColumnDraft['aggregate']>[] = ['none', 'count', 'sum', 'avg', 'min', 'max'];

export function QueryBuilderPage() {
  const applications = loadStudioApplications();
  const activeApplicationCode = resolveActiveApplicationCode();
  const initialApplication = applications.find((application) => application.code === activeApplicationCode) ?? applications[0];
  const initialObjects = loadDataObjects(initialApplication?.code);
  const initialObject = initialObjects[0];
  const [selectedApplicationCode, setSelectedApplicationCode] = useState(initialApplication?.code ?? 'INVENTORY');
  const [selectedApplication, setSelectedApplication] = useState<StudioApplicationDraft | undefined>(initialApplication);
  const [dataObjects, setDataObjects] = useState(initialObjects);
  const [queries, setQueries] = useState(() => loadQueries(initialApplication?.code));
  const [activeBrowserTab, setActiveBrowserTab] = useState<'database' | 'queries'>('database');
  const [search, setSearch] = useState('');
  const [label, setLabel] = useState(initialObject ? `${initialObject.name} List` : 'New Query');
  const [sourceObjects, setSourceObjects] = useState<string[]>(initialObject ? [initialObject.name] : []);
  const [columns, setColumns] = useState<StudioQueryColumnDraft[]>(() => columnsFromObject(initialObject));
  const [distinct, setDistinct] = useState(false);
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [sqlInput, setSqlInput] = useState('');
  const [mode, setMode] = useState<StudioQueryDraft['mode']>('list');
  const [pendingDelete, setPendingDelete] = useState<StudioQueryDraft>();
  const selectedObjects = dataObjects.filter((object) => sourceObjects.includes(object.name));
  const normalizedSearch = search.trim().toLowerCase();
  const filteredObjects = dataObjects.filter((object) => {
    return !normalizedSearch
      || object.name.toLowerCase().includes(normalizedSearch)
      || object.attributes.some((attribute) => attribute.name.toLowerCase().includes(normalizedSearch));
  });
  const sqlPreview = useMemo(() => createSqlPreview({
    columns,
    distinct,
    limit,
    offset,
    sourceObjects,
  }), [columns, distinct, limit, offset, sourceObjects]);

  function selectApplication(appCode: string) {
    const nextApplication = applications.find((application) => application.code === appCode);
    const nextObjects = loadDataObjects(appCode);
    const nextQueries = loadQueries(appCode);
    const nextObject = nextObjects[0];

    setSelectedApplicationCode(appCode);
    setSelectedApplication(nextApplication);
    setDataObjects(nextObjects);
    setQueries(nextQueries);
    setSourceObjects(nextObject ? [nextObject.name] : []);
    setColumns(columnsFromObject(nextObject));
    setLabel(nextObject ? `${nextObject.name} List` : 'New Query');
    if (nextApplication) {
      setActiveApplicationCode(nextApplication.target, nextApplication.code);
    }
  }

  function addSourceObject(nextObjectName: string) {
    const nextObject = dataObjects.find((object) => object.name === nextObjectName);

    if (!nextObject) {
      return;
    }

    setSourceObjects((current) => current.includes(nextObjectName) ? current : [...current, nextObjectName]);
    setColumns((current) => {
      const hasObjectFields = current.some((column) => column.objectName === nextObjectName);
      return hasObjectFields ? current : [...current, ...columnsFromObject(nextObject).slice(0, 3)];
    });
  }

  function removeSourceObject(nextObjectName: string) {
    setSourceObjects((current) => current.filter((item) => item !== nextObjectName));
    setColumns((current) => current.filter((column) => column.objectName !== nextObjectName));
  }

  function toggleField(objectName: string, field: string) {
    setColumns((current) => {
      const exists = current.some((column) => column.objectName === objectName && column.field === field);

      if (exists) {
        return current.filter((column) => !(column.objectName === objectName && column.field === field));
      }

      return [...current, createColumn(objectName, field)];
    });
  }

  function updateColumn(target: StudioQueryColumnDraft, nextValue: Partial<StudioQueryColumnDraft>) {
    setColumns((current) => current.map((column) => {
      if (column.objectName === target.objectName && column.field === target.field) {
        return { ...column, ...nextValue };
      }

      return column;
    }));
  }

  function loadQuery(query: StudioQueryDraft) {
    const nextSourceObjects = query.sourceObjects?.length ? query.sourceObjects : [query.objectName];
    const nextColumns = query.columns?.length
      ? query.columns
      : query.fields.map((field) => createColumn(query.objectName, field));

    setLabel(query.label);
    setSourceObjects(nextSourceObjects);
    setColumns(nextColumns);
    setDistinct(Boolean(query.distinct));
    setLimit(query.limit ?? 100);
    setOffset(query.offset ?? 0);
    setMode(query.mode);
    setSqlInput(query.sqlPreview ?? '');
    setActiveBrowserTab('database');
  }

  function importSqlToMetadata() {
    const parsedQuery = parseSqlToQueryMetadata(sqlInput, dataObjects);

    if (!parsedQuery) {
      return;
    }

    setLabel(parsedQuery.label);
    setSourceObjects(parsedQuery.sourceObjects ?? [parsedQuery.objectName]);
    setColumns(parsedQuery.columns ?? []);
    setDistinct(Boolean(parsedQuery.distinct));
    setLimit(parsedQuery.limit ?? 100);
    setOffset(parsedQuery.offset ?? 0);
    setMode(parsedQuery.mode);
    setActiveBrowserTab('database');
  }

  function saveQuery() {
    const objectName = sourceObjects[0] ?? dataObjects[0]?.name ?? 'Object';
    const visibleFields = columns.filter((column) => column.visible).map((column) => column.field);
    const filter = columns
      .filter((column) => column.criteria?.trim())
      .map((column) => `${column.objectName}.${column.field} ${column.criteria}`)
      .join(' AND ');
    const sort = columns
      .filter((column) => column.sortType && column.sortType !== 'none')
      .sort((left, right) => (left.sortOrder ?? 999) - (right.sortOrder ?? 999))
      .map((column) => `${column.objectName}.${column.field} ${column.sortType === 'descending' ? 'desc' : 'asc'}`)
      .join(', ');
    const nextQuery: StudioQueryDraft = {
      code: toMetadataCode(label),
      label: label.trim() || 'New Query',
      objectName,
      fields: visibleFields,
      sourceObjects,
      columns,
      filter,
      sort,
      distinct,
      limit,
      offset,
      mode,
      sqlPreview,
    };
    const nextQueries = [nextQuery, ...queries.filter((query) => query.code !== nextQuery.code)];
    setQueries(nextQueries);
    saveQueries(nextQueries, selectedApplicationCode);
  }

  function removeQuery(code: string) {
    const nextQueries = queries.filter((query) => query.code !== code);
    setQueries(nextQueries);
    saveQueries(nextQueries, selectedApplicationCode);
  }

  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">Query Builder</span>
          <h1>Query Capability Builder <HelpTip label="Query Builder" text="Buat reusable datasource untuk table, lookup, report, dashboard, dan list view." /></h1>
          <p>Query adalah capability data. Builder UI hanya memilih query yang sudah tersedia, bukan membuat filter hardcoded.</p>
        </div>
        <div className="redos-actions">
          <button type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
          <button type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata</button>
          <button type="button" onClick={() => { window.location.href = '/studio/api'; }}>API Builder</button>
        </div>
      </header>

      <section className="redos-query-builder-shell">
        <aside className="redos-query-browser" aria-label="Metadata database browser">
          <div className="redos-query-tabs">
            <button className={activeBrowserTab === 'database' ? 'redos-query-tab-active' : ''} type="button" onClick={() => setActiveBrowserTab('database')}>Database</button>
            <button className={activeBrowserTab === 'queries' ? 'redos-query-tab-active' : ''} type="button" onClick={() => setActiveBrowserTab('queries')}>Queries</button>
          </div>
          <label className="redos-query-search">
            <span>Find</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find object or field" />
          </label>
          {activeBrowserTab === 'database' ? (
            <div className="redos-query-tree">
              {filteredObjects.map((object) => (
                <section key={object.name}>
                  <button type="button" onClick={() => addSourceObject(object.name)}>
                    <strong>{object.name}</strong>
                    <small>{object.attributes.length} fields</small>
                  </button>
                  <div>
                    {object.attributes.filter((attribute) => !attribute.hidden).map((attribute) => (
                      <button key={`${object.name}.${attribute.name}`} type="button" onClick={() => {
                        addSourceObject(object.name);
                        toggleField(object.name, attribute.name);
                      }}
                      >
                        <span>{attribute.name}</span>
                        <small>{attribute.type}</small>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="redos-query-tree">
              {queries.map((query) => (
                <button key={query.code} type="button" onClick={() => loadQuery(query)}>
                  <strong>{query.label}</strong>
                  <small>{query.code} · {query.objectName}</small>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="redos-query-workspace">
          <section className="redos-query-topbar">
            <label>
              <span>Application</span>
              <select value={selectedApplicationCode} onChange={(event) => selectApplication(event.target.value)}>
                {applications.map((application) => (
                  <option key={application.code} value={application.code}>{application.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Query Name</span>
              <input value={label} onChange={(event) => setLabel(event.target.value)} />
            </label>
            <label>
              <span>Mode</span>
              <select value={mode} onChange={(event) => setMode(event.target.value as StudioQueryDraft['mode'])}>
                {queryModes.map((queryMode) => <option key={queryMode} value={queryMode}>{queryMode}</option>)}
              </select>
            </label>
            <button className="redos-primary-action" type="button" onClick={saveQuery}>Save Query</button>
          </section>

          <section className="redos-query-canvas-wrap">
            <div className="redos-query-canvas">
              {selectedObjects.length === 0 ? (
                <div className="redos-query-empty">Pilih Data Object dari panel Database.</div>
              ) : null}
              {selectedObjects.map((object, index) => (
                <article key={object.name} className="redos-query-table-card" style={{ left: `${4 + (index % 3) * 31}%`, top: `${18 + Math.floor(index / 3) * 42}%` }}>
                  <header>
                    <strong>{object.name}</strong>
                    <button type="button" aria-label={`Remove ${object.name}`} onClick={() => removeSourceObject(object.name)}>x</button>
                  </header>
                  <label>
                    <input
                      checked={object.attributes.filter((attribute) => !attribute.hidden).every((attribute) => isFieldSelected(columns, object.name, attribute.name))}
                      type="checkbox"
                      onChange={(event) => {
                        const visibleAttributes = object.attributes.filter((attribute) => !attribute.hidden);
                        setColumns((current) => event.target.checked
                          ? mergeColumns(current, visibleAttributes.map((attribute) => createColumn(object.name, attribute.name)))
                          : current.filter((column) => column.objectName !== object.name));
                      }}
                    />
                    <span>*</span>
                  </label>
                  {object.attributes.filter((attribute) => !attribute.hidden).map((attribute) => (
                    <label key={`${object.name}.${attribute.name}`}>
                      <input
                        checked={isFieldSelected(columns, object.name, attribute.name)}
                        type="checkbox"
                        onChange={() => toggleField(object.name, attribute.name)}
                      />
                      <span>{attribute.name}</span>
                      <small>{attribute.type}</small>
                    </label>
                  ))}
                </article>
              ))}
              {selectedObjects.length > 1 ? <div className="redos-query-relation-line" aria-hidden="true" /> : null}
            </div>
            <aside className="redos-query-properties">
              <h3>Edit</h3>
              <label>
                <input checked={distinct} type="checkbox" onChange={(event) => setDistinct(event.target.checked)} />
                <span>Select only unique records</span>
              </label>
              <label>
                <span>Limit</span>
                <input min={1} type="number" value={limit} onChange={(event) => setLimit(Number(event.target.value) || 0)} />
              </label>
              <label>
                <span>Offset</span>
                <input min={0} type="number" value={offset} onChange={(event) => setOffset(Number(event.target.value) || 0)} />
              </label>
              <label>
                <span>Convert SQL To Metadata</span>
                <textarea
                  value={sqlInput}
                  onChange={(event) => setSqlInput(event.target.value)}
                  placeholder="SELECT barang.Jenis barang AS Jenis_Barang FROM barang LIMIT 100"
                />
              </label>
              <button type="button" onClick={importSqlToMetadata}>Convert SQL</button>
              <small>{selectedApplication?.name ?? selectedApplicationCode} · {queries.length} saved queries</small>
            </aside>
          </section>

          <section className="redos-query-grid-wrap">
            <table className="redos-query-grid">
              <thead>
                <tr>
                  <th>Visible</th>
                  <th>Expression</th>
                  <th>Column Name</th>
                  <th>Sort Type</th>
                  <th>Sort Order</th>
                  <th>Aggregate</th>
                  <th>Grouping</th>
                  <th>Criteria</th>
                  <th>Or...</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((column) => (
                  <tr key={`${column.objectName}.${column.field}`}>
                    <td><input checked={column.visible} type="checkbox" onChange={(event) => updateColumn(column, { visible: event.target.checked })} /></td>
                    <td>{column.objectName}.{column.field}</td>
                    <td><input value={column.alias} onChange={(event) => updateColumn(column, { alias: event.target.value })} /></td>
                    <td>
                      <select value={column.sortType ?? 'none'} onChange={(event) => updateColumn(column, { sortType: event.target.value as StudioQueryColumnDraft['sortType'] })}>
                        {sortTypes.map((sortType) => <option key={sortType} value={sortType}>{sortType}</option>)}
                      </select>
                    </td>
                    <td><input type="number" value={column.sortOrder ?? ''} onChange={(event) => updateColumn(column, { sortOrder: Number(event.target.value) || undefined })} /></td>
                    <td>
                      <select value={column.aggregate ?? 'none'} onChange={(event) => updateColumn(column, { aggregate: event.target.value as StudioQueryColumnDraft['aggregate'] })}>
                        {aggregateTypes.map((aggregate) => <option key={aggregate} value={aggregate}>{aggregate}</option>)}
                      </select>
                    </td>
                    <td><input checked={Boolean(column.grouping)} type="checkbox" onChange={(event) => updateColumn(column, { grouping: event.target.checked })} /></td>
                    <td><input value={column.criteria ?? ''} onChange={(event) => updateColumn(column, { criteria: event.target.value })} placeholder="Like 'A%' / = ACTIVE" /></td>
                    <td>
                      <select value={column.operator ?? 'and'} onChange={(event) => updateColumn(column, { operator: event.target.value as StudioQueryColumnDraft['operator'] })}>
                        <option value="and">And</option>
                        <option value="or">Or</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {columns.length === 0 ? (
                  <tr>
                    <td colSpan={9}>Belum ada field dipilih.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>

          <section className="redos-query-sql-preview">
            <pre>{sqlPreview}</pre>
          </section>

          <section className="redos-query-saved">
            {queries.map((query) => (
              <div key={query.code} className="redos-list-row">
                <span>
                  <strong>{query.label}</strong>
                  <small>{query.code} · source: {query.sourceObjects?.join(', ') ?? query.objectName} · API-ready</small>
                </span>
                <span className="redos-query-saved-actions">
                  <button type="button" onClick={() => loadQuery(query)}>Open</button>
                  <button type="button" onClick={() => setPendingDelete(query)}>Delete</button>
                </span>
              </div>
            ))}
            {queries.length === 0 ? <p className="redos-muted">Belum ada query untuk aplikasi ini.</p> : null}
          </section>
        </section>
      </section>

      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title="Delete Query?"
          target={pendingDelete.label}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => {
            removeQuery(pendingDelete.code);
            setPendingDelete(undefined);
          }}
        />
      ) : null}
    </main>
  );
}

function columnsFromObject(object?: StudioDataObject): StudioQueryColumnDraft[] {
  return object?.attributes
    .filter((attribute) => !attribute.hidden && !attribute.secure)
    .slice(0, 4)
    .map((attribute, index) => ({
      ...createColumn(object.name, attribute.name),
      sortType: index === 0 ? 'ascending' : 'none',
      sortOrder: index === 0 ? 1 : undefined,
    })) ?? [];
}

function parseSqlToQueryMetadata(sql: string, dataObjects: StudioDataObject[]): StudioQueryDraft | undefined {
  const normalizedSql = sql.trim();

  if (!normalizedSql) {
    return undefined;
  }

  const selectMatch = normalizedSql.match(/select\s+(?<distinct>distinct\s+)?(?<select>[\s\S]+?)\s+from\s+(?<from>[\s\S]+?)(?:\s+where\s+(?<where>[\s\S]+?))?(?:\s+order\s+by\s+(?<order>[\s\S]+?))?(?:\s+limit\s+(?<limit>\d+))?(?:\s+offset\s+(?<offset>\d+))?\s*;?$/i);

  if (!selectMatch?.groups) {
    return undefined;
  }

  const sourceObjects = parseSourceObjects(selectMatch.groups.from, dataObjects);
  const primaryObject = sourceObjects[0] ?? 'Object';
  const columns = splitSelectExpressions(selectMatch.groups.select)
    .map((expression) => parseSelectExpression(expression, primaryObject, dataObjects))
    .filter((column): column is StudioQueryColumnDraft => Boolean(column));
  const where = selectMatch.groups.where?.trim() ?? '';
  const order = selectMatch.groups.order?.trim() ?? '';
  const columnsWithCriteria = applyWhereCriteria(columns, where);
  const columnsWithSort = applyOrderBy(columnsWithCriteria, order);
  const limit = Number(selectMatch.groups.limit ?? 100);
  const offset = Number(selectMatch.groups.offset ?? 0);
  const label = `${humanize(primaryObject)} Query`;

  return {
    code: toMetadataCode(label),
    label,
    objectName: primaryObject,
    fields: columnsWithSort.filter((column) => column.visible).map((column) => column.field),
    sourceObjects,
    columns: columnsWithSort,
    filter: where,
    sort: order,
    distinct: Boolean(selectMatch.groups.distinct),
    limit,
    offset,
    mode: 'list',
    sqlPreview: normalizedSql,
  };
}

function splitSelectExpressions(value: string) {
  const expressions: string[] = [];
  let current = '';
  let depth = 0;
  let quote: string | undefined;

  for (const char of value) {
    if ((char === '\'' || char === '"' || char === '`') && quote === char) {
      quote = undefined;
    } else if ((char === '\'' || char === '"' || char === '`') && !quote) {
      quote = char;
    } else if (char === '(' && !quote) {
      depth += 1;
    } else if (char === ')' && !quote) {
      depth = Math.max(0, depth - 1);
    }

    if (char === ',' && !quote && depth === 0) {
      expressions.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    expressions.push(current.trim());
  }

  return expressions;
}

function parseSourceObjects(fromClause: string, dataObjects: StudioDataObject[]) {
  return fromClause
    .split(/\b(?:inner|left|right|full|cross)?\s*join\b|\s*,\s*/i)
    .map((source) => source.trim().split(/\s+/)[0])
    .map(cleanIdentifier)
    .filter(Boolean)
    .map((objectName) => resolveObjectName(dataObjects, objectName))
    .filter((objectName, index, values) => values.indexOf(objectName) === index);
}

function parseSelectExpression(expression: string, fallbackObject: string, dataObjects: StudioDataObject[]): StudioQueryColumnDraft | undefined {
  const aliasMatch = expression.match(/^(?<expr>[\s\S]+?)\s+as\s+(?<alias>[\s\S]+)$/i);
  const rawExpression = aliasMatch?.groups?.expr?.trim() ?? expression.trim();
  const alias = cleanIdentifier(aliasMatch?.groups?.alias ?? aliasFromExpression(rawExpression));
  const aggregateMatch = rawExpression.match(/^(?<aggregate>count|sum|avg|min|max)\((?<inner>[\s\S]+)\)$/i);
  const expressionBody = aggregateMatch?.groups?.inner?.trim() ?? rawExpression;
  const dotIndex = expressionBody.indexOf('.');
  const rawObjectName = dotIndex >= 0 ? expressionBody.slice(0, dotIndex) : fallbackObject;
  const rawField = dotIndex >= 0 ? expressionBody.slice(dotIndex + 1) : expressionBody;
  const objectName = resolveObjectName(dataObjects, cleanIdentifier(rawObjectName));
  const field = resolveFieldName(dataObjects, objectName, cleanIdentifier(rawField));

  if (!field) {
    return undefined;
  }

  return {
    ...createColumn(objectName, field),
    aggregate: (aggregateMatch?.groups?.aggregate?.toLowerCase() as StudioQueryColumnDraft['aggregate'] | undefined) ?? 'none',
    alias: alias || humanize(field),
    grouping: false,
    visible: true,
  };
}

function applyWhereCriteria(columns: StudioQueryColumnDraft[], where: string) {
  if (!where) {
    return columns;
  }

  return columns.map((column) => {
    const escapedObject = escapeRegex(column.objectName);
    const escapedField = escapeRegex(column.field);
    const criteriaMatch = where.match(new RegExp(`${escapedObject}\\.${escapedField}\\s+(?<criteria>[^\\n]+?)(?:\\s+(?:and|or)\\s+|$)`, 'i'))
      ?? where.match(new RegExp(`${escapedField}\\s+(?<criteria>[^\\n]+?)(?:\\s+(?:and|or)\\s+|$)`, 'i'));

    return criteriaMatch?.groups?.criteria ? { ...column, criteria: criteriaMatch.groups.criteria.trim() } : column;
  });
}

function applyOrderBy(columns: StudioQueryColumnDraft[], order: string): StudioQueryColumnDraft[] {
  if (!order) {
    return columns;
  }

  const orderParts = order.split(',').map((item) => item.trim()).filter(Boolean);

  return columns.map((column) => {
    const orderIndex = orderParts.findIndex((item) => {
      const normalized = item.toLowerCase();
      return normalized.startsWith(`${column.objectName}.${column.field}`.toLowerCase())
        || normalized.startsWith(column.field.toLowerCase());
    });

    if (orderIndex < 0) {
      return column;
    }

    const sortType: StudioQueryColumnDraft['sortType'] = /\s+desc$/i.test(orderParts[orderIndex]) ? 'descending' : 'ascending';

    return {
      ...column,
      sortOrder: orderIndex + 1,
      sortType,
    };
  });
}

function createColumn(objectName: string, field: string): StudioQueryColumnDraft {
  return {
    objectName,
    field,
    alias: humanize(field),
    visible: true,
    sortType: 'none',
    aggregate: 'none',
    grouping: false,
    criteria: '',
    operator: 'and',
  };
}

function aliasFromExpression(expression: string) {
  const dotIndex = expression.indexOf('.');
  return dotIndex >= 0 ? expression.slice(dotIndex + 1) : expression;
}

function resolveObjectName(dataObjects: StudioDataObject[], objectName: string) {
  return dataObjects.find((object) => normalizeName(object.name) === normalizeName(objectName))?.name ?? objectName;
}

function resolveFieldName(dataObjects: StudioDataObject[], objectName: string, fieldName: string) {
  const object = dataObjects.find((item) => normalizeName(item.name) === normalizeName(objectName));

  if (!object) {
    return fieldName;
  }

  return object.attributes.find((attribute) => {
    return normalizeName(attribute.name) === normalizeName(fieldName)
      || normalizeName(attribute.label ?? '') === normalizeName(fieldName)
      || normalizeName(humanize(attribute.name)) === normalizeName(fieldName);
  })?.name ?? fieldName;
}

function cleanIdentifier(value: string) {
  return value.trim().replace(/^[`"\[]+|[`"\]]+$/g, '').trim();
}

function normalizeName(value: string) {
  return value.trim().replace(/[`"[\]_.-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isFieldSelected(columns: StudioQueryColumnDraft[], objectName: string, field: string) {
  return columns.some((column) => column.objectName === objectName && column.field === field);
}

function mergeColumns(current: StudioQueryColumnDraft[], nextColumns: StudioQueryColumnDraft[]) {
  const keys = new Set(current.map((column) => `${column.objectName}.${column.field}`));
  return [...current, ...nextColumns.filter((column) => !keys.has(`${column.objectName}.${column.field}`))];
}

function createSqlPreview({
  columns,
  distinct,
  limit,
  offset,
  sourceObjects,
}: {
  columns: StudioQueryColumnDraft[];
  distinct: boolean;
  limit: number;
  offset: number;
  sourceObjects: string[];
}) {
  const visibleColumns = columns.filter((column) => column.visible);
  const selectColumns = visibleColumns.length > 0 ? visibleColumns : columns;
  const selectClause = selectColumns.length > 0
    ? selectColumns.map((column) => `  ${expressionForColumn(column)} AS ${safeAlias(column.alias)}`).join(',\n')
    : '  *';
  const fromClause = sourceObjects.length > 0 ? sourceObjects.join('\n  INNER JOIN ') : 'metadata_object';
  const criteriaColumns = columns.filter((column) => column.criteria?.trim());
  const whereClause = criteriaColumns.length > 0
    ? `\nWHERE ${criteriaColumns.map((column, index) => `${index > 0 && column.operator === 'or' ? 'OR ' : index > 0 ? 'AND ' : ''}${column.objectName}.${column.field} ${column.criteria}`).join('\n  ')}`
    : '';
  const groupingColumns = columns.filter((column) => column.grouping);
  const groupClause = groupingColumns.length > 0 ? `\nGROUP BY ${groupingColumns.map((column) => `${column.objectName}.${column.field}`).join(', ')}` : '';
  const sortColumns = columns
    .filter((column) => column.sortType && column.sortType !== 'none')
    .sort((left, right) => (left.sortOrder ?? 999) - (right.sortOrder ?? 999));
  const orderClause = sortColumns.length > 0
    ? `\nORDER BY ${sortColumns.map((column) => `${column.objectName}.${column.field} ${column.sortType === 'descending' ? 'DESC' : 'ASC'}`).join(', ')}`
    : '';
  const limitClause = limit > 0 ? `\nLIMIT ${limit}` : '';
  const offsetClause = offset > 0 ? `\nOFFSET ${offset}` : '';

  return `SELECT ${distinct ? 'DISTINCT ' : ''}\n${selectClause}\nFROM ${fromClause}${whereClause}${groupClause}${orderClause}${limitClause}${offsetClause}`;
}

function expressionForColumn(column: StudioQueryColumnDraft) {
  if (column.aggregate && column.aggregate !== 'none') {
    return `${column.aggregate.toUpperCase()}(${column.objectName}.${column.field})`;
  }

  return `${column.objectName}.${column.field}`;
}

function safeAlias(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9]+/g, '_') || 'Column';
}

function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
