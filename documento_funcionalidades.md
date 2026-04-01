# Documento de Funcionalidades e Problemas Resolvidos - Nzila (Guide-Grow)

## 1. Visão Geral do Projeto

O **Nzila** (também designado como "Guide-Grow" no diretório) é uma plataforma educacional completa desenvolvida com React (frontend) e Node.js/Express (backend), com integração de Inteligência Artificial (Google Gemini) para fornecer uma experiência de aprendizagem personalizada e gamificada para estudantes, particularmente em Angola e países lusófonos.

### Stack Tecnológico:
- **Frontend**: React + TypeScript + Vite + TailwindCSS + React Router
- **Backend**: Node.js + Express + MySQL
- **IA**: Google Gemini API (via proxy server)
- **Database**: MySQL
- **Bibliotecas UI**: shadcn/ui, Lucide Icons, Recharts

---

## 2. Funcionalidades Principais

### 2.1 Sistema de Autenticação e Gestão de Utilizadores
- **Registo de utilizadores** com dados pessoais (nome, idade, ano letivo, curso, objetivos)
- **Login** com autenticação JWT
- **Gestão de perfil** com edição de dados pessoais e académicos
- **Inicialização automática** de progresso gamificado no registo (120 XP, Nível 1, 3 dias de streak)

### 2.2 Dashboard Principal
- Visualização de progresso geral com XP e nível
- Indicador de dias de estudo consecutivos (streak)
- Desafio diário (Quiz do Dia)
- Acesso rápido às principais funcionalidades:
  - Chat com IA (Nzila)
  - Sala IA (Avatar de Ensino 3D)
  - Ambientes em 3D (AR)
- Estatísticas rápidas: horas de estudo e número de disciplinas

### 2.3 Sistema de Gamificação
- **Pontos XP**: Ganhos por completar quizzes, tarefas e sessões de Pomodoro
- **Níveis**: Progressão automática (100 XP por nível)
- **Streak**: Contagem de dias consecutivos de estudo
- **Conquistas**: Sistema de metas progressivas (Ex: "Foco Inabalável", "Mestre do Planeamento")
- **Recompensas**: XP extra por completar desafios diários

### 2.4 Chat com IA (Nzila)
- Tutor virtual inteligente baseado em Google Gemini
- Histórico de conversas persistente (guardado em base de dados)
- Contexto personalizado: o AI conhece o perfil do aluno, progresso e disciplinas
- Sugestões de perguntas pré-definidas
- Interface conversacional intuitiva

### 2.5 Sistema de Quizzes
- **Quizzes gerados por IA**: Perguntas personalizadas baseadas nas disciplinas do utilizador
- **Desafio Adaptativo**: Quiz dinâmico baseado no curso e nível do aluno
- **Teste Vocacional**: Quiz de 7 perguntas para determinar inclinações profissionais
- **Timer**: Contagem regressiva de 30 segundos por pergunta
- **Feedback imediato**: Respostas corretas/erradas com som
- **Resultados detalhados**: Percentagem de acerto, XP ganho, revisão das respostas

### 2.6 Sistema de Disciplinas e Materiais
- **Gestão de disciplinas**: Adicionar/editar disciplinas do curso
- **Catálogo de cursos pré-definidos**:
  - Ciências e Tecnologia
  - Humanidades
  - Gestão e Economia
  - Informática e TI
  - Saúde e Medicina
  - Artes e Comunicação
- **Materiais de estudo**: Upload de resumos, testes, exercícios
- **Tipos de materiais**: Prova/Teste, Resumo, Lista de Exercícios, Outro
- **Sync automático**: Criação automática de disciplinas baseada no perfil do aluno

### 2.7 Sistema de Notas e Desempenho
- **Registo de notas** por trimestre (T1, T2, T3)
- **Duas provas por trimestre** (P1, P2) - escala 0-20
- **Gráficos de evolução**: Linha temporal por trimestre
- **Distribuição de notas**: Gráfico circular (Excelente/Bom/Atenção)
- **Média por disciplina**: Cálculo automático

### 2.8 Planner de Tarefas
- **Lista de tarefas**: Gestão de tarefas diárias
- **Filtros**: Estudos, Vocacional, Rotina
- **Timer Pomodoro**: Sessões de 25 minutos com pausa de 5 minutos
- **Ganho de XP**: +10 XP por tarefa concluída, +25 XP por Pomodoro
- **Sistema de datas**: Calendário visual com dias do mês

