# OBI Quest para Windows

- `OBI-Quest-1.4.2-Windows-x64.7z` contem a versao portatil 1.4.2 para
  Windows x64.
- Extraia o arquivo com 7-Zip ou NanaZip e abra `OBI Quest.exe` na pasta extraida.
- Este pacote nao e um assistente Setup.exe e o aplicativo nao esta assinado
  digitalmente; politicas de Controle de Aplicativos do Windows podem bloquea-lo.
- O comando `npm run app:windows:installer` gera o assistente NSIS em
  `release/windows/OBI-Quest-Setup-1.4.2.exe` em ambientes que permitam executar
  os auxiliares gerados durante a compilacao. O assistente tambem nao esta
  assinado digitalmente.
