## Sistema de XP, Conquistas e Descontos

Implementar gamificação completa integrada aos cursos, com desbloqueio de descontos via XP e controle administrativo.

### 1. Banco de dados (migration)

**Nova tabela `course_xp_discounts`** — configurações de desconto por curso (admin):
- `course_id` (uuid → managed_courses)
- `xp_required` (int) — XP necessário para desbloquear
- `discount_percent` (int) — % do desconto
- `discount_link` (text) — link promocional/checkout com desconto
- RLS: admins gerenciam, todos autenticados podem ler

**Nova tabela `user_xp_redemptions`** — registro de resgates:
- `user_id`, `course_id`, `xp_spent`, `discount_link`, `redeemed_at`
- RLS: usuário vê/insere os próprios; admin vê todos

**Nova tabela `daily_login_streaks`** — para badge "7 dias seguidos":
- `user_id` (unique), `current_streak`, `longest_streak`, `last_login_date`
- RLS: usuário vê/atualiza o próprio

**Função RPC `redeem_xp_discount(_course_id, _xp_required)`**:
- Verifica XP suficiente
- Debita XP de `user_gamification`
- Insere em `user_xp_redemptions`
- Retorna o link de desconto
- SECURITY DEFINER, atomic

### 2. XP — ganhos automáticos

Disparar `addPoints` em mais lugares:
- **+10 XP** ao concluir aula (já existe parcialmente em `useProgress.toggleLesson`)
- **+50 XP + badge** ao concluir módulo (já existe via `awardBadge`)
- **+5 XP** por login diário (novo hook `useDailyLogin`)
- **+20 XP** ao concluir desafio diário
- **+15 XP** ao concluir protocolo

### 3. Sistema de Badges expandido

Adicionar novos badges ao `MODULE_BADGES` / sistema:
- `first_login` — Primeiro Login
- `streak_7` — 7 Dias Seguidos
- `lessons_10` — 10 Aulas Assistidas
- `study_5h`, `study_10h` — Horas Estudadas (usa `student_engagement.total_usage_seconds`)
- Plus os badges existentes por módulo

Auto-conceder via hook `useBadgeChecker` que roda quando XP/progresso muda.

### 4. UI — GamificationBar (substituição de texto)

Substituir `"{xp} XP para {next.name}"` por:
**"Acumule XP e desbloqueie até 60% de desconto em nossos cursos"**

Mostrar 4 badges + botão "Ver mais conquistas" → abre `Dialog` com scroll horizontal de todos os badges (já existe `Dialog` no shadcn).

### 5. UI — Cursos (`/cursos`)

Para cada curso na listagem:
- Mostrar preço/link normal (visível sempre)
- Buscar `course_xp_discounts` correspondente
- Se `user.xp >= xp_required` E ainda não resgatou:
  - Mostrar botão amarelo: **"Aplicar XP e desbloquear desconto"**
  - Ao clicar → confirma → chama `redeem_xp_discount` → abre `discount_link` em nova aba
- Se `user.xp < xp_required`:
  - Mostrar progresso: "Faltam {x} XP para desbloquear {y}% de desconto"
- Se já resgatou: mostrar botão "Acessar oferta desbloqueada" (link salvo)

Adicionar título de seção: **"Aplicar XP e desbloquear desconto nos cursos"**

### 6. UI — Admin (`/admin`)

Apenas para `pastororxiamorim@gmail.com`:
- Nova aba/seção "Descontos XP" dentro de Cursos:
  - Para cada curso: campos para `xp_required`, `discount_percent`, `discount_link`
  - Botão salvar → upsert em `course_xp_discounts`

### 7. Arquivos afetados

**Criar:**
- `supabase/migrations/<timestamp>_xp_discounts.sql`
- `src/hooks/use-course-discounts.ts`
- `src/hooks/use-daily-login.ts`
- `src/components/course/AchievementsDialog.tsx`
- `src/components/admin/XpDiscountsManager.tsx`

**Editar:**
- `src/components/course/GamificationBar.tsx` — novo texto + botão "Ver mais"
- `src/hooks/use-gamification.ts` — novos badges, redeem helper
- `src/routes/cursos.tsx` — botão "Aplicar XP" por curso
- `src/routes/index.tsx` — disparar useDailyLogin
- `src/routes/admin.tsx` — aba descontos XP

### Detalhes técnicos

- `redeem_xp_discount`: lock otimista via `UPDATE ... WHERE xp >= _xp_required RETURNING xp`. Se não retornar linha → erro "XP insuficiente". Após sucesso, registrar em `user_xp_redemptions` para histórico.
- Login diário: comparar `last_login_date` vs hoje. Se diferença = 1 dia → incrementa streak; > 1 dia → reseta. Em ambos casos: +5 XP.
- Restrição admin: usar constante `PRINCIPAL_ADMIN_EMAIL` já presente em `admin.tsx`.
- Badges em rolagem lateral: container `flex overflow-x-auto snap-x` em vez de `flex-wrap`.