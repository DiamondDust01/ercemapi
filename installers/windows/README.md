# ERCEMAPI para Windows

Atualizado em 26/10/2026. Desde a 1.7.0, a janela do app mostra o nome **ERCEMAPI**.
O executável `OBI Quest.exe`, o atalho do Menu Iniciar e os nomes dos arquivos
mantêm o nome antigo, para as instalações existentes receberem as atualizações.

Esta branch contém o pacote portátil x64 do OBI Quest 1.7.0:
[`OBI-Quest-1.7.0-Windows-x64.7z`](OBI-Quest-1.7.0-Windows-x64.7z). O arquivo
tem 99.932.220 bytes (95,30 MiB), contém o aplicativo Electron completo e foi
verificado com 7-Zip. Ele ultrapassa a recomendação de 50 MB do GitHub e está
perto do limite de 100 MiB por arquivo; se os pacotes crescerem, use uma GitHub
Release ou Git LFS.

SHA-256: `7673103EE42018A34140A9F895A7B375B128E12D8E798CEEA1F159B7B17B13C7`.

Ao abrir, o app pergunta qual variação usar: OBI Quest ou Pensa Comigo. No app
para Windows, os alunos entram numa sala do Pensa Comigo digitando o código; o
QR aponta para a versão web publicada. O botão de sol e lua alterna entre os
temas claro e escuro.

O pacote portátil 1.7.0 foi aberto num teste automatizado nesta máquina: a
tela de escolha apareceu, o Pensa Comigo criou uma sala de demonstração e a
troca para o OBI Quest funcionou. O tema escolhido continuou salvo ao fechar e
abrir o app.

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
`release/windows/OBI-Quest-Setup-1.7.0.exe`. Ele permite selecionar uma pasta de
instalação, cria atalhos no menu Iniciar e na área de trabalho, e grava um
desinstalador no diretório escolhido. Se um instalador com esse nome já existir,
o script interrompe a operação em vez de sobrescrevê-lo. O build não executa o
Setup produzido; teste-o em uma máquina ou ambiente autorizado antes de
distribuí-lo.

O instalador não tem assinatura digital. A compilação ou execução ainda pode ser
bloqueada pela política de Controle de Aplicativos do Windows. Não desative
proteções do sistema nem tente contornar esses bloqueios; use um ambiente de
build aprovado pela organização.

O Setup 1.7.0 tem 110.149.997 bytes. SHA-256:
`ABBE1091370EDB3AB873158798C6A9D01F68940D9A2CC70FCCCF1ED77D8F3A79`.
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
[Setup OBI Quest 1.7.0 para Windows x64](https://github.com/DiamondDust01/obi-quest/raw/refs/heads/app-pc/installers/windows/OBI-Quest-Setup-1.7.0.exe)
diretamente. A versão portátil continua disponível no arquivo `.7z` acima.

Para mais detalhes, consulte o
[README principal](../../README.md) e o [`CHANGELOG.md`](../../CHANGELOG.md).
