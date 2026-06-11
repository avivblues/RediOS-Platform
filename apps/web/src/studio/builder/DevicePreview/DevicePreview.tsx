import type { StudioDevice } from '../types';

export function DevicePreview({
  device,
  onDeviceChange,
}: {
  device: StudioDevice;
  onDeviceChange: (device: StudioDevice) => void;
}) {
  return (
    <div className="redos-device-switch">
      {(['Desktop', 'Tablet', 'Mobile'] as StudioDevice[]).map((nextDevice) => (
        <button
          key={nextDevice}
          className={device === nextDevice ? 'redos-chip redos-chip-active' : 'redos-chip'}
          type="button"
          onClick={() => onDeviceChange(nextDevice)}
        >
          {nextDevice}
        </button>
      ))}
    </div>
  );
}
