# OBI Quest para Windows

Esta branch contém o pacote portátil x64 do OBI Quest 1.5.0:
[`OBI-Quest-1.5.0-Windows-x64.7z`](OBI-Quest-1.5.0-Windows-x64.7z). O arquivo
tem 99.926.521 bytes (95,30 MiB), contém o aplicativo Electron completo e foi
verificado com 7-Zip. Ele ultrapassa a recomendação de 50 MB do GitHub e está
perto do limite de 100 MiB por arquivo; se os pacotes crescerem, use uma GitHub
Release ou Git LFS.

SHA-256: `65DD689B941FA8BE2E14BCAD25CC71FC7F474F642677493C2510B65A59CB62FD`.

Ao abrir, o app pergunta qual variação usar: OBI Quest ou Pensa Comigo. No app
para Windows, os alunos entram numa sala do Pensa Comigo digitando o código; o
QR aponta para a versão web publicada.

O pacote portátil 1.5.0 foi aberto num teste automatizado nesta máquina: a
tela de escolha apareceu, o Pensa Comigo criou uma sala de demonstração e a
troca para o OBI Quest funcionou.

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

O comando prepara o aplicativo Electron e compila o Setup diretamente com o
NSIS, sem executar um instalador auxiliar temporário:

```bash
npm install
npm run app:windows:installer
```

O resultado esperado é
`release/windows/OBI-Quest-Setup-1.5.0.exe`. Ele permite selecionar uma pasta de
instalação, cria atalhos no menu Iniciar e na área de trabalho, e grava um
desinstalador no diretório escolhido. Se um instalador com esse nome já existir,
o script interrompe a operação em vez de sobrescrevê-lo. O build não executa o
Setup produzido; teste-o em uma máquina ou ambiente autorizado antes de
distribuí-lo.

O instalador não tem assinatura digital. A compilação ou execução ainda pode ser
bloqueada pela política de Controle de Aplicativos do Windows. Não desative
proteções do sistema nem tente contornar esses bloqueios; use um ambiente de
build aprovado pela organização.

O Setup 1.5.0 tem 110.148.689 bytes. SHA-256:
`D1A9129D5DA675C42852F263CBC2E5D3C8357CB016CEA7D008C766B66F0924CC`.
Ele foi compilado, mas **não foi executado** nesta rodada: instale-o primeiro
numa máquina ou pasta de teste. O Setup 1.4.2 anterior foi instalado, aberto e
desinstalado com sucesso num teste isolado. O arquivo não é assinado.

O instalador tem aproximadamente 110 MB. O ZIP testado não reduziu o tamanho,
pois o conteúdo do instalador já usa compressão LZMA. Para disponibilizá-lo no
GitHub sem dividir nem alterar o executável, o arquivo é armazenado nesta branch
com Git LFS. Instale Git LFS antes de clonar/atualizar e baixe os objetos:

```bash
git lfs install
git lfs pull
```

Também é possível baixar o
[Setup OBI Quest 1.5.0 para Windows x64](https://github.com/DiamondDust01/obi-quest/raw/refs/heads/app-pc/installers/windows/OBI-Quest-Setup-1.5.0.exe)
diretamente. A versão portátil continua disponível no arquivo `.7z` acima.

Para mais detalhes, consulte o
[README principal](../../README.md) e o [`CHANGELOG.md`](../../CHANGELOG.md).
