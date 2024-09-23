import { NativeModules, Platform } from 'react-native';
import SimpleSchema from 'simpl-schema';

const LINKING_ERROR =
  `The package 'csliveness-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const CslivenessReactNative = NativeModules.CSLivenessReactNative
  ? NativeModules.CSLivenessReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const CSLivenessSchema = new SimpleSchema({
  transactionId: {
    type: String,
    optional: true,
    custom() {
      if (
        !this.value &&
        (!this.field('clientId').value || !this.field('clientSecretId').value)
      ) {
        return SimpleSchema.ErrorTypes.REQUIRED;
      }
      return undefined;
    },
  },
  accessToken: {
    type: String,
    optional: true,
    custom() {
      if (
        !this.value &&
        (!this.field('clientId').value || !this.field('clientSecretId').value)
      ) {
        return SimpleSchema.ErrorTypes.REQUIRED;
      }
      return undefined;
    },
  },
  clientId: {
    type: String,
    optional: true,
    custom() {
      if (
        !this.value &&
        (!this.field('transactionId').value || !this.field('accessToken').value)
      ) {
        return SimpleSchema.ErrorTypes.REQUIRED;
      }
      return undefined;
    },
  },
  clientSecretId: {
    type: String,
    optional: true,
    custom() {
      if (
        !this.value &&
        (!this.field('transactionId').value || !this.field('accessToken').value)
      ) {
        return SimpleSchema.ErrorTypes.REQUIRED;
      }
      return undefined;
    },
  },
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
  primaryColor: {
    type: String,
    defaultValue: null,
    optional: true,
  },
  secondaryColor: {
    type: String,
    defaultValue: null,
    optional: true,
  },
  titleColor: {
    type: String,
    defaultValue: null,
    optional: true,
  },
  paragraphColor: {
    type: String,
    defaultValue: null,
    optional: true,
  },
});

type CSLivenessConfiguration = {
  transactionId?: string | null;
  accessToken?: string | null;
  clientId?: string | null;
  clientSecretId?: string | null;
  identifierId?: string | null;
  cpf?: string | null;
  vocalGuidance?: boolean;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  titleColor?: string | null;
  paragraphColor?: string | null;
};

export type CSLivenessResult = {
  real?: boolean;
  responseMessage: string;
  sessionId: string | null;
  image: string | null;
};

export const useCSLiveness = () => {
  return {
    open: async (
      csLivenessConfiguration: CSLivenessConfiguration
    ): Promise<CSLivenessResult> => {
      const cleanedDoc = CSLivenessSchema.clean(csLivenessConfiguration, {
        getAutoValues: true,
        trimStrings: true,
      });

      CSLivenessSchema.validate(cleanedDoc);

      return CslivenessReactNative.openCSLiveness(cleanedDoc);
    },
  };
};
