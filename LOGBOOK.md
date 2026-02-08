# 🎭 Diário de Bordo: Bloco dos Mauricinhos UNINASSAU

Este documento registra todas as evoluções, correções técnicas e decisões de design tomadas durante o desenvolvimento do sistema oficial do Bloco dos Mauricinhos.

---

## 🛠️ Evolução Técnica e Correções

### 1. Migração de Rota (Admin para Dashboard)
*   **Ação**: Alteramos a rota `/admin` para `/dashboard` para uma nomenclatura mais moderna.
*   **Solução**: Implementamos um redirecionamento automático em `App.tsx` para garantir que ninguém se perca.

### 2. Correção da "Tela Branca" (O Grande Bug)
*   **Problema**: Ao logar no painel, a tela ficava branca.
*   **Causa 1 (RLS)**: As políticas de segurança do Supabase (Row Level Security) permitiam que o público visse os dados, mas bloqueavam usuários autenticados por falta de regras específicas.
*   **Causa 2 (Hooks)**: No `Dashboard.tsx`, os sensors do React (Hooks) estavam fora de ordem, o que o React não permite.
*   **Causa 3 (ReferenceError)**: Funções de busca de dados estavam sendo chamadas antes de serem definidas.
*   **Solução**: 
    - Aplicamos novas políticas RLS via SQL.
    - Reorganizamos todo o código do `Dashboard.tsx` colocando hooks e funções no topo.
    - Adicionamos travas de segurança (null-safety) em cálculos de gráficos para evitar divisão por zero.

### 3. Remoção de Conflitos JS
*   **Ação**: Removemos o bloco `<script type="importmap">` do `index.html`.
*   **Porquê**: Ele estava forçando o navegador a baixar versões de bibliotecas da internet que entravam em conflito com os arquivos locais que o Vite gerava.

---

## 🎨 Design e UI/UX

### Tema "Carnaval Premium"
*   **Cores**: Azul Marinho (`#002D5B`), Amarelo Folia (`#FFD100`) e Vermelho vibrante (`#E63946`).
*   **Efeitos**: Glassmorphism (efeito vidro transparente), animações de flutuação e padrões de confete no fundo.
*   **Gráficos**: Implementamos Dashboards com Recharts para visualização clara de inscritos por unidade e arrecadação de alimentos.

---

## 🚀 Preparação para Deploy e Segurança

### 1. Variáveis de Ambiente (.env)
*   As chaves do Supabase foram retiradas do código fonte (`lib/supabase.ts`) e movidas para o arquivo `.env`.
*   **Crucial**: O arquivo `.env` está no `.gitignore`, o que significa que ele **nunca** vai para o GitHub, mantendo o banco de dados seguro.

### 2. Configuração GitHub & Vercel
*   **GitHub**: [https://github.com/edgar2026/blocodosmauricinhos](https://github.com/edgar2026/blocodosmauricinhos)
*   **Vercel**: O projeto está pronto para CI/CD. Basta conectar o repo e adicionar as `Environment Variables` no painel.

---

## 📋 Como retomar o projeto no futuro?

1.  **Instalar dependências**: `npm install`
2.  **Configurar chaves**: Criar um arquivo `.env` baseado no `.env.example`.
3.  **Rodar**: `npm run dev`
4.  **Admin**: Para acessar o painel, a rota é `/#/dashboard`. 

---

**Última atualização**: 08 de Fevereiro de 2026.  
**Estado atual**: Estável, Seguro e Pronto para o Carnaval! 🎊🎢✨
