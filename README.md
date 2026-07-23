# 📖 Maristory — Estante Virtual Pessoal & Intimista de Leituras

<p align="center">
  <img src="Maristory/public/logos/Maristory.png" alt="Maristory Logo" width="480" style="border-radius: 16px;" />
</p>

<p align="center">
  <b>Sistema de Gerenciamento e Catalogação Pessoal de Leituras</b><br>
  <i>Inspirado no Skoob • Estante Virtual Privada • Sem Rede Social • Design em Tons Roxos & Lavanda</i>
</p>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-identidade-visual--paleta-de-cores">Identidade Visual & Cores</a> •
  <a href="#-recursos-principais">Recursos</a> •
  <a href="#-arquitetura--tecnologias">Arquitetura & Tech</a> •
  <a href="#-como-iniciar-um-projeto-do-zero-em-tsx-react--typescript">Guia TSX do Zero</a> •
  <a href="#-instruções-para-execução-do-maristory">Como Rodar</a>
</p>

---

## 📌 Sobre o Projeto

O **Maristory** é um sistema web full-stack completo e refinado, projetado para pessoas apaixonadas por leitura que buscam organizar seu acervo literário, controlar metas e registrar históricos de leitura em um ambiente aconchegante, seguro e privativo.

### 🚫 Princípio Fundamental: Sem Rede Social

Diferente das redes sociais tradicionais de leitura:

- ❌ **Sem feed público ou timeline de atualizações**
- ❌ **Sem sistema de seguidores, amizades ou curtidas**
- ❌ **Sem resenhas públicas ou comparações de leituras**

A sua estante virtual é **100% privada**. Suas anotações, histórico, avaliação de estrelas e diários de leitura pertencem unicamente a você.

---

## ✨ Recursos Principais

### 1. Autenticação e Controle de Acesso (RBAC)
- **Multi-usuário:** Qualquer usuário pode criar uma conta individual e gerenciar sua estante de forma totalmente isolada.
- **Papel do Administrador (ADM):** Apenas administradores cadastrados têm acesso ao painel de gerenciamento global do catálogo.

### 2. Catálogo Global de Livros (Gerenciamento ADM)
- Permite incluir novos títulos no sistema com:
  - Título, Autor, Editora, Ano de Publicação
  - Número de Páginas, Gênero/Categoria, Sinopse e ISBN
  - Upload direto de capas de livros (armazenamento local) ou URL externa com preview em tempo real.

### 3. Estante Virtual do Leitor
- **Controle de Posse:**
  - 📗 **Tenho** (Possui versão física/digital)
  - ⬜ **Não Tenho**
- **Status de Leitura:**
  - 📖 **Lendo** (Acompanhamento de páginas lidas e cálculo de % de progresso)
  - ✅ **Lido** (Com registro da data de conclusão)
  - 📌 **Quero Ler** (Lista de desejos literários)
  - 🚫 **Abandonado**
- **Anotações Privadas & Diário:**
  - Avaliação de 1 a 5 estrelas.
  - Registro de datas de início e término da leitura.
  - Resenhas completas e diário de leitura privativo.
  - Marcador de livro **Favorito** (♥).
  - Filtros avançados por busca de título/autor, status, posse e ordenação.

### 4. Estatísticas & Métricas de Leitura
- Painel visual com número total de livros lidos e lendo no momento.
- Contagem do total de páginas lidas.
- Gráficos e distribuidores por gênero e status de leitura.

---

## 🛠️ Arquitetura & Tecnologias

- **Frontend:** React 19, TypeScript (TSX), Tailwind CSS v4, Lucide React (Ícones), Motion (Animações fluídas).
- **Backend:** Node.js, Express 4, REST API, `tsx` (Executor TypeScript), `esbuild` (Bundler CJS para produção).
- **Banco de Dados:** Armazenamento em arquivo local JSON (`data/maristory-db.json`) com sincronização persistente.
- **Upload de Arquivos:** Suporte a upload de imagens de capa via `multipart/form-data` com salvamento automático.

---

## 🚀 Como Iniciar um Projeto do Zero em TSX (React + TypeScript)

Se você deseja aprender ou replicar esta estrutura criando um novo projeto do zero utilizando React com TypeScript (`.tsx`) e backend Node.js + Express integrados, siga o passo a passo abaixo:

### 1. Criar o Projeto com Vite (Template React + TypeScript)
No seu terminal, inicialize uma nova aplicação React com TypeScript via Vite:
```bash
npm create vite@latest meu-projeto-tsx -- --template react-ts
cd meu-projeto-tsx
```

### 2. Instalar Dependências de Frontend e Estilização
Instale os pacotes principais para interface do usuário, ícones e animações:
```bash
npm install tailwindcss lucide-react motion
```

### 3. Instalar Dependências de Backend Node.js e TypeScript
Adicione o Express para criar rotas de API e as ferramentas de build para TypeScript:
```bash
# Servidor HTTP
npm install express

# Dependências de desenvolvimento para TypeScript
npm install -D @types/express @types/node tsx esbuild typescript
```

### 4. Configurar os Scripts no `package.json`
Substitua a seção `"scripts"` do arquivo `package.json` pela estrutura abaixo para rodar em desenvolvimento com `tsx` e compilar para produção com `esbuild`:

```json
{
  "name": "meu-projeto-tsx",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "lint": "tsc --noEmit"
  }
}
```

### 5. Criar o Servidor Integrado (`server.ts`)
Crie o arquivo `server.ts` na raiz do seu projeto. Ele servirá tanto a API REST em Node.js quanto a interface React:

```typescript
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Rota de teste da API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Middleware do Vite para ambiente de desenvolvimento / arquivos estáticos em produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
```

---

## 💻 Instruções para Execução do Maristory

### Pré-requisitos
- **Node.js**: Versão 18.0 ou superior instalada.
- **npm** ou **bun**.

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/usuario/maristory.git
cd maristory
npm install
```

### 2. Rodar em Ambiente de Desenvolvimento
```bash
npm run dev
```
A aplicação iniciará na URL local: `http://localhost:3000`.

### 3. Compilar e Rodar em Produção
```bash
npm run build
npm start
```

---

<p align="center">
  <b>Maristory</b> — Feito com amor pela leitura e organização de momentos literários. 💜
</p>