import { NativeModule, requireNativeModule } from 'expo';

import { ExpoCallDetectorModuleEvents } from './ExpoCallDetector.types';

declare class ExpoCallDetectorModule extends NativeModule<ExpoCallDetectorModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoCallDetectorModule>('ExpoCallDetector');
