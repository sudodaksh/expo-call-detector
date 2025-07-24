import { useEffect, useState } from "react";
import { EventSubscription } from "expo-modules-core";
import ExpoCallDetectorModule from "./ExpoCallDetectorModule";

export function useCallDetector() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let subscription: EventSubscription | undefined;

    const startDetection = async () => {
      try {
        subscription = ExpoCallDetectorModule.addListener(
          "onCallStateChanged",
          (event) => {
            setIsCallActive(event.isActive);
          }
        );

        await ExpoCallDetectorModule.startListening();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to start call detection. Error details:", error);
        setIsReady(false);
      }
    };

    startDetection();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (isReady) {
        ExpoCallDetectorModule.stopListening();
      }
    };
  }, []);

  return { isCallActive, isReady };
}
