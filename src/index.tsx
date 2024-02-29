import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import SimpleSchema from 'simpl-schema';

const LINKING_ERROR =
  `The package 'react-native-csliveness-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const CslivenessReactNative = NativeModules.CslivenessReactNative
  ? NativeModules.CslivenessReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const CSLivenessSchema = new SimpleSchema({
  clientId: String,
  clientSecretId: String,
  vocalGuidance: {
    type: Boolean,
    optional: true,
    defaultValue: false,
  },
  identifierId: {
    type: String,
    defaultValue: null,
    optional: true,
  },
  cpf: {
    type: String,
    defaultValue: null,
    optional: true,
  },
});

type CSLivenessConfiguration = {
  clientId: string;
  clientSecretId: string;
  vocalGuidance?: boolean;
  identifierId?: string | null;
  cpf?: string | null;
};

type CSLivenessResult = {
  responseMessage: string;
  sessionId: string | null;
  image: string | null;
};

const isAndroid = Platform.OS === 'android';
const maybeRequireAndroidCameraPermissions = async (
  androidNeverAskPermissionAgainCallback?: () => {}
): Promise<void> => {
  if (!isAndroid) {
    return;
  }

  if (
    !(await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA!))
  ) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA!
    );

    if (granted === PermissionsAndroid.RESULTS.DENIED) {
      throw new Error('PermissionNotGrantedError');
    }

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      if (androidNeverAskPermissionAgainCallback) {
        androidNeverAskPermissionAgainCallback();
      }
    }
  }
};

export const useCSLiveness = () => {
  return {
    open: async (
      csLivenessConfiguration: CSLivenessConfiguration,
      androidNeverAskPermissionAgainCallback?: () => {}
    ): Promise<CSLivenessResult> => {
      const cleanedDoc = CSLivenessSchema.clean(csLivenessConfiguration, {
        getAutoValues: true,
        trimStrings: true,
      });

      CSLivenessSchema.validate(cleanedDoc);

      await maybeRequireAndroidCameraPermissions(
        androidNeverAskPermissionAgainCallback
      );

      return CslivenessReactNative.openCSLiveness(cleanedDoc);
    },
  };
};
