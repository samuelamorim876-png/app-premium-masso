# DOCUMENTAÇÃO TÉCNICA COMPLETA - APP MASSOTERAPIA

Esta documentação detalha todas as funcionalidades, estruturas e integrações implementadas no sistema até 30 de Maio de 2026.

---

## 1. SISTEMA DE AUTENTICAÇÃO E ACESSO

O sistema utiliza **Supabase Auth** como provedor de identidade, complementado por um fluxo customizado de solicitação de acesso.

*   **Login**: Realizado via e-mail e senha. Validado contra a tabela `profiles` para garantir que o usuário está ativo (`is_active: true`).
*   **Solicitar Acesso (Cadastro)**:
    *   Fluxo via componente `SafeAccessRequestForm`.
    *   O usuário fornece Nome, E-mail e define uma Senha.
    *   **Auto-Aprovação (Atual)**: Ao enviar a solicitação, o sistema cria imediatamente a conta no Supabase Auth e o perfil no banco de dados. O acesso é liberado no mesmo instante, realizando o login automático do usuário.
    *   **Tratamento de Duplicados**: Se um e-mail já registrado tentar solicitar acesso novamente, o sistema atualiza a senha para a nova fornecida e permite o login.
*   **Permissões**:
    *   **Admin**: Identificado pelo e-mail `pastororxiamorim@gmail.com` ou flag manual no banco (não implementada via UI para outros usuários).
    *   **Aluno Premium**: Flag `premium_access` que desbloqueia cursos marcados como indisponíveis para usuários gratuitos.
*   **Recuperação de Senha**: Fluxo de "Esqueci minha senha" que envia link de reset via Supabase.
*   **Gestão de Estado**:
    *   **Inativação/Bloqueio**: O admin pode desmarcar `is_active` no painel, impedindo o login.
    *   **Exclusão**: Admin pode excluir permanentemente um aluno (remove do Auth e do Banco).

---

## 2. PAINEL ADMINISTRATIVO (ADMIN AREA)

Acessível apenas para o administrador principal através da rota `/admin`.

*   **Aba Alunos**:
    *   Monitoramento em tempo real de presença e atividade.
    *   Busca por nome/e-mail.
    *   **Visualização de Senha**: Exibe a senha definida pelo aluno (armazenada em `desired_password` no perfil).
    *   **Gestão Direta**: Botões para Alternar Premium, Ativar/Inativar, Excluir e Alterar Senha.
    *   **Adicionar Aluno**: Criação direta de conta pelo admin (sem necessidade de solicitação).
*   **Aba Aguardando Aprovação**: Lista as solicitações na tabela `access_requests`. Útil para histórico e conferência de dados, mesmo com a auto-aprovação ligada.
*   **Aba Compradores Oficiais**:
    *   Gestão da tabela `official_buyers`.
    *   Permite marcar quem são os compradores reais (integração manual ou via webhook).
*   **Aba Conteúdos & Cursos**:
    *   Gestão de Módulos (Título, Descrição, Ordem, Dias para Desbloqueio).
    *   Gestão de Aulas (Título, Descrição, URL do Vídeo/Conteúdo, PDF).
*   **Aba Layout da Home**: Permite reordenar ou ocultar seções da tela inicial (Hero, Gamificação, Conquistas, etc.).
*   **Aba Anotações dos Alunos**: O admin pode visualizar todas as anotações feitas por todos os alunos do curso.
*   **Aba Diagnóstico Push**: Ferramenta para testar e validar o funcionamento das notificações via Firebase.

---

## 3. SISTEMA DE CURSOS E CONTEÚDO

*   **Estrutura**: Curso > Módulos > Aulas.
*   **Módulos**:
    *   Desbloqueio Progressivo: Configurado por `days_to_unlock` (dias após a data de "compra" do usuário).
    *   Progresso Visual: Barra de progresso por módulo.
*   **Aulas**:
    *   Suporte a vídeo (URL).
    *   Materiais Complementares: Download de PDFs vinculados.
    *   Navegação: Botão de "Próxima Aula" automática ao concluir.
*   **Progresso**:
    *   Tabela `lesson_progress` registra a conclusão de cada aula.
    *   Sistema de "Continuar de onde parou" na home (Hero CTA).
    *   Histórico de aulas concluídas visível no perfil.

---

## 4. SISTEMA DE INTELIGÊNCIA ARTIFICIAL (IA)

*   **Onde Existe**:
    *   **Modo Estudo**: Chat flutuante em cada aula.
    *   **Página Dedicada**: Rota `/assistente` para dúvidas gerais.
*   **Funcionamento**: Utiliza o Lovable AI Gateway para processar mensagens.
*   **Contexto**: A IA recebe informações sobre o curso para responder dúvidas técnicas de massoterapia.
*   **Limites**: Integrado ao saldo de tokens do projeto (Lovable).

---

## 5. SISTEMA DE ANOTAÇÕES (CADERNO DIGITAL)

*   **Para o Aluno**:
    *   Disponível em cada aula para anotações rápidas.
    *   Página centralizada `/anotacoes` para busca, edição, exclusão e favoritar notas.
*   **Armazenamento**: Tabela `lesson_notes` vinculando `user_id`, `lesson_id` e conteúdo.
*   **Para o Admin**: Visualização consolidada no painel administrativo para monitorar o engajamento.

---

## 6. SISTEMA DE GAMIFICAÇÃO (ENGAJAMENTO)

*   **XP (Pontos de Experiência)**:
    *   Ganhos por concluir aulas, completar desafios diários e login diário.
