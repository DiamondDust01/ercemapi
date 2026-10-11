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

O comando prepara o aplicativo Electron e compila o Setup diretamente com o
NSIS, sem executar um instalador auxiliar temporário:

```bash
npm install
npm run app:windows:installer
```

O resultado esperado é
`release/windows/OBI-Quest-Setup-1.4.2.exe`. Ele permite selecionar uma pasta de
instalação, cria atalhos no menu Iniciar e na área de trabalho, e grava um
desinstalador no diretório escolhido. Se um instalador com esse nome já existir,
o script interrompe a operação em vez de sobrescrevê-lo. O build não executa o
Setup produzido; teste-o em uma máquina ou ambiente autorizado antes de
distribuí-lo.

O instalador não tem assinatura digital. A compilação ou execução ainda pode ser
bloqueada pela política de Controle de Aplicativos do Windows. Não desative
proteções do sistema nem tente contornar esses bloqueios; use um ambiente de
build aprovado pela organização. A compilação local concluída nesta rodada gerou
um arquivo de aproximadamente 110 MB, acima do limite de 100 MiB por arquivo no
GitHub, por isso o Setup não foi adicionado à branch. O instalador também não
foi executado neste ambiente; valide-o em uma máquina de teste autorizada e
publique-o como ativo de Release ou em outro armazenamento apropriado.

Para mais detalhes, consulte o
[README principal](../../README.md) e o [`CHANGELOG.md`](../../CHANGELOG.md).
