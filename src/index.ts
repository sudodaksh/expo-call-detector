// Reexport the native module. On web, it will be resolved to ExpoCallDetectorModule.web.ts
// and on native platforms to ExpoCallDetectorModule.ts
export { default } from "./ExpoCallDetectorModule";
export { default as ExpoCallDetectorModule } from "./ExpoCallDetectorModule";
export * from "./ExpoCallDetector.types";
export { useCallDetector } from "./useCallDetector";
