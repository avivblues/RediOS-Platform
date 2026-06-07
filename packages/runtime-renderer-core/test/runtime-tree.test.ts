import assert from 'node:assert/strict';
import { generatePreviewTree, resolveLayout, type ResolvedUIPage, type RuntimeFormDefinition } from '../src';

const page: ResolvedUIPage = {
  page: {
    kind: 'PAGE',
    code: 'WORK_ORDER_DETAIL_PAGE',
    entityCode: 'WORK_ORDER',
    template: 'MASTER_DETAIL',
    regions: {
      HEADER: ['ACTION_BAR'],
      CONTENT: ['DETAIL_CARD'],
    },
    enabled: true,
  },
  template: {
    kind: 'TEMPLATE',
    code: 'MASTER_DETAIL',
    regions: [{ code: 'HEADER' }, { code: 'CONTENT' }],
    enabled: true,
  },
  regions: [
    {
      code: 'HEADER',
      components: [
        {
          code: 'ACTION_BAR',
          molecules: [
            {
              code: 'ACTION_BUTTON',
              bind: 'actions',
              atoms: [{ code: 'BUTTON', bind: 'action' }],
            },
          ],
        },
      ],
    },
    {
      code: 'CONTENT',
      components: [
        {
          code: 'DETAIL_CARD',
          molecules: [
            {
              code: 'FORM_FIELD',
              bind: 'fields',
              atoms: [
                { code: 'LABEL', bind: 'label' },
                { code: 'TEXT_INPUT', bind: 'value' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const form: RuntimeFormDefinition = {
  entityCode: 'WORK_ORDER',
  sections: [
    {
      code: 'GENERAL',
      fields: [
        {
          fieldCode: 'title',
          component: 'TEXT_INPUT',
          order: 1,
          visible: true,
          readonly: false,
        },
        {
          fieldCode: 'assetId',
          component: 'LOOKUP',
          order: 2,
          visible: true,
          readonly: false,
        },
      ],
    },
  ],
};

const tree = generatePreviewTree({
  page,
  form,
  context: {
    tenantId: 'demo',
    domainCode: 'DEFAULT',
    applicationCode: 'ASSET_MAINTENANCE',
    userId: 'test',
    roles: [],
    groups: [],
    attributes: {},
    platform: 'WEB',
  },
});

const components = JSON.stringify(tree);

assert.match(components, /WORK_ORDER_DETAIL_PAGE/);
assert.match(components, /MASTER_DETAIL/);
assert.match(components, /ACTION_BAR/);
assert.match(components, /FORM_FIELD/);
assert.match(components, /TEXT_INPUT/);
assert.match(components, /LOOKUP/);

assert.deepEqual(resolveLayout({ props: { layout: { desktop: { columns: 3 }, mobile: { columns: 1 } } } }, 'WEB'), { columns: 3 });
assert.deepEqual(resolveLayout({ props: { layout: { desktop: { columns: 3 }, mobile: { columns: 1 } } } }, 'MOBILE'), { columns: 1 });
