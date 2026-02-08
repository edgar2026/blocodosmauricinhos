# Bloco dos Mauricinhos - UNINASSAU

Sistema de gerenciamento de inscrições para o evento de Carnaval da UNINASSAU.

## 🎭 Sobre o Projeto

Aplicação web para gerenciar inscrições de participantes do "Bloco dos Mauricinhos", o evento de Carnaval da UNINASSAU. O sistema permite que foliões se inscrevam online e oferece um painel administrativo para acompanhamento em tempo real.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Roteamento**: React Router DOM
- **Estilização**: TailwindCSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🗄️ Banco de Dados

O projeto utiliza Supabase para armazenamento de dados. A estrutura do banco inclui:

### Tabela: `participants`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único do participante |
| name | TEXT | Nome completo |
| phone | TEXT | Telefone/WhatsApp |
| email | TEXT | E-mail institucional |
| cpf | TEXT | CPF (único) |
| unit | TEXT | Unidade da UNINASSAU |
| created_at | TIMESTAMP | Data de inscrição |

### Configuração do Supabase

As credenciais do Supabase estão configuradas em `lib/supabase.ts`:
- **URL do Projeto**: https://mknjhuasxkrblrejbsji.supabase.co
- **Chave Anônima**: Configurada para permitir inserções públicas

### Políticas de Segurança (RLS)

- ✅ Permitir INSERT público (para inscrições)
- ✅ Permitir SELECT apenas para usuários autenticados (painel admin)

## 📱 Funcionalidades

### Página Inicial (`/`)
- Hero section moderna com informações do evento
- Detalhes sobre solidariedade e pulseira VIP
- Cronograma do evento
- Footer com informações de contato

### Formulário de Inscrição (`/register`)
- Campos: Nome, Telefone, E-mail, CPF, Unidade
- Validação de CPF único
- Feedback visual de sucesso/erro
- Estado de carregamento durante o envio
- Integração direta com Supabase

### Painel Administrativo (`/admin`)
- **KPIs**:
  - Total de inscritos (em tempo real)
  - Total de alimentos arrecadados
  - Meta de participantes

- **Gráficos**:
  - Inscrições por unidade (gráfico de barras)
  - Distribuição de alimentos (gráfico de pizza)

- **Tabela de Participantes**:
  - Listagem completa com paginação (10 por página)
  - Busca e filtros
  - Estados de loading e vazio
  - Colunas: Nome, CPF, E-mail, Telefone, Unidade

## 🎨 Design

O projeto segue o tema de Carnaval com:
- **Cores principais**: Navy Blue (`#002D5B`) e Amarelo (`#FFD100`)
- **Elementos visuais**: Confetes, animações, glassmorphism
- **Responsividade**: Mobile-first design
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 📊 Fluxo de Dados

1. **Inscrição**: 
   - Usuário preenche formulário → Dados validados → Insert no Supabase → Feedback visual

2. **Visualização Admin**:
   - Dashboard carrega → Fetch de dados do Supabase → Processamento e exibição → Atualização em tempo real

## 🔐 Segurança

- CPF único impede duplicação de inscrições
- Row Level Security (RLS) ativado
- Políticas específicas para leitura/escrita
- Validação de dados no frontend e backend

## 🌐 Deploy

O projeto pode ser deployado em:
- Vercel (recomendado para Vite + React)
- Netlify
- GitHub Pages

Variáveis de ambiente necessárias:
```env
VITE_SUPABASE_URL=https://mknjhuasxkrblrejbsji.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 📝 Próximas Melhorias

- [ ] Sistema de autenticação para admin
- [ ] Exportação de dados (CSV/Excel)
- [ ] Dashboard em tempo real com WebSockets
- [ ] Filtros avançados na tabela
- [ ] Geração de QR codes para check-in
- [ ] Notificações por e-mail/WhatsApp
- [ ] Rastreamento de entrega de pulseiras
- [ ] Sistema de doação de alimentos

## 🎊 Evento

**Data**: 27 de Fevereiro  
**Local**: R. Fernando Lopes, 752 - Graças, Recife - PE  
**Entrada**: 1kg de alimento não perecível

---

Desenvolvido com ❤️ para a UNINASSAU
