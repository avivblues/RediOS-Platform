import type { CreationFieldInput } from '../create/creation-types';

interface SuggestionTemplate {
  match: RegExp;
  fields: Array<Pick<CreationFieldInput, 'label' | 'type'> & { required?: boolean }>;
}

const suggestionTemplates: SuggestionTemplate[] = [
  {
    match: /product|inventory|stock/i,
    fields: [
      { label: 'Name', type: 'Text', required: true },
      { label: 'SKU', type: 'Text' },
      { label: 'Price', type: 'Money' },
      { label: 'Stock', type: 'Number' },
    ],
  },
  {
    match: /customer|client|account/i,
    fields: [
      { label: 'Name', type: 'Text', required: true },
      { label: 'Email', type: 'Text' },
      { label: 'Phone', type: 'Text' },
    ],
  },
  {
    match: /task|work|todo/i,
    fields: [
      { label: 'Title', type: 'Text', required: true },
      { label: 'Due Date', type: 'Date' },
      { label: 'Status', type: 'Text' },
    ],
  },
];

export function suggestInformationForObject(objectName: string): CreationFieldInput[] {
  const template = suggestionTemplates.find((candidate) => candidate.match.test(objectName));
  const suggestions = template?.fields ?? [
    { label: 'Name', type: 'Text', required: true },
    { label: 'Description', type: 'Long Text' },
    { label: 'Status', type: 'Text' },
  ];

  return suggestions.map((suggestion) => ({
    label: suggestion.label,
    type: suggestion.type,
    required: suggestion.required ?? false,
    unique: false,
  }));
}
