# expo-call-detector

Detect phone call states in your Expo app.

## Installation

```bash
npx expo install expo-call-detector
```

## API

### `useCallDetector()`

Hook that automatically starts call detection and manages state.

```tsx
import { useCallDetector } from "expo-call-detector";

export default function App() {
  const { isCallActive, isReady } = useCallDetector();

  return <Text>{isCallActive ? "=� On Call" : " No Call"}</Text>;
}
```

### Manual Control

```tsx
import ExpoCallDetectorModule from "expo-call-detector";

// Check/request permission
const hasPermission = await ExpoCallDetectorModule.checkPermission();
const permission = await ExpoCallDetectorModule.requestPermission();

// Start/stop listening
await ExpoCallDetectorModule.startListening();
await ExpoCallDetectorModule.stopListening();

// Listen to events
const subscription = ExpoCallDetectorModule.addListener(
  "onCallStateChanged",
  (event) => {
    console.log("Call active:", event.isActive);
  }
);
```

## Permissions

### Android

The `READ_PHONE_STATE` permission is automatically added by this module. Users will need to grant permission at runtime using the `requestPermission()` method.

### iOS

No special permissions required. Uses CallKit for call state detection.

## Example

See the [example](./example) directory for a complete implementation.

## Author

Daksh | [Github](https://github.com/sudodaksh) | [Website](https://dak.sh) | [Twitter](https://twitter.com/sudodaksh)

## License

MIT
