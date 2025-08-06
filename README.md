# SDK ClearSale Liveness React-Native

Os SDKs de Liveness permitem a realização de provas de vida.

## Requisitos

### Android
- Versão mínima do SDK android: `21` (`v5`)
- Versão `compileSDK` android: `35`
- Versão `kotlin` mínima: `2.0.0`

### iOS
- Versão mínima do iOS: `15.0`
- Adicionar permissão de câmera (`NSCameraUsageDescription`) e acesso a pasta de documentos (`NSDocumentsFolderUsageDescription`) no seu `Info.plist`
- Cocoapods
- Versão mínima do `Swift`:  `5.0`

### React-Native
- Usar a arquitetura antiga ou usar o modo de `interop` na nova arquitetura.

## Instalação

Para começar a usar o SDK, você precisa instalá-lo em seu projeto. Supondo que você já tenha um projeto React-Native, você pode instalar o SDK usando `npm install`:

Primeiro, adicione o plugin ao seu `package.json`:

```shell
npm install csliveness-react-native
```

Ou usando `yarn`:

```shell
yarn add @clear.sale/react-native-csdocumentoscopysdk
```

Então, adicione nosso repositório na sua lista de repositórios (no seu arquivo `build.gradle.kts` ou `build.gradle`) no seu projeto `android` nativo:

```kotlin
allprojects {
    repositories {
        ...
        maven {
          url = uri("https://pkgs.dev.azure.com/CS-PublicPackages/SDKS/_packaging/SDKS/maven/v1")
        }
    }
}
```

Para `iOS`, adicione o `SDK` como sua dependência no `Podfile`:

```ruby
  pod 'CSLivenessSDK', :git => 'https://CS-Packages:<TOKEN AQUI>@dev.azure.com/CS-Package/ID-Lab-PackagesSDK/_git/CSLivenessSDK', :tag => '4.0.1'
```


## Instruções de uso
Importe o plugin no seu projeto e use o `useCSLiveness` hook para receber uma função `open` que irá chamar a SDK nativa do dispositivo.

O resultado da função `open` é uma promise que pode retornar os seguintes valores:
```typescript
type CSLivenessResult = {
  real: boolean;
  responseMessage?: string; // Android only
  sessionId: string | null;
  image: string | null;
};
```

### Atenção
A propriedade `responseMessage` é retornada somente no `Android`.

Em caso de erro, a `promise` sera rejeitada com o motivo do erro em ambas as plataformas.

## Exemplo de uso
```js
import { useCSLiveness } from 'csliveness-react-native';

const ReactComponent = () => {
  const [accessToken, setAccessToken] = React.useState<string>('');
  const [transactionId, setTransactionId] = React.useState<string>('');
  const { open: openCsLivenessSdk } = useCSLiveness();

  ...


  return <TouchableOpacity
    style={styles.button}
    onPress={async () => {
      try {
        const { real, responseMessage, sessionId, image } = await openCsLivenessSdk({
          transactionId,
          accessToken,
          vocalGuidance,
          primaryColor,
          secondaryColor,
          titleColor,
          paragraphColor,
          environment: Environments.HML
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

### Como obter o accessToken e transactionId?
- `accessToken`: Faça a autenticação seguindo as instruções da [API DataTrust](https://devs.plataformadatatrust.clearsale.com.br/reference/post_v1-authentication) e obtenha o `token` do retorno.
- `transactionId`: Crie uma transação seguindo as instruções da [API DataTrust](https://devs.plataformadatatrust.clearsale.com.br/reference/post_v1-transaction) e obtenha o `id` do retorno.


## Ambiente

Ao iniciar o SDK, você pode informar o ambiente desejado. Todas as requisições serão feitas para este ambiente,
portanto, o método de login fornecido deve apontar para o mesmo.

- **HML**: Ambiente de homologação. Todas as requisições do SDK serão feitas para o ambiente de homologação.
- **PRD**: Ambiente de produção. Todas as requisições do SDK serão feitas para o ambiente de produção.

## Executando o aplicativo de exemplo

1. Conecte um dispositivo físico (`Android` ou `iOS` - o nosso `SDK` não roda em emuladores, apenas em dispositivos fisícos) à sua máquina de desenvolvimento.
2. Clone esse repositório e rode `yarn`. Como esse projeto usa `yarn workspaces`, deve-se usar o comando `yarn` para instalar as dependências.
3. Coloque suas credenciais no arquivo `clearsale.gradle.env` (crie ele e adicione as informações conforme descrito na etapa de instalação) na raiz do projeto de exemplo e adicione também as credenciais no arquivo `example/ios/Podfile`.
4. Rode `yarn example start` (no caso do `iOS` é necessário rodar `pod install` na pasta `example/ios` primeiro).
  - Caso queira rodar com o Android Studio o app de Android, é só abrir a pasta `example/android` no Android Studio.
  - Caso queira rodar com o XCode o app de iOS, é só abrir o `CslivenessReactNativeExample.xcworkspace/` com o XCode.
5. Ao pressionar o botão `Open CSLiveness` o SDK Liveness iniciará. Após completar o fluxo o aplicativo retornara o `responseMessage`, `image` e `sessionId`.

## Licença

Copyright © 2025 ClearSale

Todos os direitos são reservados, sendo concedida a permissão para usar o software da maneira como está, não sendo permitido qualquer modificação ou cópia para qualquer fim. O Software é licenciado com suas atuais configurações “tal como está” e sem garantia de qualquer espécie, nem expressa e nem implícita, incluindo mas não se limitando, garantias de comercialização, adequação para fins particulares e não violação de direitos patenteados. Em nenhuma hipótese os titulares dos Direitos Autorais podem ser responsabilizados por danos, perdas, causas de ação, quer seja por contrato ou ato ilícito, ou outra ação tortuosa advinda do uso do Software ou outras ações relacionadas com este Software sem prévia autorização escrita do detentor dos direitos autorais.

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
