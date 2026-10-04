const fs = require('node:fs/promises');
const path = require('node:path');
const { createPackage } = require('@electron/asar');

async function packageWindows() {
  const projectRoot = path.resolve(__dirname, '..');
  const outputRoot = process.env.LOCALAPPDATA || path.join(projectRoot, 'release');
  const portableDirectory = path.join(outputRoot, 'OBI-Quest', 'portable');
  const stagingDirectory = path.join(outputRoot, 'OBI-Quest', '.app-staging');
  const electronDistribution = path.join(projectRoot, 'node_modules', 'electron', 'dist');
  const appArchive = path.join(portableDirectory, 'resources', 'app.asar');
  const electronExecutable = path.join(portableDirectory, 'electron.exe');
  const namedExecutable = path.join(portableDirectory, 'OBI Quest.exe');

  await fs.rm(portableDirectory, { recursive: true, force: true });
  await fs.rm(stagingDirectory, { recursive: true, force: true });
  await fs.mkdir(portableDirectory, { recursive: true });
  await fs.cp(electronDistribution, portableDirectory, { recursive: true });

  await fs.mkdir(path.join(stagingDirectory, 'dist'), { recursive: true });
  await fs.mkdir(path.join(stagingDirectory, 'electron'), { recursive: true });
  await fs.cp(path.join(projectRoot, 'dist'), path.join(stagingDirectory, 'dist'), { recursive: true });
  await fs.cp(path.join(projectRoot, 'electron'), path.join(stagingDirectory, 'electron'), { recursive: true });
  await fs.writeFile(path.join(stagingDirectory, 'package.json'), JSON.stringify({
    name: 'obi-quest',
    version: require(path.join(projectRoot, 'package.json')).version,
    main: 'electron/main.cjs',
    type: 'commonjs'
  }, null, 2));

  await createPackage(stagingDirectory, appArchive);
  await fs.rename(electronExecutable, namedExecutable);
  await fs.writeFile(path.join(portableDirectory, 'LEIA-ME.txt'), 'Execute OBI Quest.exe. Mantenha esta pasta completa: ela contem os recursos do aplicativo.\r\n');
  await fs.rm(stagingDirectory, { recursive: true, force: true });

  console.log(`App portatil criado em: ${namedExecutable}`);
}

packageWindows().catch((error) => {
  console.error('Falha ao empacotar OBI Quest para Windows:', error);
  process.exitCode = 1;
});
