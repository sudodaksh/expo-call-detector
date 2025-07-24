import { NativeModule, requireNativeModule } from "expo";
import { PermissionResponse } from "expo-modules-core";

import { ExpoCallDetectorModuleEvents } from "./ExpoCallDetector.types";

declare class ExpoCallDetectorModule extends NativeModule<ExpoCallDetectorModuleEvents> {
  startListening(): Promise<boolean>;
  stopListening(): Promise<boolean>;
  checkPermission(): Promise<boolean>;
  requestPermission(): Promise<PermissionResponse>;
}

export default requireNativeModule<ExpoCallDetectorModule>("ExpoCallDetector");
