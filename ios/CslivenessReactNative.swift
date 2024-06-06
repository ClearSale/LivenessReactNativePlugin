import CSLivenessSDK

extension UIColor {
    convenience init(_ hex: String, alpha: CGFloat = 1.0) {
        var cString = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        
        if cString.hasPrefix("#") { cString.removeFirst() }
        
        if cString.count != 6 {
            self.init("ff0000") // return red color for wrong hex input
            return
        }
        
        var rgbValue: UInt64 = 0
        Scanner(string: cString).scanHexInt64(&rgbValue)
        
        self.init(red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
                  green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
                  blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
                  alpha: alpha)
    }
}

@objc(CSLivenessReactNative)
class CSLivenessReactNative: NSObject {
    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?
    private var sdk: CSLiveness?
    private let logTag: String = "[CSLivenessRN]"
    
    private func reset() -> Void {
        self.resolve = nil
        self.reject = nil
        self.sdk = nil
    }
    
    @objc(openCSLiveness:withResolver:withRejecter:)
    func openCSLiveness(sdkParams: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        if self.resolve != nil || self.reject != nil {
            // Means that we are already running and somehow the button got triggered again.
            // In this case just return.
            
            return
        }
        
        if let clientId = sdkParams["clientId"] as? String, let clientSecretId = sdkParams["clientSecretId"] as? String, let vocalGuidance = sdkParams["vocalGuidance"] as? Bool {
            
            self.resolve = resolve;
            self.reject = reject;
            
            let primaryColor = sdkParams["primaryColor"] != nil ? UIColor(sdkParams["primaryColor"] as! String) : nil;
            let secondaryColor = sdkParams["secondaryColor"] != nil ? UIColor(sdkParams["secondaryColor"] as! String) : nil;
            let titleColor = sdkParams["titleColor"] != nil ? UIColor(sdkParams["titleColor"] as! String) : nil;
            let paragraphColor = sdkParams["paragraphColor"] != nil ? UIColor(sdkParams["paragraphColor"] as! String) : nil;
            
            let identifierId = sdkParams["identifierId"] as? String ?? ""
            let cpf = sdkParams["cpf"] as? String ?? ""
            
            DispatchQueue.main.async {
                let livenessConfiguration = CSLivenessConfig(clientId: clientId, clientSecret: clientSecretId, identifierId: identifierId, cpf: cpf, colors: CSLivenessColorsConfig(primaryColor: primaryColor, secondaryColor: secondaryColor, titleColor: titleColor, paragraphColor: paragraphColor))
                
                if let viewController = UIApplication.shared.keyWindow?.rootViewController {
                    self.sdk = CSLiveness(configuration: livenessConfiguration, vocalGuidance: vocalGuidance)
                    self.sdk?.delegate = self
                    self.sdk?.start(viewController: viewController, animated: true)
                } else {
                    reject( "ViewControllerMissing", "Unable to find view controller",nil);
                    
                    self.reset()
                }
            }
        } else {
            reject( "MissingParameters", "Missing clientId, clientSecretId or both",nil);
            self.reset();
        }
    }
}

extension CSLivenessReactNative: CSLivenessDelegate {
    public func liveness(didOpen: Bool) {
        NSLog("\(logTag) - called didOpen")
    }
    
    public func liveness(success: CSLivenessResult) {
        NSLog("\(logTag) - called didFinishCapture")
        
        let responseMap = NSMutableDictionary();
        responseMap.setValue(success.real, forKey: "real")
        responseMap.setValue(success.sessionId, forKey: "sessionId")
        responseMap.setValue(success.image, forKey: "image")
        
        if let resolve = self.resolve {
            resolve(responseMap)
        }
        
        self.reset();
    }
    
    public func liveness(error: CSLivenessError) {
        NSLog("\(logTag) - called didReceiveError")
        
        if let reject = self.reject {
            reject(error.localizedDescription, error.rawValue, nil)
        }
        
        self.reset()
    }
}

