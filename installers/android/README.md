# OBI Quest para Android

Este é o pacote de teste Android 1.6.0. O arquivo
[`OBI-Quest-1.6.0-android.apk`](OBI-Quest-1.6.0-android.apk) é um APK instalável
(`applicationId` `com.obique.quest`, `versionCode` 10, `versionName` `1.6.0`).
Tamanho: 4.508.171 bytes. SHA-256:
`15576D53AE594213A3C9B098998348F1FBFAD62B40AF0A71104C48A94C840420`.

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
