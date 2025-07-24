import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoCallDetectorViewProps } from './ExpoCallDetector.types';

const NativeView: React.ComponentType<ExpoCallDetectorViewProps> =
  requireNativeView('ExpoCallDetector');

export default function ExpoCallDetectorView(props: ExpoCallDetectorViewProps) {
  return <NativeView {...props} />;
}
