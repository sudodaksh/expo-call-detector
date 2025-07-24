import * as React from 'react';

import { ExpoCallDetectorViewProps } from './ExpoCallDetector.types';

export default function ExpoCallDetectorView(props: ExpoCallDetectorViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
