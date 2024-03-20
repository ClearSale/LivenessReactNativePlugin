package com.cslivenessreactnative

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.clear.studio.csliveness.core.CSLiveness
import com.clear.studio.csliveness.core.CSLivenessResult
import com.clear.studio.csliveness.view.CSLivenessActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap


class CslivenessReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val requestCode: Int = 40
  private var promise: Promise? = null

  override fun getName(): String {
    return NAME
  }

  private fun resetPromise() {
    this.promise = null;
  }

  @ReactMethod
  fun openCSLiveness(sdkParams: ReadableMap, promise: Promise) {
    if (this.promise !== null) {
      // Means that we have a SDK call pending, so nothing to do yet.
      return;
    }

    val clientId: String = if (sdkParams.hasKey("clientId") && sdkParams.getString("clientId") != null) sdkParams.getString("clientId")!! else throw Exception("clientId is required")
    val clientSecretId: String = if (sdkParams.hasKey("clientSecretId") && sdkParams.getString("clientSecretId") != null) sdkParams.getString("clientSecretId")!! else throw Exception("clientSecretId is required")
    val vocalGuidance: Boolean = if (sdkParams.hasKey("vocalGuidance")) sdkParams.getBoolean("vocalGuidance") else false
    val identifierId: String? = if (sdkParams.hasKey("identifierId") && sdkParams.getString("identifierId") != null) sdkParams.getString("identifierId") else null
    val cpf: String? = if (sdkParams.hasKey("cpf") && sdkParams.getString("cpf") != null) sdkParams.getString("cpf") else null

    this.promise = promise

    try {
      val csLiveness = CSLiveness(clientId, clientSecretId, vocalGuidance, identifierId, cpf)

      val intent = Intent(reactApplicationContext, CSLivenessActivity::class.java)
      intent.putExtra(CSLiveness.PARAMETER_NAME, csLiveness)

      reactApplicationContext.startActivityForResult(intent, requestCode, null)
    } catch (t: Throwable) {
      Log.e("[CSLiveness]", "Error starting CSLivenessSDK", t)

      val responseMap = WritableNativeMap()
      responseMap.putString("responseMessage", t.message ?: "InternalError")

      this.promise?.resolve(responseMap)
      this.resetPromise()
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
        val responseMap: WritableMap = WritableNativeMap()

        try {
          if (activityResultCode != Activity.RESULT_OK || data == null) {
            throw Exception("UserCancel")
          }

          val csLivenessResult =
            data.getSerializableExtra(CSLiveness.PARAMETER_NAME) as CSLivenessResult

          responseMap.putBoolean("real", csLivenessResult.responseMessage.compareTo("real", true) == 0);
          responseMap.putString("responseMessage", csLivenessResult.responseMessage)
          responseMap.putString("sessionId", csLivenessResult.sessionId)
          responseMap.putString("image", csLivenessResult.image)

          Log.d("[CSLiveness] Result", responseMap.toString())
          promise?.resolve(responseMap)
        } catch (t: Throwable) {
          Log.e("[CSLiveness] Error", t.message ?: "An error occurred")

          responseMap.putString("responseMessage", t.message ?: "InternalError")
          promise?.resolve(responseMap)
        }

        resetPromise()
      }

      super.onActivityResult(activity, activityRequestCode, activityResultCode, data)
    }
  }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  companion object {
    const val NAME = "CslivenessReactNative"
  }
}
