import type { DragEvent, PropsWithChildren } from 'react';

export function Canvas({ children }: PropsWithChildren) {
  return <div className="studio-canvas">{children}</div>;
}

export function Node({
  children,
  x,
  y,
  selected,
  onClick,
  onDragStart,
  onDragEnd,
}: PropsWithChildren<{
  x: number;
  y: number;
  selected?: boolean;
  onClick?: () => void;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLButtonElement>) => void;
}>) {
  return (
    <button
      className={selected ? 'studio-canvas-node studio-canvas-node-selected' : 'studio-canvas-node'}
      draggable
      style={{
        left: x,
        top: y,
      }}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {children}
    </button>
  );
}

export function Edge({
  x1,
  y1,
  x2,
  y2,
  label,
  selected,
  onClick,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <svg className="studio-canvas-edge-layer">
      <line className={selected ? 'studio-canvas-edge studio-canvas-edge-selected' : 'studio-canvas-edge'} x1={x1} y1={y1} x2={x2} y2={y2} onClick={onClick} />
      <foreignObject x={midX - 60} y={midY - 16} width="120" height="32">
        <button className="studio-canvas-edge-label" onClick={onClick}>
          {label}
        </button>
      </foreignObject>
    </svg>
  );
}

export function Connector({ children }: PropsWithChildren) {
  return <span className="studio-connector">{children}</span>;
}

export function MiniMap({ children }: PropsWithChildren) {
  return <div className="studio-minimap">{children}</div>;
}

export function Toolbar({ children }: PropsWithChildren) {
  return <div className="studio-toolbar">{children}</div>;
}
