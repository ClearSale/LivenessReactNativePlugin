import React, { useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { CSLivenessResult } from 'csliveness-react-native';
import { useCSLiveness } from 'csliveness-react-native';
import CheckBox from '@react-native-community/checkbox';
import { ColorButton } from './ColorButton';

export default function App() {
  const [clientId, setClientId] = useState<string>('');
  const [clientSecretId, setClientSecretId] = useState<string>('');
  const [identifierId, setIdentifierId] = useState<string | null>(null);
  const [cpf, setCpf] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#FF4800FF');
  const [secondaryColor, setSecondaryColor] = useState<string>('#FF4800FF');
  const [titleColor, setTitleColor] = useState<string>('#283785FF');
  const [paragraphColor, setParagraphColor] = useState<string>('#353840FF');
  const [vocalGuidance, setVocalGuidance] = useState<boolean>(false);
  const [sdkResponse, setSdkResponse] = React.useState<CSLivenessResult | null>(
    null
  );
  const { open: openCsLivenessSdk } = useCSLiveness();

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.scrollViewContentStyle}
      >
        <Text style={styles.title}>CSLiveness React Native</Text>
        <TextInput
          style={styles.input}
          value={clientId}
          placeholder="ClientID *"
          onChangeText={setClientId}
        />
        <TextInput
          style={styles.input}
          value={clientSecretId}
          placeholder="Client Secret *"
          onChangeText={setClientSecretId}
        />
        <TextInput
          style={styles.input}
          value={identifierId || ''}
          placeholder="Identifier ID"
          onChangeText={setIdentifierId}
        />
        <TextInput
          style={styles.input}
          value={cpf || ''}
          placeholder="CPF"
          onChangeText={setCpf}
        />

        <View style={styles.checkboxAndButtonContainer}>
          <ColorButton
            color={primaryColor}
            setColor={setPrimaryColor}
            buttonTitleStyle={styles.buttonTitle}
            label="Primary Color"
          />
          <ColorButton
            color={secondaryColor}
            setColor={setSecondaryColor}
            buttonTitleStyle={styles.buttonTitle}
            label="Secondary Color"
          />
          <ColorButton
            color={titleColor}
            setColor={setTitleColor}
            buttonTitleStyle={styles.buttonTitle}
            label="Title Color"
          />
          <ColorButton
            color={paragraphColor}
            setColor={setParagraphColor}
            buttonTitleStyle={styles.buttonTitle}
            label="Paragraph Color"
          />

          <View style={styles.checkboxContainer}>
            <CheckBox
              disabled={false}
              value={vocalGuidance}
              onValueChange={setVocalGuidance}
            />
            <Text>Vocal Guidance</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            try {
              const response = await openCsLivenessSdk({
                clientId,
                clientSecretId,
                identifierId,
                cpf,
                vocalGuidance,
                primaryColor,
                secondaryColor,
                titleColor,
                paragraphColor,
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
            } catch (e: any) {
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
      </Animated.ScrollView>
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
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollViewStyle: { width: '100%' },
  scrollViewContentStyle: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  input: {
    width: '90%',
    borderWidth: 5,
    padding: 10,
    backgroundColor: 'grey',
  },
  checkboxAndButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
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
