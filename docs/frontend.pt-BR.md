# Nexum Frontend Application (Português)

**A aplicação cliente do Nexum. Uma SPA (Single Page Application) altamente responsiva desenvolvida em React 19 + TypeScript com Vite 8, estilizada com Tailwind CSS v4 e com micro-animações do Framer Motion.**

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ Funcionalidades Principais & Experiência do Usuário (UX)

A interface do frontend foca em design limpo, transições fluidas e feedback visual acionável imediato.

### 1. Dashboards de Métricas Interativos
- **Cards de MRR, Inadimplência e Próximos Vencimentos:** Cards resumo clicáveis que abrem modais de detalhamento profundo.
- **Gráficos Visuais de Distribuição e Crescimento:** Gráficos SVG elegantes mostrando tendências de receita e inscrições históricas cobrindo 29 meses.
- **Fluxos de Pagamento Direto:** Permite acionar o pagamento de uma mensalidade diretamente a partir dos detalhes do cliente.

### 2. Persistência de Sessão e Redirecionamento Automático
- O token JWT é armazenado em `localStorage` para manter o usuário autenticado mesmo fechando abas ou recarregando o navegador (alinhado ao vencimento de 7 dias do banco de dados).
- Redirecionamento inteligente: Se houver uma sessão ativa, o usuário é enviado direto ao Dashboard ao tentar acessar as páginas de Login ou Cadastro.

### 3. Códigos de Discagem Internacional (DDI) & WhatsApp
- Nos formulários de cadastro e edição de clientes, o usuário seleciona o país (Brasil `+55`, EUA `+1`, Portugal `+351`, etc.) por meio de um componente select dedicado.
- O sistema monta o número final automaticamente para gerar links de cobrança no WhatsApp com mensagens pré-formatadas para clientes inadimplentes.

### 4. Letreiro Animado na Aba do Navegador (Marquee)
- Um efeito personalizado em React altera sequencialmente o título da aba do navegador a cada 300ms quando a aba está inativa, criando um letreiro scrolling sutil sem vazamento de memória.

---

## 🏗️ Arquitetura e Estrutura de Pastas

Os arquivos de frontend estão organizados de forma simétrica para facilitar a localização de lógica e visual.

```
frontend/src/
├── assets/             # Imagens, mídias estáticas e gráficos pré-carregados
├── components/         # Componentes reutilizáveis e layouts
│   ├── landing/        # Seções de cabeçalho, hero e seções da landing page
│   ├── layout/         # Barra lateral (Sidebar), temas e wrappers de layout do dashboard
│   └── ui/             # Modais, gráficos customizados em SVG e cards interativos
├── contexts/           # Contextos React (Gerenciamento de Tema, Segurança e Estado de Auth)
├── hooks/              # Hooks customizados do React Query envolvendo domínios de negócio
├── pages/              # Páginas e rotas (Autenticação, Clientes, Planos, Dashboard)
├── routes/             # Definição de rotas e guardas de rotas protegidas
├── services/           # Clientes HTTP axios mapeados para a API REST
├── styles/             # Folhas de estilo globais e diretivas do Tailwind
├── types/              # Definições de tipos e interfaces do TypeScript
└── Utils/              # Módulos auxiliares (Formatadores, manipuladores de títulos e erros)
```

### Sincronização de Estado com o Servidor (Caching)
A busca e atualização de dados é gerenciada inteiramente pelo **TanStack React Query** (`@tanstack/react-query`). Componentes nunca chamam APIs diretamente dentro de `useEffect`s. Em vez disso, utilizam hooks especializados como `useClients.ts`, `usePlans.ts`, `useSubscriptions.ts` e `useMetrics.ts`, garantindo cache inteligente e invalidação automática.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- **Node.js v20+**
- **npm** (instalado junto com o Node.js)

### 1. Instalação de Dependências
Instale as dependências executando o comando dentro do diretório `frontend/`:
```powershell
npm install
```

### 2. Executando o Servidor de Desenvolvimento
Inicie o servidor de desenvolvimento do Vite (com hot-reload instantâneo):
```powershell
npm run dev
```
A aplicação estará rodando em `http://localhost:5173`.

### 3. Compilação para Produção
Para compilar e otimizar os arquivos estáticos para produção dentro da pasta `dist/`:
```powershell
npm run build
```

---

## 🧪 Linters e Qualidade de Código

O Nexum preza pela qualidade e consistência. Para rodar checagens estáticas e compilação do TypeScript:
```powershell
# Executar análise estática do ESLint
npm run lint

# Executar verificação de tipos estáticos do TypeScript
npx tsc --noEmit
```
**Regra sem gambiarras:** Mantemos tipagens estritas no TypeScript. É terminantemente proibido o uso de `@ts-ignore` ou casting para `any`.
