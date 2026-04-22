# Guia de Uso - Nzila (Guide-Grow)

Bem-vindo ao guia oficial do projeto **Nzila (Guide-Grow)**, uma plataforma educacional web inovadora, gamificada e impulsionada por IA.
Este documento resume todas as funcionalidades da plataforma e como utilizá-las, quer do ponto de vista do desenvolvimento, quer do utilizador final.

---

## 🚀 Como Executar o Projeto Localmente

O ecossistema do projeto é distribuído, dependendo de três serviços principais que precisam de estar ativados em simultâneo:

1. **Frontend (Interface do Utilizador - React/Vite)**
   - Abra um terminal na raiz do projeto (`c:\Users\dell\OneDrive\Desktop\projecto final\guide-grow`).
   - Caso seja a sua primeira vez a abrir o projeto, instale de imediato as dependências executando: `npm install`
   - Inicie o servidor de desenvolvimento e interface executando: `npm run dev`
   - A aplicação estará disponível localmente. O terminal fornecerá o link habitual `http://localhost:5173`.

2. **Backend (Servidor Principal & Base de Dados)**
   - Abra um novo terminal em paralelo.
   - Navegue para a pasta do backend executando: `cd backend`
   - Instale as dependências caso necessárias: `npm install`
   - Inicie o servidor backend executando: `node server.js`
   - Garanta que a sua base de dados MySQL conectada tem o esquema preparado conforme gerido pela aplicação.

3. **Proxy da IA (Serviço Google Gemini)**
   - Abra um terceiro terminal.
   - Navegue para a pasta que contém a integração proxy da IA: `cd 3D-ai-school-threejs/proxy-server`
   - Inicie o servidor proxy executando: `node proxy.js`

> **Atenção:** As configurações de ambiente como chaves do *Google Gemini* precisam estar nos vossos `.env` locais para as integrações de IA funcionarem sem problemas.

---

## 🎯 Todas as Funcionalidades e Como Usá-las

### 1. Sistema de Autenticação e Gestão de Perfil
- **Descrição:** Sistema de login e registo onde são introduzidos dados demográficos e escolares (idade, ano, curso).  
- **Como Usar:** 
  - Na *homepage*, selecione `Registar` ou `Login`.
  - Ao registar, o preenchimento completo concede recompensas de registo automáticas (+120XP, Nível 1, 3 dias de streak gratuitos).
  - Edite ou reveja o seu perfil em "Perfil" ou através do Dashboard.

### 2. Dashboard Principal (Estatísticas Globais)
- **Descrição:** O ecrã "hub" assim que entra. Resume as áreas fundamentais e atalhos de estudo diário.
- **Como Usar:** 
  - Pode inspecionar o seu progresso total de **XP**, a **Streak** de dias de estudo ou aceder facilmente a um quiz rápido gerado. É o melhor ponto de partida da sua sessão.

### 3. Tira-dúvidas e Tutoria por IA (Chat Nzila)
- **Descrição:** O seu tutor pessoal persistente, interligado e sabedor da sua "vida estudantil".
- **Como Usar:**
  - Clique no menu flutuante inferior em "Chat" ou através do Dashboard.
  - Faça qualquer pergunta: "Resume-me a Primeira Guerra Mundial", "Como resolve a equação de Bhaskara?". 
  - O Chat guardará essas sessões e saberá a sua disciplina/curso para personalizar a língua/dificuldade das respostas ao longo do tempo.

### 4. Sistema de Gamificação Total (Níveis, XP e Conquistas)
- **Descrição:** Recompensa de todas as ações pedagógicas.
- **Como Usar (Passivamente):** 
  - Você ganha o seu **XP** e sobe de lado-a-lado nos **Níveis** naturalmente focando-se em tarefas.
  - Recebe +10XP ao riscar itens do *To Do*, ou +25XP num ciclo concentrado de *Pomodoro*. Alcançar Xps definidos liberta os cobiçados "Badges" como "Foco Inabalável".

### 5. Quizzes Dinâmicos IA e Teste Vocacional
- **Descrição:** Perguntas geradas no ecrã sobre a matéria inscrita e auxílios de carreira.
- **Como Usar:**
  - **Quizzes Adaptativos:** Selecione a área e o tema, a Inteligência Artificial gera um questionário com um "timer" (30s) e dá o feedback visual e de som.
  - **Teste Vocacional:** Se se sente perdido sobre o futuro, encontre o teste de 7 perguntas e os algoritmos indicarão um ramo compatível bem como os melhores modelos mentais a seguir para lá chegar.

### 6. Central de Gestão: Matérias e Materiais
- **Descrição:** Repositório dos seus anexos ou provas.
- **Como Usar:** 
  - Crie as suas Cadeiras/Disciplinas (algumas aparecem automaticamente ao definir no seu Perfil Pessoal o seu Curso como "Humanidades", "Saúde" ou "Informática e TI").
  - Faça 'upload' virtual de *Testes, Resumos, Listas de Exercício* da escola/faculdade. Ficará organizado pelas suas classes.

### 7. Planner de Tarefas & Temporizador Pomodoro
- **Descrição:** A ferramenta master para combater a procrastinação diária.
- **Como Usar:** 
  - Abra na aba inferior o 'Planner'. Adicione tarefas como "Ler Capítulo 2 de Biologia".
  - Filtre-as se for caso na barra visual ("Estudos", "Rotina", etc).
  - Use o **Pomodoro** integrado para iniciar o *Timer (25 minutos focados, 5 min descanso)* antes de começar essa tarefa. Finda o ciclo, lucra experiência e um hábito produtivo.

### 8. Organização Trimestral de Notas 
- **Descrição:** Área analítica dos seus resultados empíricos em sala de aula (provas escolares).
- **Como Usar:** 
  - Acesse o setor das avaliações e lance as notas no esquema trimestral de avaliações Contínuas ou de Frequência (Ex: P1 e P2). 
  - Serão fornecidos **gráficos circulares e retilíneos** sobre a sua média exata num olhar sobre toda a performance anual.

### 9. Trilha de Carreira e Milestones
- **Descrição:** Conteúdo imersivo e descritivo por "Etapas da vida". Depende dos níveis já acumulados.
- **Como Usar:** Vá à Secção de "Trilhas de Carreira". Quando chegar aos XP necessários (0, 500, 1500, 3500, etc.) o Gemini AI gera de forma procedural descrições profissionais específicas que estimulam a imaginação do estudante para com os próximos anos de formação.

### 10. Dashboard de Ranking Pessoal e Inteligência Analítica
- **Descrição:** Insight puro fornecido à base de dados para o guiar.
- **Como Usar:** Aceda às suas estatísticas avançadas, onde a IA correlaciona o seu nível de XP, tempo de estúdio real, notas registadas de modo a dar o feedback direto de como e para onde deve direcionar as capacidades do semestre num texto fluido.
TESTE PARA O APRENDIZADO DA MAQUINA E DO DEZENVOLVIMENTO 
---
_Nota de funcionalidades Futuras (Em desenvolvimentos locais nestes diretórios): Serviços extra imersivos em **Sala IA de Ensino com Avatar 3D** e observação de física interativa em **Realidades 3Ds mistas** dos diretórios `interactive-solar-system-guide` e `3D-ai-school-threejs` estão atualmente a ser explorados._
