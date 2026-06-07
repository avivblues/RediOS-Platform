import {
  BadgeRenderer,
  ButtonRenderer,
  DatePickerRenderer,
  IconRenderer,
  LabelRenderer,
  LookupRenderer,
  NumberInputRenderer,
  SelectRenderer,
  TextAreaRenderer,
  TextInputRenderer,
} from '../../components/atoms/basic-atoms';
import {
  ActionButtonRenderer,
  FormFieldRenderer,
  SearchBoxRenderer,
  StatusBadgeRenderer,
} from '../../components/molecules/form-field-renderer';
import {
  ActionBarRenderer,
  DataTableRenderer,
  DetailCardRenderer,
  FormSectionRenderer,
  TimelineRenderer,
} from '../../components/organisms/runtime-organisms';
import type { RuntimeComponentRenderer } from '../renderer/render-context';

export const componentRegistry: Record<string, RuntimeComponentRenderer> = {
  PAGE: ContainerRenderer,
  TEMPLATE: ContainerRenderer,
  TEXT_INPUT: TextInputRenderer,
  TEXT_AREA: TextAreaRenderer,
  NUMBER_INPUT: NumberInputRenderer,
  DATE_PICKER: DatePickerRenderer,
  SELECT: SelectRenderer,
  LOOKUP: LookupRenderer,
  BUTTON: ButtonRenderer,
  BADGE: BadgeRenderer,
  LABEL: LabelRenderer,
  ICON: IconRenderer,
  FORM_FIELD: FormFieldRenderer,
  SEARCH_BOX: SearchBoxRenderer,
  ACTION_BUTTON: ActionButtonRenderer,
  STATUS_BADGE: StatusBadgeRenderer,
  FORM_SECTION: FormSectionRenderer,
  DATA_TABLE: DataTableRenderer,
  ACTION_BAR: ActionBarRenderer,
  DETAIL_CARD: DetailCardRenderer,
  TIMELINE: TimelineRenderer,
  CARD: DetailCardRenderer,
  TABLE: DataTableRenderer,
};

export function resolveComponentRenderer(code: string): RuntimeComponentRenderer {
  if (code.startsWith('PAGE:') || code.startsWith('TEMPLATE:') || code === 'HEADER' || code === 'CONTENT' || code === 'SIDEBAR') {
    return ContainerRenderer;
  }

  return componentRegistry[code] ?? UnknownComponentRenderer;
}

function ContainerRenderer({ node, children }: Parameters<RuntimeComponentRenderer>[0]) {
  return (
    <section className={node.kind === 'REGION' ? 'runtime-region' : undefined} data-component={node.component}>
      {children}
    </section>
  );
}

function UnknownComponentRenderer({ node }: Parameters<RuntimeComponentRenderer>[0]) {
  return <div className="runtime-card">Unsupported component: {node.component}</div>;
}
