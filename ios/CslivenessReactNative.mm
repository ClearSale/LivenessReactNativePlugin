#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CSLivenessReactNative, NSObject)

RCT_EXTERN_METHOD(openCSLiveness:(NSDictionary *)sdkParams withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)


+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