### 2.9 Orientação Vocacional
- **Teste vocacional via IA**: Análise de inclinações profissionais
- **Resultado personalizado**:
  - Inclinação principal
  - Foco de estudo ideal
  - Sugestão de carreiras com descrições
- **Carreras sugeridas**: Baseadas no perfil do aluno

### 2.10 Trilha de Carreira
- **Milestones progressivos**: Etapas de progressão baseadas em XP
- **Sistema de níveis**: 5 etapas principais (0, 500, 1500, 3500, 6000 XP)
- **Conteúdo gerado por IA**: Descrições personalizadas por curso
- **Indicador de progresso**: XP necessário para próximo nível

### 2.11 Ranking e Estatísticas Pessoais
- **Estatísticas em tempo real**: XP total, nível, streak, quizzes feitos, horas de estudo
- **Análise de IA**: Insights personalizados sobre o desempenho
- **Gráficos de progresso**: Evolução ao longo do tempo

### 2.12 Integração com IA (Google Gemini)
Todas as funcionalidades de IA são servidas através de um proxy server local:
- Chat contextualizado
- Geração de quizzes
- Testes vocacionais
- Análise de perfil vocacional
- Geração de trilha de carreira
- Estatísticas personalizadas

---

## 3. Problemas que o Projeto Resolve

### 3.1 Problema: Falta de Motivação dos Estudantes
- **Solução**: Sistema de gamificação com XP, níveis, badges e streak
- **Impacto**: Aumenta o engajamento e a frequência de estudo

### 3.2 Problema: Dificuldade em Aprender Conteúdos Escolares
- **Solução**: Quizzes gerados por IA baseados nos materiais do aluno
- **Impacto**: Revisão personalizada e focada nas áreas fracas

### 3.3 Problema: Ausência de Orientação Vocacional
- **Solução**: Teste vocacional via IA que sugere carreiras baseadas em perfil
- **Impacto**: Auxilia na escolha de carrera profissional

### 3.4 Problema: Desorganização nos Estudos
- **Solução**: Planner de tarefas + Timer Pomodoro
- **Impacto**: Rotina de estudos estruturada e produtiva

### 3.5 Problema: Falta de Tutoria Personalizada
- **Solução**: Chat com IA (Nzila) disponível 24/7
- **Impacto**: Suporte dúvidas instantâneo sem depender de professores

### 3.6 Problema: Dificuldade em Acompanhar o Progresso
- **Solução**: Dashboard com estatísticas + gráficos de evolução de notas
- **Impacto**: Visualização clara do desempenho académico

### 3.7 Problema: Gestão de Materiais de Estudo
- **Solução**: Sistema centralizado de upload e organização de materiais
- **Impacto**: Acesso fácil a resumos, testes e exercícios

### 3.8 Problema: Necessidade de Acesso Mobile
- **Solução**: Design responsivo (mobile-first) com navegação inferior fixa
- **Impacto**: Utilização em telemóveis e tablets

---

## 4. Estrutura da Base de Dados

### Tabelas Principais:
1. **users** - Dados pessoais e académicos
2. **user_progress** - XP, nível, streak, horas de estudo
3. **tasks** - Tarefas do planner
4. **subjects** - Disciplinas do aluno
5. **subject_materials** - Materiais de estudo
6. **subject_grades** - Notas por disciplina e trimestre
7. **quiz_results** - Resultados de quizzes
8. **chat_history** - Histórico de conversas com IA
9. **vocational_results** - Resultados de testes vocacionais

---

## 5. Funcionalidades Pendentes/Incompletas

Com base na análise do código, algumas rotas estão definidas no App.tsx mas os componentes não foram encontrados:
- `/dashboard/sala-ia` - Sala IA (Avatar de Ensino 3D)
- `/dashboard/sistema-solar` - Sistema Solar 3D
- `/dashboard/vocational` - Página Vocacional alternativa
- `/dashboard/ar` - Realidade Aumentada

Estas funcionalidades parecem estar planeadas mas não foram implementadas no código atual.

---

## 6. Conclusão

O Nzila é uma plataforma educacional inovadora que combina:
- **Tecnologia de ponta**: React, IA, base de dados relacional
- **Experiência do usuário**: Interface moderna, mobile-first
- **Pedagogia**: Gamificação, aprendizagem personalizada, orientação vocacional
- **Contexto local**: Adaptado ao sistema educativo angolano/africano

O projeto resolve problemas reais da educação moderna através de tecnologia acessível e personalizada.