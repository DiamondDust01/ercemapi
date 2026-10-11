const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { build } = require('electron-builder');
const { getMakeNsisPath } = require('app-builder-lib/out/toolsets/windows');
const packageJson = require('../package.json');

async function createInstaller() {
  const projectRoot = path.resolve(__dirname, '..');
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'obi-quest-installer-'));
  const appOutput = path.join(temporaryRoot, 'app');
  const stagedApp = path.join(appOutput, 'win-unpacked');
  const installerDirectory = path.join(projectRoot, 'release', 'windows');
  const installerPath = path.join(
    installerDirectory,
    `OBI-Quest-Setup-${packageJson.version}.exe`
  );
  let completed = false;
  let installerBuildStarted = false;

  try {
    await fs.access(path.join(projectRoot, 'dist', 'index.html'));
    await fs.mkdir(installerDirectory, { recursive: true });

    try {
      await fs.access(installerPath);
      throw new Error(`O instalador já existe e não será sobrescrito: ${installerPath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    await build({
      win: ['dir'],
      x64: true,
      publish: 'never',
      projectDir: projectRoot,
      config: {
        directories: {
          output: appOutput
        }
      }
    });

    await fs.access(path.join(stagedApp, 'OBI Quest.exe'));
    const nsis = await getMakeNsisPath(null, null);
    const scriptPath = path.join(projectRoot, 'scripts', 'windows-installer.nsi');
    installerBuildStarted = true;
    const result = spawnSync(nsis.path, [
      '-WX',
      '-INPUTCHARSET',
      'UTF8',
      `-DAPP_DIR=${stagedApp}`,
      `-DOUTPUT_FILE=${installerPath}`,
      `-DPRODUCT_VERSION=${packageJson.version}`,
      scriptPath
    ], {
      env: { ...process.env, ...nsis.env },
      stdio: 'inherit'
    });

    if (result.error) {
      throw new Error(`Falha ao executar o compilador NSIS: ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new Error(`O compilador NSIS terminou com código ${result.status}.`);
    }

    const installer = await fs.stat(installerPath);
    if (!installer.isFile() || installer.size === 0) {
      throw new Error(`O compilador não produziu um instalador válido: ${installerPath}`);
    }

    completed = true;
    console.log(`Instalador NSIS criado: ${installerPath} (${installer.size} bytes).`);
    console.log('O arquivo não foi executado; valide-o em um ambiente de teste autorizado.');
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
    if (installerBuildStarted && !completed) {
      await fs.rm(installerPath, { force: true });
    }
  }
}

createInstaller().catch((error) => {
  console.error('Falha ao criar o instalador Windows:', error);
  process.exitCode = 1;
});
