// Reexport the native module. On web, it will be resolved to ExpoCallDetectorModule.web.ts
// and on native platforms to ExpoCallDetectorModule.ts
export { default } from './ExpoCallDetectorModule';
export { default as ExpoCallDetectorView } from './ExpoCallDetectorView';
export * from  './ExpoCallDetector.types';
