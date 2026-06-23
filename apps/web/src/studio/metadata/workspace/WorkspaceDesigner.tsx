import { useEffect, useState } from 'react';
import type { WorkspaceDefinition } from '@redios/shared';
import { listWorkspaces, saveWorkspace } from '../../../auth/services/experience.api';
import { HelpTip } from '../../guide/AdminGuide';
import {
  loadWorkspaces,
  saveWorkspaces,
  toMetadataCode,
  type StudioWorkspaceDraft,
  type StudioWorkspacePanelDraft,
} from '../metadata-store';
import { MetadataConfirmDeleteModal } from '../shared/MetadataConfirmDeleteModal';

const panelTypes: StudioWorkspacePanelDraft['type'][] = [
  'INBOX',
  'ACTIONS',
  'NOTIFICATIONS',
  'LINK',
  'METRIC',
  'NAVIGATION',
  'PAGE',
];

export function WorkspaceDesigner() {
  const [workspaces, setWorkspaces] = useState<StudioWorkspaceDraft[]>(() => loadWorkspaces());
  const [selectedCode, setSelectedCode] = useState(workspaces[0]?.code ?? '');
  const [status, setStatus] = useState<string | undefined>();
  const [panelLabel, setPanelLabel] = useState('Operations Dashboard');
  const [panelType, setPanelType] = useState<StudioWorkspacePanelDraft['type']>('METRIC');
  const [panelTarget, setPanelTarget] = useState('/notifications');
  const [panelCapabilities, setPanelCapabilities] = useState('dashboard.read');
  const [pendingDelete, setPendingDelete] = useState<StudioWorkspacePanelDraft>();

  const selected = workspaces.find((workspace) => workspace.code === selectedCode) ?? workspaces[0];

  useEffect(() => {
    void listWorkspaces()
      .then((records) => {
        if (records.length === 0) {
          return;
        }

        const mapped = records.map((record) => metadataToDraft(record.definition));
        setWorkspaces(mapped);
        saveWorkspaces(mapped);
        setSelectedCode(mapped[0]?.code ?? '');
      })
      .catch(() => {
        // Fall back to local drafts when API is unavailable.
      });
  }, []);

  function persist(nextWorkspaces: StudioWorkspaceDraft[]) {
    setWorkspaces(nextWorkspaces);
    saveWorkspaces(nextWorkspaces);
  }

  function updateSelected(next: StudioWorkspaceDraft) {
    persist(workspaces.map((workspace) => (workspace.code === next.code ? next : workspace)));
  }

  function addPanel() {
    if (!selected) {
      return;
    }

    const code = toMetadataCode(panelLabel);
    const panel: StudioWorkspacePanelDraft = {
      code,
      label: panelLabel.trim() || 'Panel',
      type: panelType,
      target: panelTarget.trim() || undefined,
      order: selected.panels.length + 1,
      requiredCapabilities: panelCapabilities
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    };

    updateSelected({
      ...selected,
      panels: [...selected.panels.filter((item) => item.code !== code), panel].sort((a, b) => a.order - b.order),
    });
  }

  function removePanel(code: string) {
    if (!selected) {
      return;
    }

    updateSelected({
      ...selected,
      panels: selected.panels.filter((panel) => panel.code !== code),
    });
  }

  async function publishWorkspace() {
    if (!selected) {
      return;
    }

    setStatus('Publishing...');

    try {
      await saveWorkspace(draftToDefinition(selected));
      setStatus(`Published ${selected.code} to platform metadata.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Publish failed.');
    }
  }

  return (
    <section className="redos-metadata-card">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Workspace</span>
        <h3>
          Workspace Designer
          {' '}
          <HelpTip
            label="Workspace Designer"
            text="Edit persona workspace panels. Publish saves WORKSPACE metadata to the platform kernel."
          />
        </h3>
        <p>Configure inbox, actions, links, and metrics per persona workspace — no hardcoded shell layout.</p>
      </div>

      <section className="redos-data-application-context">
        <label>
          <span>Workspace</span>
          <select value={selected?.code ?? ''} onChange={(event) => setSelectedCode(event.target.value)}>
            {workspaces.map((workspace) => (
              <option key={workspace.code} value={workspace.code}>{workspace.title}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => { void publishWorkspace(); }}>Publish to Platform</button>
      </section>

      {status ? <p className="redos-metadata-status">{status}</p> : null}

      {selected ? (
        <>
          <div className="redos-metadata-form-grid">
            <label>
              <span>Panel label</span>
              <input value={panelLabel} onChange={(event) => setPanelLabel(event.target.value)} />
            </label>
            <label>
              <span>Panel type</span>
              <select value={panelType} onChange={(event) => setPanelType(event.target.value as StudioWorkspacePanelDraft['type'])}>
                {panelTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Target URL</span>
              <input value={panelTarget} onChange={(event) => setPanelTarget(event.target.value)} placeholder="/notifications" />
            </label>
            <label>
              <span>Required capabilities (comma-separated)</span>
              <input value={panelCapabilities} onChange={(event) => setPanelCapabilities(event.target.value)} />
            </label>
          </div>

          <button type="button" onClick={addPanel}>Add panel</button>

          <ul className="redos-metadata-list">
            {selected.panels.map((panel) => (
              <li key={panel.code}>
                <div>
                  <strong>{panel.label}</strong>
                  <small>
                    {panel.type}
                    {panel.target ? ` · ${panel.target}` : ''}
                    {panel.requiredCapabilities?.length ? ` · ${panel.requiredCapabilities.join(', ')}` : ''}
                  </small>
                </div>
                <button type="button" onClick={() => setPendingDelete(panel)}>Remove</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No workspace loaded. Open from platform seed or create locally.</p>
      )}

      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title="Remove panel"
          target={pendingDelete.label}
          description={`Remove panel from ${selected?.code}?`}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => {
            removePanel(pendingDelete.code);
            setPendingDelete(undefined);
          }}
        />
      ) : null}
    </section>
  );
}

function metadataToDraft(definition: WorkspaceDefinition): StudioWorkspaceDraft {
  return {
    code: definition.code,
    persona: definition.persona,
    title: definition.title,
    subtitle: definition.subtitle,
    platform: definition.platform,
    enabled: definition.enabled,
    panels: definition.panels.map((panel) => ({
      code: panel.code,
      label: panel.label,
      type: panel.type,
      target: panel.target,
      order: panel.order,
      requiredCapabilities: panel.requiredCapabilities,
    })),
  };
}

function draftToDefinition(draft: StudioWorkspaceDraft): WorkspaceDefinition {
  return {
    code: draft.code,
    persona: draft.persona,
    title: draft.title,
    subtitle: draft.subtitle,
    platform: draft.platform,
    enabled: draft.enabled,
    panels: draft.panels,
  };
}
