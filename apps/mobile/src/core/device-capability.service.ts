export type DeviceCapability = 'CAMERA' | 'FILE_PICKER' | 'LOCATION' | 'SIGNATURE';

export interface DeviceCapabilityRequest {
  capability: DeviceCapability;
  binding?: {
    source: 'FORM';
    fieldCode: string;
  };
}

export interface DeviceCapabilityService {
  supports(capability: DeviceCapability): boolean;
  request(request: DeviceCapabilityRequest): Promise<unknown>;
}

export class MetadataDeviceCapabilityService implements DeviceCapabilityService {
  supports(): boolean {
    return false;
  }

  request(request: DeviceCapabilityRequest): Promise<unknown> {
    return Promise.reject(new Error(`Device capability ${request.capability} is not implemented in this phase.`));
  }
}
