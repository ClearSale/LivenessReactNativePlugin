import CSLivenessSDK

@objc(CslivenessReactNative)
class CslivenessReactNative: NSObject {
    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?
    private var livenessSdk: CSLiveness?
    private let LOG_TAG: String = "[CSLivenessRN]"
        
    private func reset() -> Void {
        self.resolve = nil
        self.reject = nil
        self.livenessSdk = nil
    }

    @objc(openCSLiveness:withResolver:withRejecter:)
    func openCSLiveness(sdkParams: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        if let livenessSdk = self.livenessSdk, let resolver = self.resolve, let reject = self.reject {
            // Means that we are already running and somehow the button got triggered again.
            // In this case just return.
            
            return
        }
        
        if let clientId = sdkParams["clientId"] as? String, let clientSecretId = sdkParams["clientSecretId"] as? String {
            let identifierId = sdkParams["identifierId"] as? String ?? nil
            let cpf = sdkParams["cpf"] as? String ?? nil
            let vocalGuidance = sdkParams["vocalGuidance"] as? Bool ?? false
            
            self.resolve = resolve
            self.reject = reject

            DispatchQueue.main.async {
                let livenessSdkConfiguration = CSLivenessConfigurations(clientId: clientId, clientSecret: clientSecretId, identifierId: identifierId, cpf: cpf)

                if let viewController = UIApplication.shared.keyWindow?.rootViewController {
                    self.livenessSdk = CSLiveness(configurations: livenessSdkConfiguration, vocalGuidance: vocalGuidance)
                    self.livenessSdk?.delegate = self
                    self.livenessSdk?.start(viewController: viewController, animated: true)
                } else {
                    reject("ViewControllerMissing", "Unable to find view controller", nil)
                }
            }
        } else {
           reject("MissingParameters", "Missing clientId or clientSecretId or both", nil)
        }
    }
}

extension CslivenessReactNative: CSLivenessDelegate {
    func liveness(didOpen: Bool) {
        NSLog("\(LOG_TAG) - called didOpen")
    }
    
    func liveness(success: CSLivenessResult) {
        NSLog("\(LOG_TAG) - called didFinishCapture")

        let responseMap = NSMutableDictionary();
        responseMap.setValue(success.real, forKey: "real")
        responseMap.setValue(success.sessionId, forKey: "sessionId")
        responseMap.setValue(success.image, forKey: "image")
        
        if let promiseResolve = self.resolve {
            promiseResolve(responseMap)
        } else if let promiseReject = self.reject {
            promiseReject("InternalError", "Missing promise rejector", nil)
        }

        self.reset()
    }
    
    func liveness(error: CSLivenessError) {
        NSLog("\(LOG_TAG) - called livenessError")
        NSLog("\(LOG_TAG) - \(error.localizedDescription) -> \(error.rawValue)")

        let responseMap = NSMutableDictionary();
        responseMap.setValue("\(error.localizedDescription) -> \(error.rawValue)", forKey: "responseMessage")
        
        if let promiseResolve = self.resolve {
            promiseResolve(responseMap)
        }

        self.reset()
    }
}

