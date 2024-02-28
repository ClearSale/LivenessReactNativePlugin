import * as React from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App() {
  const [clientId, setClientId] = React.useState<string | undefined>();
  const [clientSecret, setClientSecret] = React.useState<string | undefined>();

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
        value={clientSecret}
        placeholder="Client Secret"
        onChangeText={setClientSecret}
      />

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonTitle}>Open CSLiveness</Text>
      </TouchableOpacity>
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
