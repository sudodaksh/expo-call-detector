import { registerWebModule, NativeModule } from 'expo';

import { ExpoCallDetectorModuleEvents } from './ExpoCallDetector.types';

class ExpoCallDetectorModule extends NativeModule<ExpoCallDetectorModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoCallDetectorModule, 'ExpoCallDetectorModule');
