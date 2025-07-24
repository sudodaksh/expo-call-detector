package expo.modules.calldetector

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import android.content.Context
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import android.os.Build
import android.telephony.TelephonyCallback
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import android.os.Handler
import android.os.Looper
import expo.modules.interfaces.permissions.Permissions

class ExpoCallDetectorModule : Module() {
  private var telephonyManager: TelephonyManager? = null
  private var phoneStateListener: PhoneStateListener? = null
  private var telephonyCallback: Any? = null
  private var isListening = false
  
  // Reuse a single main-thread Handler instead of allocating one per event
  private val mainHandler = Handler(Looper.getMainLooper())

  // Re‐usable payload to avoid Map allocation on every callback (only accessed from the main thread)
  private val eventPayload: MutableMap<String, Any> = HashMap(2)

  /**
   * Executes [block] on the main thread, posting to the handler only when necessary.
   */
  private inline fun runOnMainThread(crossinline block: () -> Unit) {
    if (Looper.myLooper() == Looper.getMainLooper()) {
      block()
    } else {
      mainHandler.post { block() }
    }
  }
  
  private val context: Context
    get() = appContext.reactContext ?: throw CodedException("Context not available")

  override fun definition() = ModuleDefinition {
    Name("ExpoCallDetector")

    Events("onCallStateChanged")

    AsyncFunction("startListening") { promise: Promise ->
      try {
        if (isListening) {
          promise.resolve(true)
          return@AsyncFunction
        }

        if (!hasPhoneStatePermission()) {
          promise.reject("PERMISSION_DENIED", "READ_PHONE_STATE permission is required", null)
          return@AsyncFunction
        }

        telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          // Android 12+ uses TelephonyCallback
          val callback = object : TelephonyCallback(), TelephonyCallback.CallStateListener {
            override fun onCallStateChanged(state: Int) {
              handleCallStateChange(state)
            }
          }
          telephonyCallback = callback
          telephonyManager?.registerTelephonyCallback(
            context.mainExecutor,
            callback
          )
        } else {
          // Older versions use PhoneStateListener
          phoneStateListener = object : PhoneStateListener() {
            override fun onCallStateChanged(state: Int, phoneNumber: String?) {
              handleCallStateChange(state)
            }
          }
          telephonyManager?.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE)
        }

        isListening = true
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("START_FAILED", "Failed to start call detection: ${e.message}", e)
      }
    }

    AsyncFunction("stopListening") { promise: Promise ->
      try {
        if (!isListening) {
          promise.resolve(true)
          return@AsyncFunction
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          telephonyCallback?.let {
            telephonyManager?.unregisterTelephonyCallback(it as TelephonyCallback)
          }
          telephonyCallback = null
        } else {
          phoneStateListener?.let {
            telephonyManager?.listen(it, PhoneStateListener.LISTEN_NONE)
          }
          phoneStateListener = null
        }

        isListening = false
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("STOP_FAILED", "Failed to stop call detection: ${e.message}", e)
      }
    }

    AsyncFunction("checkPermission") { promise: Promise ->
      promise.resolve(hasPhoneStatePermission())
    }

    AsyncFunction("requestPermission") { promise: Promise ->
      Permissions.askForPermissionsWithPermissionsManager(appContext.permissions, promise, Manifest.permission.READ_PHONE_STATE)
    }

    OnDestroy {
      if (isListening) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          telephonyCallback?.let {
            telephonyManager?.unregisterTelephonyCallback(it as TelephonyCallback)
          }
        } else {
          phoneStateListener?.let {
            telephonyManager?.listen(it, PhoneStateListener.LISTEN_NONE)
          }
        }
      }

      // Clear the system service reference to avoid leaks
      telephonyManager = null
    }
  }

  private fun hasPhoneStatePermission(): Boolean {
    return ContextCompat.checkSelfPermission(
      context,
      Manifest.permission.READ_PHONE_STATE
    ) == PackageManager.PERMISSION_GRANTED
  }

  private fun handleCallStateChange(state: Int) {
    val isActive = state != TelephonyManager.CALL_STATE_IDLE

    runOnMainThread {
      eventPayload["isActive"] = isActive
      eventPayload["timestamp"] = System.currentTimeMillis()
      sendEvent("onCallStateChanged", eventPayload)
    }
  }
}
