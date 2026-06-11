import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { humanizeCode } from '../humanizer/HumanizerEngine';

interface ProductTemplate {
  code: string;
  name: string;
  description: string;
  objects: string[];
  information: string[];
  screens: string[];
  processExamples: string[];
}

const productTemplates: ProductTemplate[] = [
  {
    code: 'INVENTORY_TEMPLATE',
    name: 'Inventory',
    description: 'Manage products, stock levels, and item movement.',
    objects: ['Product', 'Supplier', 'Stock Movement'],
    information: ['Name', 'SKU', 'Price', 'Stock'],
    screens: ['Product List', 'Product Input Screen'],
    processExamples: ['Draft', 'Received', 'Available'],
  },
  {
    code: 'CRM_TEMPLATE',
    name: 'CRM',
    description: 'Manage customers, contacts, and relationship activity.',
    objects: ['Customer', 'Contact'],
    information: ['Name', 'Email', 'Phone'],
    screens: ['Customer List', 'Customer Input Screen'],
    processExamples: ['New', 'Qualified', 'Active'],
  },
  {
    code: 'ASSET_TRACKING_TEMPLATE',
    name: 'Asset Tracking',
    description: 'Track assets, ownership, condition, and service needs.',
    objects: ['Asset', 'Location'],
    information: ['Asset Name', 'Serial Number', 'Status'],
    screens: ['Asset List', 'Asset Input Screen'],
    processExamples: ['Available', 'Assigned', 'Maintenance'],
  },
  {
    code: 'HELPDESK_TEMPLATE',
    name: 'Helpdesk',
    description: 'Manage tasks, requests, and team follow-up.',
    objects: ['Request', 'Team Member'],
    information: ['Title', 'Priority', 'Status'],
    screens: ['Request List', 'Request Input Screen'],
    processExamples: ['Open', 'In Progress', 'Done'],
  },
];

export function StudioTemplateGallery({ onCreateFromTemplate }: { onCreateFromTemplate?: () => void }) {
  return (
    <Panel title="Template Gallery">
      <p className="studio-muted">Templates create application drafts only. They never create source files or business modules.</p>
      <div className="studio-card-grid">
        {productTemplates.map((template) => (
          <article key={template.code} className="studio-card">
            <span className="studio-kicker">{humanizeCode(template.code)}</span>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <TemplateLine label="Application" values={[template.name]} />
            <TemplateLine label="Objects" values={template.objects} />
            <TemplateLine label="Information" values={template.information} />
            <TemplateLine label="Screens" values={template.screens} />
            <TemplateLine label="Process examples" values={template.processExamples} />
            <Button variant="secondary" onClick={onCreateFromTemplate} tooltip={`Gunakan template ${template.name} untuk membuat rancangan aplikasi, bukan file kode.`}>Use Template</Button>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function TemplateLine({ label, values }: { label: string; values: string[] }) {
  return <div className="studio-muted">{label}: {values.join(', ')}</div>;
}
