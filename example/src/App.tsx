import * as React from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { CSLivenessResult } from 'csliveness-react-native';
import { useCSLiveness } from 'csliveness-react-native';

export default function App() {
  const [clientId, setClientId] = React.useState<string>('');
  const [clientSecretId, setClientSecretId] = React.useState<string>('');
  const [sdkResponse, setSdkResponse] = React.useState<CSLivenessResult | null>(
    null
  );
  const { open: openCsLivenessSdk } = useCSLiveness();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={clientId}
        placeholder="ClientID"
        onChangeText={setClientId}
      />
      <TextInput
        style={styles.input}
        value={clientSecretId}
        placeholder="Client Secret"
        onChangeText={setClientSecretId}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          try {
            const response = await openCsLivenessSdk({
              clientId,
              clientSecretId,
            });

            setSdkResponse({
              ...response,
              image: response.image && `${response.image.slice(0, 20)}...`,
            });
            console.log(
              `Received responseMessage: ${response.responseMessage}`
            );
            console.log(`Received real: ${response.real}`);
            console.log(`Received sessionId: ${response.sessionId}`);
            console.log(`Received image: ${response.image}`);
          } catch (e) {
            console.error(e);
            Alert.alert(
              'SDKError',
              'Something went wrong, check you dev console',
              [{ text: 'OK' }]
            );

            setSdkResponse(e.toString());
          }
        }}
      >
        <Text style={styles.buttonTitle}>Open CSLiveness</Text>
      </TouchableOpacity>

      {sdkResponse ? (
        <View>
          <Text>Result: {JSON.stringify(sdkResponse, undefined, 2)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: 'white',
  },
  input: {
    width: '90%',
    borderWidth: 5,
    padding: 10,
    backgroundColor: 'grey',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
    width: '90%',
  },
  buttonTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});
