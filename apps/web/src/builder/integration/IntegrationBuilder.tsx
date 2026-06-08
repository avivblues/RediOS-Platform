import { useEffect, useState } from 'react';
import type { ConnectorDefinition, IntegrationDefinition, MetadataDefinition, MetadataDraft } from '@redios/shared';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import { Canvas, Edge, Node, Toolbar } from '../../components/atomic/organisms/CanvasPrimitives';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { MetadataClient, MetadataDebugTree } from '../../core/api/metadata-client';
import type { RuntimeClient } from '../../core/api/runtime-client';
import { PropertyEditor } from '../property/PropertyEditor';

export function IntegrationBuilder({
  tree,
  selectedIntegration,
  selectedConnector,
  metadata,
  designer,
  runtime,
  onPreview,
}: {
  tree: MetadataDebugTree;
  selectedIntegration?: MetadataDefinition<IntegrationDefinition>;
  selectedConnector?: MetadataDefinition<ConnectorDefinition>;
  metadata: MetadataClient;
  designer: DesignerClient;
  runtime: RuntimeClient;
  onPreview: (preview: DesignerPreviewResult) => void;
}) {
  const [integration, setIntegration] = useState<IntegrationDefinition | undefined>(selectedIntegration?.definition);
  const [connector, setConnector] = useState<ConnectorDefinition | undefined>(selectedConnector?.definition);
  const [draft, setDraft] = useState<MetadataDraft | undefined>();
  const [newCode, setNewCode] = useState('');
  const [testResult, setTestResult] = useState<unknown>();

  useEffect(() => {
    setIntegration(selectedIntegration?.definition);
    setConnector(selectedConnector?.definition);
    setDraft(undefined);
    setTestResult(undefined);
  }, [selectedConnector, selectedIntegration]);

  async function loadConnector(code: string) {
    const record = await metadata.getMetadata<ConnectorDefinition>('CONNECTOR', code);
    setConnector(record.definition);
  }

  async function createConnector() {
    if (!newCode) {
      return;
    }

    const nextDraft = await designer.createDraft({
      targetType: 'CONNECTOR',
      targetCode: newCode,
    });
    const updated = await designer.applyOperation(nextDraft.id!, {
      type: 'CREATE_CONNECTOR',
      payload: {
        definition: {
          code: newCode,
          type: 'WEBHOOK',
          configSchema: {},
          authType: 'NONE',
          enabled: true,
          version: 1,
        },
      },
    });
    setDraft(updated);
    setConnector(updated.draft.definition as ConnectorDefinition);
  }

  async function createIntegration() {
    if (!newCode) {
      return;
    }

    const nextDraft = await designer.createDraft({
      targetType: 'INTEGRATION',
      targetCode: newCode,
    });
    const updated = await designer.applyOperation(nextDraft.id!, {
      type: 'CREATE_INTEGRATION',
      payload: {
        definition: {
          code: newCode,
          name: newCode,
          enabled: true,
          version: 1,
          trigger: {
            type: 'EVENT',
            sourceCode: tree.events[0] ?? '',
          },
          connector: {
            type: connector?.type ?? 'WEBHOOK',
            connectorCode: connector?.code ?? tree.connectors[0] ?? '',
          },
          mapping: {
            input: {},
            output: {},
          },
          errorPolicy: {
            retry: false,
            maxAttempts: 1,
          },
        },
      },
    });
    setDraft(updated);
    setIntegration(updated.draft.definition as IntegrationDefinition);
  }

  async function updateIntegration(next: IntegrationDefinition) {
    const targetDraft = draft ?? (await designer.createDraft({ targetType: 'INTEGRATION', targetCode: next.code }));
    const updated = await designer.applyOperation(targetDraft.id!, {
      type: 'UPDATE_INTEGRATION',
      payload: {
        definition: next,
      },
    });
    setDraft(updated);
    setIntegration(updated.draft.definition as IntegrationDefinition);
  }

  async function updateConnector(next: ConnectorDefinition) {
    const targetDraft = draft ?? (await designer.createDraft({ targetType: 'CONNECTOR', targetCode: next.code }));
    const updated = await designer.applyOperation(targetDraft.id!, {
      type: 'UPDATE_CONNECTOR',
      payload: {
        definition: next,
      },
    });
    setDraft(updated);
    setConnector(updated.draft.definition as ConnectorDefinition);
  }

  async function preview() {
    if (draft?.id) {
      onPreview(await designer.preview(draft.id));
    }
  }

  async function publish() {
    if (draft?.id) {
      await designer.publish(draft.id);
    }
  }

  return (
    <Panel title="Integration Builder">
      <div className="studio-integration-grid">
        <section className="studio-card">
          <h4>Connector List</h4>
          {tree.connectors.map((code) => (
            <button key={code} className="studio-tree-item" onClick={() => void loadConnector(code)}>
              {code}
            </button>
          ))}
          <div className="studio-action-row">
            <Input value={newCode} placeholder="metadata code" onChange={setNewCode} />
            <Button variant="secondary" onClick={() => void createConnector()} disabled={!newCode} tooltip={newCode ? 'Buat rancangan konektor dari kode yang diisi.' : 'Isi kode konektor dulu.'}>
              Create Connector
            </Button>
            <Button variant="secondary" onClick={() => void createIntegration()} disabled={!newCode} tooltip={newCode ? 'Buat rancangan integrasi dari kode yang diisi.' : 'Isi kode integrasi dulu.'}>
              Create Integration
            </Button>
          </div>
        </section>
        <section className="studio-card">
          <h4>Integration Flow</h4>
          <Toolbar>
            <Button variant="secondary" onClick={() => void preview()} disabled={!draft} tooltip={draft ? 'Cek dampak integrasi sebelum diterbitkan.' : 'Buat atau ubah rancangan integrasi dulu.'}>
              Preview
            </Button>
            <Button onClick={() => void publish()} disabled={!draft} tooltip={draft ? 'Terbitkan rancangan integrasi agar aktif di aplikasi.' : 'Belum ada rancangan yang bisa diterbitkan.'}>
              Publish
            </Button>
            <Button variant="secondary" onClick={() => void test(runtime, integration, connector, setTestResult)} disabled={!integration && !connector} tooltip={integration || connector ? 'Uji konektor atau integrasi yang sedang dipilih.' : 'Pilih konektor atau integrasi dulu.'}>
              Test
            </Button>
          </Toolbar>
          <Canvas>
            <Node x={40} y={120}>
              <strong>EVENT NODE</strong>
              <span>{integration?.trigger.sourceCode ?? 'metadata event'}</span>
            </Node>
            <Node x={280} y={120}>
              <strong>MAPPING NODE</strong>
              <span>{Object.keys(integration?.mapping.input ?? {}).length} mappings</span>
            </Node>
            <Node x={520} y={120}>
              <strong>CONNECTOR NODE</strong>
              <span>{integration?.connector.connectorCode ?? connector?.code ?? 'metadata connector'}</span>
            </Node>
            <Edge x1={216} y1={148} x2={280} y2={148} label="map" />
            <Edge x1={456} y1={148} x2={520} y2={148} label={connector?.type ?? integration?.connector.type ?? 'connector'} />
          </Canvas>
          {testResult ? (
            <div className="studio-card">
              <strong>Hasil test tersedia</strong>
              <p className="studio-muted">Koneksi berhasil merespons. Detail teknis tersedia di Expert Mode.</p>
            </div>
          ) : null}
        </section>
        <section className="studio-card">
          <h4>Property Editor</h4>
          {integration ? (
            <>
              <Select
                value={integration.connector.connectorCode}
                options={tree.connectors}
                onChange={(connectorCode) =>
                  void updateIntegration({
                    ...integration,
                    connector: {
                      ...integration.connector,
                      connectorCode,
                    },
                  })
                }
              />
              <PropertyEditor node={integration as unknown as Record<string, unknown>} onChange={(next) => void updateIntegration(next as unknown as IntegrationDefinition)} />
            </>
          ) : connector ? (
            <PropertyEditor node={connector as unknown as Record<string, unknown>} onChange={(next) => void updateConnector(next as unknown as ConnectorDefinition)} />
          ) : (
            <div className="studio-empty">Select or create integration metadata.</div>
          )}
        </section>
      </div>
    </Panel>
  );
}

async function test(
  runtime: RuntimeClient,
  integration: IntegrationDefinition | undefined,
  connector: ConnectorDefinition | undefined,
  setTestResult: (result: unknown) => void,
) {
  const payload = {
    document: {
      id: 'SIMULATED_DOCUMENT',
    },
    event: {
      code: integration?.trigger.sourceCode,
    },
    runtimeState: {},
  };

  if (integration) {
    setTestResult(await runtime.testIntegration(integration.code, payload));
    return;
  }

  if (connector) {
    setTestResult(await runtime.testConnector(connector.code, payload));
  }
}
