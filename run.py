import subprocess
from pathlib import Path


def main() -> None:
    project_dir = Path(__file__).resolve().parent
    command = ["npm", "run", "dev"]

    print(f"Iniciando projeto em: {project_dir}")
    print("Se você ainda não instalou dependências, execute: npm install")

    try:
        subprocess.run(command, cwd=project_dir, check=True)
    except FileNotFoundError:
        print("Erro: comando 'npm' não encontrado. Instale o Node.js e tente novamente.")
    except subprocess.CalledProcessError as exc:
        print(f"O servidor terminou com código de erro: {exc.returncode}")


if __name__ == "__main__":
    main()
