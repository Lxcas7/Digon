# Guia de Deploy - Digão Restaurante - Painel Operacional

Este guia orienta passo a passo como enviar seu código operacional do **Digão Restaurante** para o GitHub e utilizar a esteira automatizada de deploy (**GitHub Actions**) para hospedar seu site gratuitamente no **GitHub Pages**.

---

## 🛠️ Passo 1: Inicializar o Repositório Git Local

Se você ainda não inicializou o Git na pasta local do seu projeto, abra o seu terminal na pasta raiz e execute:

```bash
# Inicializa o repositório local
git init

# Adiciona todos os arquivos (o .gitignore configurado evitará subir pastas desnecessárias como node_modules/ e dist/)
git add .

# Registra a primeira versão dos arquivos
git commit -m "feat: estrutura operacional inicial e workflows de deploy"
```

---

## 🖥️ Passo 2: Criar o Repositório no GitHub e Conectar

1. Vá para o [GitHub](https://github.com) e crie um **novo repositório** (vazio, sem marcar a opção de criar README, .gitignore ou Licença para evitar conflitos).
2. Copie o endereço HTTPS ou SSH do seu repositório criado. Ele se parecerá com: `https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git`.
3. No seu terminal de comandos, execute os seguintes comandos para ligar seu projeto local ao servidor do GitHub:

```bash
# Define o nome da sua branch padrão como 'main'
git branch -M main

# Associa o repositório local ao seu repositório no GitHub (substitua a URL abaixo pela URL do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git

# Envia os arquivos locais para a branch 'main' no GitHub
git push -u origin main
```

---

## ⚙️ Passo 3: Ativar o GitHub Pages no Repositório

Após ter enviado o código para a branch `main`:

1. No painel do seu repositório no **GitHub**, clique na aba **Settings** (Configurações).
2. Na barra lateral esquerda, em **Code and automation**, clique na opção **Pages**.
3. Na seção **Build and deployment**:
   - Sob **Source**, mude a opção de *Deploy from a branch* para **GitHub Actions**.
4. **Pronto!** Assim que você selecionar *GitHub Actions*, o fluxo configurado em `.github/workflows/deploy.yml` será iniciado automaticamente.

---

## 🚀 Passo 4: Acompanhar o Status e Visualizar

1. Clique na aba **Actions** no topo da página do seu repositório no GitHub.
2. Você verá o workflow correspondente ao seu último commit rodando (por exemplo, "Deploy to GitHub Pages").
3. Após o término da execução (geralmente leva cerca de 1 a 2 minutos), um link seguro (`https://seu-usuario.github.io/nome-do-repositorio/`) será gerado na própria página de execução do Actions ou na aba **Pages** das configurações.
4. Clique no endereço para visualizar seu painel administrativo completo em produção!

---

## 📝 Notas e Práticas de Segurança

- **Variáveis de Ambiente:** Se o seu sistema necessitar de chaves de API secretas (como `GEMINI_API_KEY`) para chamadas externas que você deseja integrar em produção, lembre-se que chamadas cliente-side expõem a chave no browser. No entanto, se quiser usar integrações de forma pontual, utilize as configurações de segredos de ambiente no próprio GitHub.
- **Vite Base Path:** Já atualizamos o arquivo `vite.config.ts` com a configuração `base: './'`. Isso garante que todas as referências de fontes, imagens e scripts embutidos funcionem com rotas relativas portáveis, não importando qual o nome do seu repositório ou se ele está rodando em subpastas ou domínios dedicados.
