import type { BuilderComponentDefinition } from '../../builder/types';
import { tailAdminBuilderComponents } from '../../templates/tailadmin-template-registry';

export const atomComponents: BuilderComponentDefinition[] = [
  { type: 'TextInput', label: 'Short text', layer: 'ATOM', description: 'Single line input' },
  { type: 'TextArea', label: 'Long text', layer: 'ATOM', description: 'Multi-line input' },
  { type: 'TextEditor', label: 'Text editor', layer: 'ATOM', description: 'Text editor with formatting' },
  { type: 'NumberInput', label: 'Number', layer: 'ATOM', description: 'Input field that only allows numbers' },
  { type: 'EmailInput', label: 'Email', layer: 'ATOM', description: 'Input field that expects an email' },
  { type: 'PhoneInput', label: 'Phone', layer: 'ATOM', description: 'Phone number with country selector' },
  { type: 'PasswordInput', label: 'Password', layer: 'ATOM', description: 'Input field that hides characters' },
  { type: 'UrlInput', label: 'URL', layer: 'ATOM', description: 'Input field that expects a URL' },
  { type: 'LocationInput', label: 'Location', layer: 'ATOM', description: 'Location or address input' },
  { type: 'Signature', label: 'Signature', layer: 'ATOM', description: 'Draw, type, or upload signature' },
  { type: 'Paragraph', label: 'Paragraph', layer: 'ATOM', description: 'Formatable text' },
  { type: 'Image', label: 'Image', layer: 'ATOM', description: 'Display an image' },
  { type: 'Link', label: 'Link', layer: 'ATOM', description: 'Link to another website' },
  { type: 'Checkbox', label: 'Checkbox', layer: 'ATOM', description: 'Single checkbox input' },
  { type: 'Button', label: 'Button', layer: 'ATOM', description: 'Generic button' },
  { type: 'Icon', label: 'Icon', layer: 'ATOM', description: 'Small visual icon' },
  ...tailAdminBuilderComponents.filter((component) => component.layer === 'ATOM'),
];
