# csliveness-react-native

CSLiveness para React Native

## Instalação

```sh
npm install csliveness-react-native
```

#### Android
Adicione um arquivo `clearsale.gradle.env` na raiz do seu projeto de react-native.
Esse arquivo deve conter as seguintes propriedades:

```
CS_LIVENESS_TEC_ARTIFACTS_FEED_URL= // fornecido pela clearsale
CS_LIVENESS_TEC_ARTIFACTS_FEED_NAME= // fornecido pela clearsale
CS_LIVENESS_TEC_USER= // fornecido pela clearsale
CS_LIVENESS_TEC_PASS= // fornecido pela clearsale
CS_LIVENESS_VERSION= // fornecido pela clearsale
```

#### iOS
No arquivo `Podfile` de seu projeto adicione o seguinte código:

```
platform :ios, '15.0'

use_frameworks!

target 'NOME_DO_SEU_PROJETO' do
  pod 'CSLivenessSDK', :git => 'URL DO REPOSITÓRIO ENVIADO PELA CLEARSALE', :tag => 'VERSÃO AQUI'
end
```

## Instruções de uso
Importe o plugin no seu projeto e use o `useCSLiveness` hook para receber uma função `open` que irá chamar a SDK nativa do dispositivo.

O resultado da função `open` é uma promise que pode retornar os seguintes valores:
```typescript
type CSLivenessResult = {
  real?: boolean;
  responseMessage?: string;
  sessionId: string | null;
  image: string | null;
};
```

### Atenção
Em caso de erro, ele será retornado através do parâmetro `responseMessage`, então sempre cheque esse valor.
Isso acontece para manter a API do `JavaScript` consistente entre para as duas plataformas (`Android` e `iOS`).

Além disso, somente para `iOS`, a propriedade `real` é retornado do resultado.

A promise será rejeitada somente em casos extremos, como falha ao abrir o SDK por exemplo.

## Exemplo de uso
```js
import { useCSLiveness } from 'csliveness-react-native';

const reactComponent = () => {
  const [clientId, setClientId] = React.useState<string>('');
  const [clientSecretId, setClientSecretId] = React.useState<string>('');
  const { open: openCsLivenessSdk } = useCSLiveness();

  ...


  return <TouchableOpacity
    style={styles.button}
    onPress={async () => {
      try {
        const { responseMessage, sessionId, image } =
          await openCsLivenessSdk({
            clientId,
            clientSecretId,
          });

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
}
```

## Executando o aplicativo de exemplo

1. Conecte um dispositivo físico (`Android` ou `iOS` - o nosso `SDK` não roda em emuladores, apenas em dispositivos fisícos) à sua máquina de desenvolvimento.
2. Clone esse repositório e rode `yarn`. Como esse projeto usa `yarn workspaces`, deve-se usar o comando `yarn` para instalar as dependências.
3. Coloque suas credenciais no arquivo `clearsale.gradle.env` (crie ele e adicione as informações conforme descrito na etapa de instalação) na raiz do projeto de exemplo e adicione também as credenciais no arquivo `example/ios/Podfile`.
4. Rode `yarn example android|ios` (no caso do `iOS` é necessário rodar `pod install` na pasta `example/ios` primeiro).
  - Caso queira rodar com o Android Studio o app de Android, é só abrir a pasta `example/android` no Android Studio.
  - Caso queira rodar com o XCode o app de iOS, é só abrir o `CslivenessReactNativeExample.xcworkspace/` com o XCode.
5. Ao pressionar o botão `Open CSLiveness` o SDK Liveness iniciará. Após completar o fluxo o aplicativo retornara o `responseMessage`, `image` e `sessionId`.

## Detalhes de privacidade

**Uso de dados**

Todas as informações coletadas pelo SDK da ClearSale são com exclusiva finalidade de prevenção à fraude e proteção ao próprio usuário, aderente à política de segurança e privacidade das plataformas Google e Apple e à LGPD. Por isso, estas informações devem constar na política de privacidade do aplicativo.

**Tipo de dados coletados**

O SDK da ClearSale coleta as seguintes informações do dispositivo :

Características físicas do dispositivo/ hardware (Como tela, modelo, nome do dispositivo);
Características de software (Como versão, idioma, build, controle parental);
Informações da câmera;
Licença de Uso
Ao realizar o download e utilizar nosso SDK você estará concordando com a seguinte licença:

**Copyright © 2022 ClearSale**

Todos os direitos são reservados, sendo concedida a permissão para usar o software da maneira como está, não sendo permitido qualquer modificação ou cópia para qualquer fim. O Software é licenciado com suas atuais configurações “tal como está” e sem garantia de qualquer espécie, nem expressa e nem implícita, incluindo mas não se limitando, garantias de comercialização, adequação para fins particulares e não violação de direitos patenteados. Em nenhuma hipótese os titulares dos Direitos Autorais podem ser responsabilizados por danos, perdas, causas de ação, quer seja por contrato ou ato ilícito, ou outra ação tortuosa advinda do uso do Software ou outras ações relacionadas com este Software sem prévia autorização escrita do detentor dos direitos autorais.

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
