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

        let accessToken = sdkParams["accessToken"] as? String
        let transactionId = sdkParams["transactionId"] as? String

        let vocalGuidance = sdkParams["vocalGuidance"] as? Bool ?? false

        // Colors configuration
        let primaryColor = sdkParams["primaryColor"] != nil ? UIColor(sdkParams["primaryColor"] as! String) : nil;
        let secondaryColor = sdkParams["secondaryColor"] != nil ? UIColor(sdkParams["secondaryColor"] as! String) : nil;
        let titleColor = sdkParams["titleColor"] != nil ? UIColor(sdkParams["titleColor"] as! String) : nil;
        let paragraphColor = sdkParams["paragraphColor"] != nil ? UIColor(sdkParams["paragraphColor"] as! String) : nil;

        let colorsConfiguration = CSLivenessColorsConfig(primaryColor: primaryColor, secondaryColor: secondaryColor, titleColor: titleColor, paragraphColor: paragraphColor)

        // Set up promise handlers
        self.resolve = resolve;
        self.reject = reject;

        if accessToken != nil && transactionId != nil {
            self.sdk = CSLiveness(configuration: CSLivenessConfig(accessToken: accessToken!, transactionId: transactionId!, colors: colorsConfiguration), vocalGuidance: vocalGuidance)
        } else {
            reject("NoConstructorFound", "Unable to find viable constructor for SDK", nil);

            self.reset()
            return
        }

        DispatchQueue.main.async {
            if let viewController = UIApplication.shared.keyWindow?.rootViewController {
                self.sdk?.delegate = self
                self.sdk?.start(viewController: viewController, animated: true)
            } else {
                reject( "ViewControllerMissing", "Unable to find view controller",nil);

                self.reset()
            }
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

