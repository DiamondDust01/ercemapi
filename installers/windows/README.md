# OBI Quest para Windows

Esta branch contém o pacote portátil x64 do OBI Quest 1.4.2:
[`OBI-Quest-1.4.2-Windows-x64.7z`](OBI-Quest-1.4.2-Windows-x64.7z). O arquivo
tem 98.825.858 bytes (94,25 MiB), contém o aplicativo Electron completo e foi
verificado com 7-Zip. O GitHub aceitou o arquivo e informou que ele ultrapassa a
recomendação de 50 MB. Para downloads futuros, considere uma GitHub Release ou
Git LFS se os pacotes crescerem.

SHA-256: `CCC34BF8105DA7A7D9C79AF38A0F3908A77FA29BDC9F4A3531B5A219161D2DAC`.

## Instalação portátil

1. Baixe e extraia o `.7z` com 7-Zip ou NanaZip.
2. Abra `OBI Quest.exe` dentro da pasta extraída.
3. Mantenha junto do executável a pasta `resources` e todos os demais arquivos
   incluídos. Não copie apenas o `.exe`.

Este arquivo é uma distribuição portátil, **não é um assistente Setup.exe**.
Nem o executável nem o pacote têm assinatura digital verificada. O Windows pode
mostrar avisos e políticas de Controle de Aplicativos podem bloquear a execução;
não desative proteções do sistema para contornar esses bloqueios.

## Gerar um assistente NSIS

O projeto oferece o comando abaixo, que deve ser executado em um ambiente que
permita ao empacotador iniciar seus auxiliares:

```bash
npm install
npm run app:windows:installer
```

O resultado esperado é
`release/windows/OBI-Quest-Setup-1.4.2.exe`. Ele permite selecionar uma pasta de
instalação e cria atalhos. Este assistente não foi publicado junto do pacote:
neste ambiente, a política de Controle de Aplicativos bloqueou um auxiliar sem
assinatura antes de o NSIS concluir a compilação. O comando e a configuração
estão prontos para uso em um ambiente compatível; não se deve afirmar que um
Setup.exe está disponível para download.

Para mais detalhes, consulte o
[README principal](../../README.md) e o [`CHANGELOG.md`](../../CHANGELOG.md).