*   **Níveis**:
    *   Iniciante (0 XP)
    *   Intermediário (500 XP)
    *   Avançado (1500 XP)
    *   Especialista (3000 XP)
    *   Mestre (5000 XP)
*   **Conquistas (Badges)**:
    *   Emblemas automáticos ao concluir módulos específicos.
    *   Exibição em carrossel na home e no perfil.
*   **Desafios Diários**: Um desafio novo a cada dia que concede XP extra.
*   **Streaks (Ofensiva)**: Contador de dias seguidos de acesso.
*   **XP Discounts**: Tabela `course_xp_discounts` permite configurar descontos em outros produtos/cursos baseados no XP acumulado.

---

## 7. SISTEMA DE APOIO TÉCNICO

*   **Simulador de Atendimento (`/simulador`)**: Cenários interativos onde o aluno escolhe a melhor técnica para casos clínicos, recebendo feedback imediato.
*   **Protocolos de Atendimento (`/protocolos`)**: Guia passo a passo com tempos, técnicas e observações para diferentes patologias.
*   **Indicações e Contraindicações (`/indicacoes`)**: Base de conhecimento técnica sobre quando (e quando não) aplicar massoterapia.

---

## 8. INTEGRAÇÃO COM TELEGRAM

*   **Objetivo**: Notificar o administrador sobre novas solicitações de acesso.
*   **Gatilho**: Ocorre no momento da criação da solicitação em `createAccessRequest`.
*   **Resiliência**: Utiliza uma fila de notificações (`access_request_notification_queue`) com sistema de retentativas automáticas em caso de falha da API do Telegram.
*   **Configuração**: Depende das variáveis `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.

---

## 9. NAVEGAÇÃO E ROTAS

| Rota | Descrição |
| :--- | :--- |
| `/` | Home / Login / Cadastro |
| `/admin` | Painel Administrativo (Acesso Restrito) |
| `/cursos` | Listagem geral de módulos e progresso |
| `/modulo/$id` | Detalhes do módulo e lista de aulas |
| `/estudar` | Modo estudo (Player de vídeo e notas) |
| `/perfil` | Dados do aluno, XP, Nível e Histórico |
| `/anotacoes` | Gestão de todas as notas do aluno |
| `/assistente` | Chat full-screen com a IA |
| `/simulador` | Simulador de casos clínicos |
| `/protocolos` | Guia de protocolos de atendimento |
| `/indicacoes` | Guia de indicações técnicas |
| `/reset-password`| Fluxo de nova senha |

---

## 10. ESTRUTURA DO BANCO DE DADOS (SUPABASE)

### Principais Tabelas:
*   `profiles`: Dados do usuário, XP, senha visível, status.
*   `access_requests`: Registro de solicitações enviadas.
*   `official_buyers`: Lista branca de e-mails autorizados.
*   `managed_modules` / `managed_lessons`: Conteúdo do curso gerido pelo admin.
*   `lesson_progress`: Vínculo usuário-aula concluída.
*   `lesson_notes`: Anotações dos alunos.
*   `user_gamification`: Saldo de XP e nível.
*   `user_badges`: Emblemas conquistados.
*   `daily_login_streaks`: Dados de frequência de acesso.
*   `access_request_notification_queue`: Fila para integração Telegram.

### Triggers e Funções:
*   `update_updated_at_column`: Atualização automática de timestamps.
*   Políticas RLS: Proteção de dados para que alunos vejam apenas suas próprias notas e progresso.

---

## 11. CONFIGURAÇÕES E INFRAESTRUTURA

*   **Frontend**: React + Vite + Tailwind CSS + TanStack Router/Start.
*   **Backend**: Supabase (DB, Auth, Storage, Edge Functions).
*   **Notificações Push**: Firebase Cloud Messaging (FCM) configurado com Service Worker.
*   **PWA**: Aplicativo instalável via manifesto e Service Worker, com suporte a cache offline básico.
*   **Variáveis de Ambiente**:
    *   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
    *   `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`
    *   Configurações de Firebase (VAPID Key, API Key, etc.).

---

## 12. BUGS CORRIGIDOS E MELHORIAS RECENTES

*   **Erro de Usuário Já Registrado**: Corrigido bug onde a aprovação manual falhava se o usuário já tivesse sido auto-aprovado. Agora o sistema identifica o conflito e apenas atualiza os dados necessários.
*   **Sincronização Telegram**: Ajustado o envio para ser "inline" (aguardar a resposta) garantindo que a notificação chegue mesmo em ambientes de execução rápida (Edge Workers).
*   **Persistência de Senha**: Implementada a coluna `desired_password` para que o admin possa dar suporte a alunos que esquecem suas credenciais.

---

## 13. CHECKLIST DE FUNCIONALIDADES

- [x] Login e Cadastro funcional
- [x] Auto-aprovação de acesso
- [x] Notificação Telegram funcional
- [x] Dashboard Admin com gestão de alunos
- [x] Player de aulas com PDFs
- [x] Progresso de aulas e módulos
- [x] Sistema de XP e Níveis
- [x] Sistema de Conquistas (Badges)
- [x] Caderno de Anotações (Aluno e Admin)
- [x] Assistente IA (Aula e Geral)
- [x] Simulador de Casos Clínicos
- [x] Guia de Protocolos e Indicações
- [x] PWA (Instalável no celular)
- [x] Notificações Push (Firebase)

---
**Nota Final**: O "Sistema de Feed" (rede social interna) não foi encontrado no código atual e consta como pendente ou não solicitado nesta versão.
