export type CallStateChangeEvent = {
  isActive: boolean;
  timestamp: number;
};

export type ExpoCallDetectorModuleEvents = {
  onCallStateChanged: (event: CallStateChangeEvent) => void;
};
