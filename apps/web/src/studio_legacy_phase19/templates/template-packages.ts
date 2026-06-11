export interface StudioTemplatePackage {
  code: string;
  name: string;
  description: string;
  entities: string[];
  workflows: string[];
  forms: string[];
}

export const studioTemplatePackages: StudioTemplatePackage[] = [
  {
    code: 'CRM_TEMPLATE',
    name: 'CRM',
    description: 'Customer, contact, and relationship metadata package.',
    entities: ['CUSTOMER', 'CONTACT'],
    workflows: ['CUSTOMER_LIFECYCLE'],
    forms: ['CUSTOMER_FORM'],
  },
  {
    code: 'ASSET_MANAGEMENT_TEMPLATE',
    name: 'Asset Management',
    description: 'Asset and maintenance metadata package.',
    entities: ['ASSET', 'WORK_ORDER'],
    workflows: ['ASSET_LIFECYCLE', 'WORK_ORDER_LIFECYCLE'],
    forms: ['WORK_ORDER_FORM'],
  },
  {
    code: 'HELPDESK_TEMPLATE',
    name: 'Helpdesk',
    description: 'Ticket lifecycle and support workflow metadata package.',
    entities: ['TICKET'],
    workflows: ['TICKET_LIFECYCLE'],
    forms: ['TICKET_FORM'],
  },
  {
    code: 'INVENTORY_TEMPLATE',
    name: 'Inventory',
    description: 'Receiving, stock movement, and balance metadata package.',
    entities: ['RECEIVING', 'STOCK_MOVEMENT', 'STOCK_BALANCE'],
    workflows: ['RECEIVING_LIFECYCLE'],
    forms: [],
  },
];
