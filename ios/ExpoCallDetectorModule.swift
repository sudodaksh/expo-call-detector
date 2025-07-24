import ExpoModulesCore
import CallKit

// Separate delegate class to handle CXCallObserverDelegate
private class CallObserverDelegate: NSObject, CXCallObserverDelegate {
  weak var module: ExpoCallDetectorModule?
  
  init(module: ExpoCallDetectorModule) {
    self.module = module
  }
  
  func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
    print("ExpoCallDetector: Call state changed detected")
    module?.updateCallState(calls: callObserver.calls)
  }
}

public class ExpoCallDetectorModule: Module {
  private var isCallActive = false

  private var callObserver: CXCallObserver?
  private var callObserverDelegate: CallObserverDelegate?
  private var isListening = false
  private var lastCallActive = false
  
  public func definition() -> ModuleDefinition {
    Name("ExpoCallDetector")
    
    Constants([:])
    
    Events("onCallStateChanged")
    
    OnCreate {
      print("ExpoCallDetector: Module created and initialized")
    }
    
    AsyncFunction("startListening") { (promise: Promise) in
      print("ExpoCallDetector: startListening called")
      
      if self.isListening {
        print("ExpoCallDetector: Already listening")
        promise.resolve(true)
        return
      }
      
      self.callObserver = CXCallObserver()
      self.callObserverDelegate = CallObserverDelegate(module: self)
      // Use main queue to ensure delegate callbacks are delivered on the main thread
      self.callObserver?.setDelegate(self.callObserverDelegate, queue: DispatchQueue.main)
      self.isListening = true
      
      print("ExpoCallDetector: Call observer setup complete")
      
      // Check current call state
      self.checkCurrentCallState()
      
      promise.resolve(true)
    }
    
    AsyncFunction("stopListening") { (promise: Promise) in
      if !self.isListening {
        promise.resolve(true)
        return
      }
      
      self.callObserver = nil
      self.callObserverDelegate = nil
      self.isListening = false
      promise.resolve(true)
    }
    
    AsyncFunction("checkPermission") { (promise: Promise) in
      // iOS doesn't require explicit permission for CallKit observation
      // but the app needs to be configured with appropriate capabilities
      promise.resolve(true)
    }
    
    AsyncFunction("requestPermission") { (promise: Promise) in
      // iOS doesn't require explicit permission for CallKit observation
      // Return PermissionResponse object to maintain API consistency
      let response: [String: Any] = [
        "status": "granted",
        "expires": "never",
        "granted": true,
        "canAskAgain": true
      ]
      promise.resolve(response)
    }
    
    OnDestroy {
      self.callObserver = nil
      self.callObserverDelegate = nil
      self.isListening = false
    }
  }
  
  private func checkCurrentCallState() {
    guard let callObserver = self.callObserver else { 
      print("ExpoCallDetector: No call observer available")
      return 
    }

    let calls = callObserver.calls
    print("ExpoCallDetector: Checking current call state, found \(calls.count) calls")
    updateCallState(calls: calls)
    
    // Force send initial state
    let eventData: [String: Any] = [
      "isActive": self.lastCallActive,
      "timestamp": Int(Date().timeIntervalSince1970 * 1000)
    ]
    print("ExpoCallDetector: Sending initial state: \(self.lastCallActive ? "active" : "idle")")
    self.sendEvent("onCallStateChanged", eventData)
  }

  func updateCallState(calls: [CXCall]) {
    print("ExpoCallDetector: Updating call state, calls count: \(calls.count)")
    
    // Check if any call is active (not ended)
    let hasActiveCall = calls.contains { !$0.hasEnded }
    
    transitionIfNeeded(to: hasActiveCall)
  }

  private func transitionIfNeeded(to isActive: Bool) {
    guard isActive != self.lastCallActive else { 
      print("ExpoCallDetector: State unchanged, still \(isActive ? "active" : "idle")")
      return 
    }

    print("ExpoCallDetector: Call state changing from \(self.lastCallActive ? "active" : "idle") to \(isActive ? "active" : "idle")")
    self.lastCallActive = isActive
    
    let eventData: [String: Any] = [
      "isActive": isActive,
      "timestamp": Int(Date().timeIntervalSince1970 * 1000)
    ]
    
    print("ExpoCallDetector: Sending event with data: \(eventData)")
    self.sendEvent("onCallStateChanged", eventData)
  }
}