import * as React from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCSLiveness } from 'react-native-csliveness-react-native';

export default function App() {
  const [clientId, setClientId] = React.useState<string>('');
  const [clientSecretId, setClientSecretId] = React.useState<string>('');
  const [sdkResponse, setSdkResponse] = React.useState<string | null>(null);
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
            const { responseMessage, sessionId, image } =
              await openCsLivenessSdk({
                clientId,
                clientSecretId,
              });

            setSdkResponse(responseMessage);
            console.log(`Received responseMessage: ${responseMessage}`);
            console.log(`Received sessionId: ${sessionId}`);
            console.log(`Received image: ${image}`);
          } catch (e) {
            console.error(e);
            Alert.alert(
              'SDKError',
              'Something went wrong, check you dev console',
              [{ text: 'OK' }]
            );
          }
        }}
      >
        <Text style={styles.buttonTitle}>Open CSLiveness</Text>
      </TouchableOpacity>

      {sdkResponse ? (
        <View>
          <Text>Result: {sdkResponse}</Text>
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
  },
  input: {
    width: '90%',
    borderWidth: 5,
    padding: 10,
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
