import type { PropsWithChildren } from 'react';

export function Button({
  children,
  variant = 'primary',
  disabled,
  onClick,
  tooltip,
}: PropsWithChildren<{
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
  tooltip?: string;
}>) {
  return (
    <button
      className={`studio-button studio-button-${variant}`}
      disabled={disabled || !onClick}
      onClick={onClick}
      title={tooltip}
      data-tooltip={tooltip}
    >
      {children}
    </button>
  );
}

export function Input({
  value,
  placeholder,
  type = 'text',
  onChange,
}: {
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return <input className="studio-input" value={value} placeholder={placeholder} type={type} onChange={(event) => onChange(event.target.value)} />;
}

export function Label({ children }: PropsWithChildren) {
  return <label className="studio-label">{children}</label>;
}

export function Badge({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info' | 'warning' | 'danger' | 'success' }>) {
  return <span className={`studio-badge studio-badge-${tone}`}>{children}</span>;
}

export function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select className="studio-input" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
