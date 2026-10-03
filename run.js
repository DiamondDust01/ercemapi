const { spawn } = require('child_process');
const path = require('path');

const projectDir = path.resolve(__dirname);
console.log(`Iniciando projeto em: ${projectDir}`);
console.log('Se você ainda não instalou dependências, execute: npm install');

const child = spawn('npm', ['run', 'dev'], {
  cwd: projectDir,
  stdio: 'inherit',
  shell: true,
});

child.on('error', (err) => {
  console.error(`Erro ao executar npm: ${err.message}`);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`O servidor terminou com código de erro: ${code}`);
  }
});
