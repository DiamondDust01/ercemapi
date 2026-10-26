# ERCEMAPI para Android

Atualizado em 26/10/2026.

Este é o pacote de teste Android 1.7.0. O arquivo
[`OBI-Quest-1.7.0-android.apk`](OBI-Quest-1.7.0-android.apk) é um APK instalável
(`applicationId` `com.obique.quest`, `versionCode` 12, `versionName` `1.7.0`).
Tamanho: 4.510.065 bytes. SHA-256:
`73296177D58A659FF3E6E3FB1DA12F7711CD143AED13DE3F63B34F6D9EDBAE4A`.

Desde a 1.7.0, o app aparece no aparelho como **ERCEMAPI**. O arquivo e o
`applicationId` mantêm o nome antigo, para quem já instalou receber a
atualização por cima da versão anterior.

Ao abrir, o app pergunta qual variação usar: OBI Quest ou Pensa Comigo. No
Android, os alunos entram numa sala do Pensa Comigo digitando o código; o QR
aponta para a versão web publicada. O botão de sol e lua alterna entre os
temas claro e escuro.

## Instalação

1. Baixe o APK para o aparelho Android.
2. Abra o arquivo usando o gerenciador de arquivos.
3. Se o sistema solicitar, autorize temporariamente a instalação por essa
   origem e confirme a instalação.

O Android pode avisar que a origem não é conhecida. Instale o arquivo apenas se
você confia na origem do download. Esta versão foi compilada, mas não foi
verificada em um aparelho físico.

## Assinatura e Firebase

O APK usa uma chave de depuração. É adequado para teste, mas não é um pacote de
publicação assinado para a Play Store. Não é possível tratar essa assinatura
como identidade de um publicador oficial.

O APK não inclui configuração privada de Firebase. Sem a configuração do
ambiente de distribuição e regras Firestore apropriadas, exercícios locais
continuam acessíveis, mas salas multiplayer entre dispositivos podem não estar
disponíveis.

## Como reproduzir o APK

Requer Android SDK e um JDK compatível com o Gradle do projeto:

```bash
npm install
npm run android:apk
```

O APK de depuração gerado fica em
`android/app/build/outputs/apk/debug/app-debug.apk`. O histórico está em
[`../../CHANGELOG.md`](../../CHANGELOG.md); o fluxo de compilação está no
[README principal](../../README.md).
