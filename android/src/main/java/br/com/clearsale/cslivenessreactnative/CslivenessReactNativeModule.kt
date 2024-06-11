package br.com.clearsale.cslivenessreactnative

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.util.Log
import com.clear.studio.csliveness.core.CSLiveness
import com.clear.studio.csliveness.core.CSLivenessConfig
import com.clear.studio.csliveness.core.CSLivenessConfigColors
import com.clear.studio.csliveness.core.CSLivenessResult
import com.clear.studio.csliveness.view.CSLivenessActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap


class CSLivenessReactNative(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val requestCode: Int = 40
  private val parameterName: String = "PARAMETER_NAME"
  private val logTag = "[CSLiveness]"

  private var promise: Promise? = null

  override fun getName(): String {
    return NAME
  }

  private fun reset() {
    this.promise = null;
  }

  @ReactMethod
  fun openCSLiveness(sdkParams: ReadableMap, promise: Promise) {
    if (this.promise !== null) {
      // Means that we have a SDK call pending, so nothing to do yet.

      return;
    }

    try {
      this.promise = promise;

      val clientId = if (sdkParams.hasKey("clientId")) sdkParams.getString("clientId") else null
      val clientSecretId = if (sdkParams.hasKey("clientSecretId")) sdkParams.getString("clientSecretId") else null
      val identifierId = if (sdkParams.hasKey("identifierId")) sdkParams.getString("identifierId") else null
      val cpf = if (sdkParams.hasKey("cpf")) sdkParams.getString("cpf") else null
      val vocalGuidance = if (sdkParams.hasKey("identifierId")) sdkParams.getBoolean("vocalGuidance") else false
      val primaryColor = if (sdkParams.hasKey("primaryColor")) sdkParams.getString("primaryColor") else null
      val secondaryColor = if (sdkParams.hasKey("secondaryColor")) sdkParams.getString("secondaryColor") else null
      val titleColor = if (sdkParams.hasKey("titleColor")) sdkParams.getString("titleColor") else null
      val paragraphColor = if (sdkParams.hasKey("paragraphColor")) sdkParams.getString("paragraphColor") else null

      // Now validate
      if (clientId.isNullOrBlank()) throw Exception("clientId is required")
      if (clientSecretId.isNullOrBlank()) throw Exception("clientSecretId is required")

      val csLiveness = CSLiveness(
        clientId, clientSecretId, identifierId, cpf, CSLivenessConfig(
          vocalGuidance = vocalGuidance ?: false, colors = CSLivenessConfigColors(
            primaryColor = if (!primaryColor.isNullOrBlank()) Color.parseColor(
              primaryColor
            ) else null,
            secondaryColor = if (!secondaryColor.isNullOrBlank()) Color.parseColor(
              secondaryColor
            ) else null,
            titleColor = if (!titleColor.isNullOrBlank()) Color.parseColor(titleColor) else null,
            paragraphColor = if (!paragraphColor.isNullOrBlank()) Color.parseColor(
              paragraphColor
            ) else null
          )
        )
      )

      if (reactApplicationContext != null) {
        val intent = Intent(reactApplicationContext, CSLivenessActivity::class.java)
        intent.putExtra(parameterName, csLiveness)

        reactApplicationContext.startActivityForResult(intent, requestCode, null)
      } else {
        throw Exception("Missing application from current activity")
      }
    } catch (t: Throwable) {
      Log.e(logTag, "Error starting CSLivenessSDK", t)

      promise.reject("InternalError", t.message ?: "InternalError", null)
      this.reset()
    }
  }

  private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(
      activity: Activity,
      activityRequestCode: Int,
      activityResultCode: Int,
      data: Intent?
    ) {
      if (activityRequestCode == requestCode) {
        val responseMap = WritableNativeMap()

        try {
          if (activityResultCode != Activity.RESULT_OK || data == null) {
            throw Exception("UserCancel")
          }

          val csLivenessResult =
            data.getSerializableExtra(parameterName) as CSLivenessResult

          responseMap.putBoolean("real", csLivenessResult.responseMessage.compareTo("real", true) == 0);
          responseMap.putString("responseMessage", csLivenessResult.responseMessage)
          responseMap.putString("sessionId", csLivenessResult.sessionId)
          responseMap.putString("image", csLivenessResult.image)

          Log.d(logTag, "Result: $responseMap")

          if (!responseMap.hasKey("real") || !responseMap.getBoolean("real")) {
            val responseMessage: String? = if (responseMap.hasKey("responseMessage")) responseMap.getString("responseMessage") as? String else null

            throw Exception(responseMessage ?: "UnknownInternalError")
          } else {
            promise?.resolve(responseMap)
          }
        } catch (t: Throwable) {
          Log.e(logTag, t.message ?: "An error occurred")

          promise?.reject("SDKError", t.message ?: "InternalError", t)
        }

        reset()
      }

      super.onActivityResult(activity, activityRequestCode, activityResultCode, data)
    }
  }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  companion object {
    const val NAME = "CSLivenessReactNative"
  }
}
